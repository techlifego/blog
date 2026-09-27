#!/usr/bin/env node
// 발행 전 점검: 글에 드러나면 안 되는 정보가 없는지 검사한다.
//
// 쓰는 법:
//   npm run check:post                      → src/content/posts/ 의 모든 글
//   npm run check:post -- 경로/글.md ...     → 지정한 파일만 (볼트 초안도 가능)
//
// 금지어 목록은 두 가지다.
//   1) 공개 목록: 이 파일 안의 일반 규칙 (연락처·주소 형태, 건강 치료 표현 등)
//   2) 개인 목록: 저장소 밖 파일 (실명, 아이 이름, 사는 지역, 본업 관련 단어 등)
//      공개 저장소에 올리면 안 되므로 여기 적지 않는다. 위치는 OPERATIONS.md 참고.
//      찾는 순서: 환경변수 BLOG_PRIVATE_WORDS → ../life-plan/60-projects/blog/private-words.txt
//      → /home/user/life-plan/60-projects/blog/private-words.txt
//      개인 목록을 못 찾으면 실패로 끝난다 (--no-private 로 건너뛸 수 있지만 발행 전에는 쓰지 않는다).
//
// 결과: ❌ 오류가 하나라도 있으면 종료 코드 1. ⚠️ 확인은 사람이 읽고 판단한다.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const noPrivate = args.includes('--no-private');
const files = args.filter((a) => !a.startsWith('--'));

// ── 공개 규칙 ──────────────────────────────────────────────
const RULES = [
  // 개인 식별 정보
  { level: 'error', name: '전화번호', re: /\b01[016789][-. ]?\d{3,4}[-. ]?\d{4}\b/g },
  { level: 'error', name: '주민등록번호 형태', re: /\b\d{6}[- ]?[1-4]\d{6}\b/g },
  { level: 'error', name: '이메일 주소', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, allow: [/@techlifego\.com$/] },
  { level: 'error', name: '상세 주소 (도로명·번지)', re: /[가-힣0-9]+(로|길)\s?\d+(-\d+)?(번길)?|\d+번지|\d+동\s?\d+호/g },
  { level: 'error', name: '자동차 번호판', re: /\b\d{2,3}[가-힣]\s?\d{4}\b/g },
  { level: 'warn', name: '학교 이름 (아이 학교가 드러나는지)', re: /[가-힣]{2,}(초등학교|중학교|고등학교|유치원|어린이집)/g },
  { level: 'warn', name: '아파트 단지 이름', re: /[가-힣A-Za-z]{2,}(아파트|APT|자이|푸르지오|래미안|힐스테이트|e편한세상)/g },
  // 건강·의료 (의료인이 쓴 건강 글 + 광고 = 의료법 문제)
  { level: 'error', name: '의료 효과 주장', re: /완치|효능|특효|치료\s?효과|처방|진단(을|해|받)|복용법|병이\s?낫/g },
  { level: 'warn', name: '건강·의료 단어 (치료 조언처럼 읽히지 않는지)', re: /치료|질환|증상|통증|면역력|다이어트\s?효과|영양제|건강기능식품|병원/g },
  // 사진
  { level: 'warn', name: '사진 (아이 얼굴·이름표·차 번호판·위치 정보 확인)', re: /!\[[^\]]*\]\([^)]+\)|<img\s/g },
];

// ── 개인 목록 ──────────────────────────────────────────────
function findPrivateList() {
  const candidates = [
    process.env.BLOG_PRIVATE_WORDS,
    resolve(root, '../life-plan/60-projects/blog/private-words.txt'),
    '/home/user/life-plan/60-projects/blog/private-words.txt',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

function loadPrivate(path) {
  // 형식: 한 줄에 한 단어. '#' 뒤는 주석. '[warn]' 줄 아래는 확인 수준, '[error]' 줄 아래는 오류 수준 (기본 오류).
  const out = [];
  let level = 'error';
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    if (line === '[warn]') { level = 'warn'; continue; }
    if (line === '[error]') { level = 'error'; continue; }
    out.push({ level, word: line });
  }
  return out;
}

// ── 파일 모으기 ────────────────────────────────────────────
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : ['.md', '.mdx'].includes(extname(p)) ? [p] : [];
  });
}

const targets = files.length ? files.map((f) => resolve(f)) : walk(join(root, 'src/content/posts'));
if (!targets.length) { console.log('점검할 글이 없습니다.'); process.exit(0); }

let privateWords = [];
const privatePath = findPrivateList();
if (privatePath) {
  privateWords = loadPrivate(privatePath);
} else if (!noPrivate) {
  console.error('❌ 개인 금지어 목록을 찾지 못했습니다. BLOG_PRIVATE_WORDS 환경변수로 위치를 알려 주세요. (OPERATIONS.md 참고)');
  process.exit(1);
} else {
  console.warn('⚠️ 개인 금지어 목록 없이 점검합니다 (--no-private). 발행 전 점검으로는 부족합니다.');
}

// ── 점검 ──────────────────────────────────────────────────
let errors = 0;
let warns = 0;

for (const file of targets) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const found = [];

  lines.forEach((line, i) => {
    for (const rule of RULES) {
      for (const m of line.matchAll(rule.re)) {
        if (rule.allow?.some((a) => a.test(m[0]))) continue;
        found.push({ level: rule.level, what: rule.name, hit: m[0], line: i + 1 });
      }
    }
    for (const { level, word } of privateWords) {
      if (line.toLowerCase().includes(word.toLowerCase())) {
        found.push({ level, what: '개인 금지어', hit: word, line: i + 1 });
      }
    }
  });

  // 머리말 확인
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (file.includes('src/content/posts')) {
    if (!fm) found.push({ level: 'error', what: '머리말(---) 없음', hit: '', line: 1 });
    else {
      for (const key of ['title', 'description', 'section', 'pubDate']) {
        if (!new RegExp(`^${key}:`, 'm').test(fm[1])) found.push({ level: 'error', what: `머리말에 ${key} 없음`, hit: '', line: 1 });
      }
      if (/^draft:\s*true/m.test(fm[1])) found.push({ level: 'warn', what: 'draft: true — 배포 사이트에 나오지 않음', hit: '', line: 1 });
    }
  }

  const e = found.filter((f) => f.level === 'error').length;
  const w = found.length - e;
  errors += e;
  warns += w;
  console.log(`\n${e ? '❌' : w ? '⚠️ ' : '✅'} ${file.replace(root + '/', '')}  (오류 ${e} · 확인 ${w})`);
  for (const f of found) {
    console.log(`   ${f.level === 'error' ? '❌' : '⚠️ '} ${f.line}행  ${f.what}${f.hit ? `: "${f.hit}"` : ''}`);
  }
}

console.log(`\n합계: 오류 ${errors} · 확인 ${warns}${privatePath ? '' : ' (개인 목록 없이)'}`);
process.exit(errors ? 1 : 0);

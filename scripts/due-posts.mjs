#!/usr/bin/env node
// 예약 발행 점검: 지난 N분 안에 발행 시각(pubDate)이 지난 글이 있으면 "due=true"를 출력한다.
// GitHub Actions(.github/workflows/scheduled-publish.yml)가 매시간 실행해, 있을 때만 Cloudflare 다시 배포를 부른다.
// 쓰는 법: node scripts/due-posts.mjs [분, 기본 75]
import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const windowMin = Number(process.argv[2] ?? 75);
const now = Date.now();
const dir = 'src/content/posts';
const due = [];
const upcoming = [];

for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const head = readFileSync(join(dir, f), 'utf8').split('---')[1] ?? '';
  if (/^draft:\s*true/m.test(head)) continue;
  const m = head.match(/^pubDate:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (!m) continue;
  const t = new Date(m[1].trim()).valueOf();
  if (Number.isNaN(t)) continue;
  if (t <= now && t > now - windowMin * 60_000) due.push(f);
  else if (t > now) upcoming.push(`${m[1].trim()}  ${f}`);
}

console.log(due.length ? `지금 공개될 글: ${due.join(', ')}` : '지금 공개될 글 없음');
if (upcoming.length) console.log('예약된 글:\n  ' + upcoming.sort().join('\n  '));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${due.length > 0}\n`);

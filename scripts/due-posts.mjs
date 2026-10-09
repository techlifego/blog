#!/usr/bin/env node
// 예약 발행 점검: 발행 시각(pubDate)이 지났는데 실제 사이트에 아직 없는 글이 있으면 "due=true"를 출력한다.
// GitHub Actions(.github/workflows/scheduled-publish.yml)가 매시간 실행해, 있을 때만 Cloudflare 다시 배포를 부른다.
// GitHub 예약 실행은 몇 시간씩 밀리거나 건너뛸 수 있으므로, 시간 창 대신 실제 사이트를 확인한다 (2026-10-09).
// 쓰는 법: node scripts/due-posts.mjs [사이트 주소, 기본 https://techlifego.com]
import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const site = (process.argv[2] ?? 'https://techlifego.com').replace(/\/$/, '');
const now = Date.now();
const dir = 'src/content/posts';
const missing = [];
const upcoming = [];

for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const head = readFileSync(join(dir, f), 'utf8').split('---')[1] ?? '';
  if (/^draft:\s*true/m.test(head)) continue;
  const m = head.match(/^pubDate:\s*["']?([^"'\n]+)["']?\s*$/m);
  const s = head.match(/^section:\s*["']?(\w+)/m);
  if (!m || !s) continue;
  const t = new Date(m[1].trim()).valueOf();
  if (Number.isNaN(t)) continue;
  if (t > now) { upcoming.push(`${m[1].trim()}  ${f}`); continue; }
  const url = `${site}/${s[1]}/${f.replace(/\.md$/, '')}/`;
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null);
  if (!res || res.status === 404) missing.push(url);
}

console.log(missing.length ? `발행 시각이 지났는데 사이트에 없는 글:\n  ${missing.join('\n  ')}` : '빠진 글 없음');
if (upcoming.length) console.log('예약된 글:\n  ' + upcoming.sort().join('\n  '));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${missing.length > 0}\n`);

import { getCollection, type CollectionEntry } from 'astro:content';
import type { SectionKey } from './site.config';

export type Post = CollectionEntry<'posts'>;

// 초안(draft: true)과 예약 글(pubDate가 빌드 시각보다 뒤)은 배포 빌드에서 빠진다.
// 예약 글은 그 시각이 지난 뒤 다음 빌드(.github/workflows/scheduled-publish.yml)에서 나타난다.
// 미리 보려면 SHOW_DRAFTS=1 로 실행 (초안·예약 글 모두 보임).
const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === '1' || process.env.SHOW_DRAFTS === '1';
const buildTime = Date.now();

export const isPublished = (p: Post) => !p.data.draft && p.data.pubDate.valueOf() <= buildTime;

export async function getPosts(section?: SectionKey): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => (showDrafts || isPublished(p)) && (!section || p.data.section === section));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (p: Post) => `/${p.data.section}/${p.id}/`;

// 날짜는 한국 시간으로 보여 준다 (빌드 서버는 UTC라 아침 예약 글이 전날로 찍히지 않게).
const kst = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
export const formatDate = (d: Date) => {
  const parts = Object.fromEntries(kst.formatToParts(d).map((x) => [x.type, x.value]));
  return `${parts.year}.${parts.month}.${parts.day}`;
};

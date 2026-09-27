import { getCollection, type CollectionEntry } from 'astro:content';
import type { SectionKey } from './site.config';

export type Post = CollectionEntry<'posts'>;

// 초안(draft: true)은 배포 빌드에서 빠진다. 미리 보려면 SHOW_DRAFTS=1 로 실행.
const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === '1' || process.env.SHOW_DRAFTS === '1';

export async function getPosts(section?: SectionKey): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => (showDrafts || !p.data.draft) && (!section || p.data.section === section));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (p: Post) => `/${p.data.section}/${p.id}/`;

export const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

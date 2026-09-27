import rss from '@astrojs/rss';
import { SITE, SECTIONS } from '../site.config';
import { getPosts, postUrl } from '../lib';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    customData: '<language>ko</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: postUrl(p),
      categories: [SECTIONS[p.data.section].name, ...p.data.tags],
    })),
  });
}

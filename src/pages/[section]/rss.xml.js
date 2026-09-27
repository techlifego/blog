import rss from '@astrojs/rss';
import { SITE, SECTIONS, SECTION_KEYS } from '../../site.config';
import { getPosts, postUrl } from '../../lib';

export function getStaticPaths() {
  return SECTION_KEYS.map((section) => ({ params: { section } }));
}

export async function GET(context) {
  const section = context.params.section;
  const info = SECTIONS[section];
  const posts = await getPosts(section);
  return rss({
    title: `${info.name} | ${SITE.name}`,
    description: info.description,
    site: context.site,
    customData: '<language>ko</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: postUrl(p),
      categories: p.data.tags,
    })),
  });
}

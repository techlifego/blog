import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    section: z.enum(['family', 'ai', 'essay', 'books']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    // 연재 이름과 순서 (예: "AI와 함께한 추석", 2)
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
  }),
});

export const collections = { posts };

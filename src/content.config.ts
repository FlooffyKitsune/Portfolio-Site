import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const workEntry = z.object({
	title: z.string(),
	description: z.string(),
	image: z.string(),
	stack: z.array(z.string()),
	links: z.array(
		z.object({
			href: z.string(),
			label: z.string(),
			iconKey: z.string()
		})
	),
	order: z.number()
});

const projectEntry = workEntry.extend({
	shortDescription: z.string().optional(),
	detailsPage: z.boolean().optional().default(false),
	featured: z.boolean().optional().default(false)
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: projectEntry
});

const portfolio = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
	schema: workEntry
});

export const collections = { projects, portfolio };

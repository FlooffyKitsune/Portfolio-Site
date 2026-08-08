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
	// Optional because a new project is often announced before a screenshot
	// exists — WorkCard renders a placeholder in its place. Portfolio's
	// `image` (via the unmodified `workEntry`) stays required.
	image: z.string().optional(),
	// Free-text tags (e.g. "Multiplayer", "Creative Direction") rendered as
	// plain pills — unlike `stack`, which is a list of icon keys. Not every
	// project tag has a sensible brand icon, so this is the mechanism for
	// projects whose tags are conceptual as much as technical.
	tags: z.array(z.string()).optional(),
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

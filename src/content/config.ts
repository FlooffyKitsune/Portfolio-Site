import { defineCollection, z } from 'astro:content';

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
	)
});

const projects = defineCollection({ type: 'content', schema: workEntry });
const portfolio = defineCollection({ type: 'content', schema: workEntry });

export const collections = { projects, portfolio };

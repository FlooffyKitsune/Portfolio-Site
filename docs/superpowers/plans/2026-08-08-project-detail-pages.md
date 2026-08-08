# Project Card Refinement & Optional Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine `WorkCard`'s visual hierarchy/spacing, add whole-card click-through to an optional per-project detail page, and add the `/projects/[slug]` route — without touching Portfolio's schema, content, or behavior.

**Architecture:** A `projects`-only schema extension in `content.config.ts`, a `detailsUrl` optional prop on `WorkCard` implementing the stretched-link pattern, a small change to `projects.astro` to pass that prop conditionally, and a new dynamic route that statically generates only for entries with `detailsPage: true`.

**Tech Stack:** Astro 7 content-layer collections (`glob()` loader, `getCollection`, `getStaticPaths`, `render()` for Markdown body), SCSS (`@use`), existing `HeroTitle` component, existing icon lookup (no new icons needed).

## Global Constraints

- Zero changes to `portfolio`'s schema, content, page, or `WorkCard` behavior when consumed without a `detailsUrl` prop.
- Zero changes to About, Skills, Contact, or the homepage.
- No rewriting of existing project `description` text and no new `shortDescription`/Markdown body content authored for the 3 existing entries — schema fields are added optional, existing entries validate unchanged.
- No `slug` schema field — use the content-layer's `entry.id` (filename-derived) as the route param throughout.
- No rename of `stack`→`technologies` or `links`→`github`/`demo`.
- `WorkCard`'s stretched-link pattern: `.work-card { position: relative; }`, the title anchor gets `::after { content: ''; position: absolute; inset: 0; }`, `.work-links { position: relative; z-index: 1; }` so action chips stay independently clickable above the overlay.
- `getStaticPaths` in the new route filters to `entry.data.detailsPage === true` — no route is generated for any other entry.
- Detail page reuses existing components/tokens only (`HeroTitle`, `$space-*`, `$color-*`, `$radius-*`, `$glass-border`, `$font-sans`) — no new shared component extraction, no new dependency.
- No test file — this codebase's test suite covers 3D-hero logic only (see `src/lib/three/*.test.ts`); no other page/route has dedicated tests. Verification is `npm run test` (regression, must stay 18/18), `npm run build` (must succeed; since no current entry sets `detailsPage: true`, the build generates zero `/projects/[slug]` routes — that's the correct, expected result), and computed-output/HTML inspection. Task 4 verifies the route mechanism itself by temporarily toggling `detailsPage: true` on a local, uncommitted copy of one entry, then reverting it — no content change to any entry is committed by this plan.

---

### Task 1: Extend the `projects` schema

**Files:**
- Modify: `src/content.config.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `projectEntry` schema type consumed by `getCollection('projects')` call sites (`src/pages/projects.astro`, the new `src/pages/projects/[slug].astro` in Task 4). Shape: `workEntry` fields (`title`, `description`, `image`, `stack`, `links`, `order`) plus `shortDescription?: string`, `detailsPage: boolean` (default `false`), `featured: boolean` (default `false`).

- [ ] **Step 1: Add the extended schema**

In `src/content.config.ts`, replace the full file contents with:

```ts
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
```

Note: `portfolio`'s `defineCollection` call is byte-identical to today —
only `projects` now points at `projectEntry` instead of `workEntry`.

- [ ] **Step 2: Verify the schema compiles against existing content unchanged**

Run `npm run build`. Expect success with zero content-file changes —
the new `shortDescription`/`detailsPage`/`featured` fields are all
optional/defaulted, so the 3 existing entries (none of which set them)
validate exactly as before. This is deliberate: per the brief, no new
project content is authored in this plan, and no existing entry is
switched into `detailsPage: true` as part of it — the schema is fully
built and ready, but every current project keeps today's exact card
behavior (no card-wide link, no route) until a real detail page is
authored later, by editing project data directly, outside this plan.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: add optional detail-page fields to the projects schema"
```

---

### Task 2: Add stretched-link click-through and spacing refinements to `WorkCard`

**Files:**
- Modify: `src/components/ui/WorkCard.astro`

**Interfaces:**
- Consumes: unchanged (`icons` lookup).
- Produces: `Props` gains one new optional field: `detailsUrl?: string`. Consumed by `src/pages/projects.astro` (Task 3). `src/pages/portfolio.astro` is not modified and will simply never pass this prop, so its rendering is provably unchanged.

- [ ] **Step 1: Add the `detailsUrl` prop and title link**

In `src/components/ui/WorkCard.astro`, change the frontmatter and the
`<h2>` line:

```astro
---
import { icons } from './icons';

interface Props {
	title: string;
	description: string;
	image: string;
	stack: string[];
	links: { href: string; label: string; iconKey: string }[];
	detailsUrl?: string;
}

const { title, description, image, stack, links, detailsUrl } = Astro.props;
---

<article class="work-card">
	<div class="work-image">
		<img src={image} alt={`${title} preview`} loading="lazy" />
	</div>
	<div class="work-content">
		<h2>
			{detailsUrl ? <a class="work-title-link" href={detailsUrl}>{title}</a> : title}
		</h2>
		<p>{description}</p>
		<div class="work-stack">
			{
				stack.map((key) => {
					const Icon = icons[key];
					return (
						<span class="stack-tag">
							<Icon />
						</span>
					);
				})
			}
		</div>
		<div class="work-links">
			{
				links.map((link) => {
					const Icon = icons[link.iconKey];
					return (
						<a href={link.href} target="_blank" rel="noopener noreferrer">
							<Icon />
							<span>{link.label}</span>
						</a>
					);
				})
			}
		</div>
	</div>
</article>
```

- [ ] **Step 2: Replace the `<style>` block**

Replace the full `<style lang="scss">` block with:

```scss
<style lang="scss">
	@use '../../styles/tokens' as *;

	.work-card {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid $glass-border;
		border-radius: $radius-md;
		background: $color-surface;
		overflow: hidden;
		transition:
			border-color $duration-hover $ease-out-quick,
			transform $duration-hover $ease-out-quick,
			box-shadow $duration-hover $ease-out-quick;

		&:hover,
		&:focus-within {
			border-color: rgba($color-accent, 0.4);
			transform: translateY(-4px);
			box-shadow: 0 12px 28px -16px rgba(0, 0, 0, 0.5);

			.work-image img {
				transform: scale(1.04);
			}
		}

		.work-image {
			aspect-ratio: 16 / 9;
			overflow: hidden;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				display: block;
				transition: transform 0.3s $ease-out-quick;
			}
		}

		.work-content {
			display: flex;
			flex-direction: column;
			flex: 1;
			padding: $space-5;
			gap: $space-3;

			h2 {
				font-family: $font-sans;
				font-weight: $font-weight-heading;
				font-size: 1.375rem;
				color: $color-text;
				margin: 0;
			}

			.work-title-link {
				color: inherit;
				text-decoration: none;

				// Stretched-link pattern: the whole card becomes this
				// anchor's hit area without wrapping the entire card markup
				// (including the nested GitHub/Demo links) in an <a>, which
				// would be invalid HTML (no nested interactive content).
				&::after {
					content: '';
					position: absolute;
					inset: 0;
				}

				&:hover,
				&:focus-visible {
					color: $color-accent;
				}
			}

			p {
				font-family: $font-sans;
				font-size: $font-size-body;
				color: $color-text-muted;
				line-height: 1.6;
				margin: 0;
				display: -webkit-box;
				-webkit-line-clamp: 4;
				-webkit-box-orient: vertical;
				overflow: hidden;
			}

			.work-stack {
				display: flex;
				flex-wrap: wrap;
				gap: $space-1;

				.stack-tag {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: $space-1;
					border: 1px solid rgba($color-accent, 0.2);
					border-radius: $radius-sm;
					background: rgba($color-accent, 0.08);
					color: $color-text-muted;
					font-size: 1.1rem;
				}
			}

			.work-links {
				position: relative;
				z-index: 1;
				display: flex;
				flex-wrap: wrap;
				gap: $space-2;
				margin-top: auto;
				padding-top: $space-2;

				a {
					display: flex;
					align-items: center;
					gap: $space-1;
					padding: $space-1 $space-3;
					border: 1px solid rgba($color-accent, 0.25);
					border-radius: $radius-sm;
					background: rgba($color-accent, 0.08);
					color: $color-text;
					font-family: $font-sans;
					font-size: $font-size-caption;
					text-decoration: none;
					transition: border-color $duration-hover $ease-out-quick;

					&:hover,
					&:focus-visible {
						border-color: rgba($color-accent, 0.6);
					}
				}
			}
		}
	}
</style>
```

Note on the `position: relative; z-index: 1;` added to `.work-links`:
without it, the stretched `::after` overlay (which has no explicit
`z-index` but comes later in paint order as part of the title, itself
earlier in the DOM than `.work-links`) would not actually need it since
`.work-links` is a later sibling in the same stacking context and later
DOM order alone would already paint on top for equal `z-index: auto`
elements — but `z-index: 1` makes the intent explicit and removes any
ambiguity if the overlay's stacking is later changed. Kept for
robustness per the plan's Global Constraints.

- [ ] **Step 3: Verify visually**

At this point no entry has `detailsUrl` wired up yet (Task 3 does that),
so `WorkCard` cannot be exercised end-to-end with a real link here.
Confirm instead, via `npm run build && npm run preview` on `/projects`
and `/portfolio`:
- All cards on both pages render identically to before this task —
  same spacing (now marginally more generous), same title size (now
  `1.375rem`), titles are still plain text, no card is clickable as a
  whole. This is the expected state for every current entry, since none
  passes `detailsUrl`.

- [ ] **Step 4: Run the test suite and commit**

Run: `npm run test` — expect `18 passed (18)`.

```bash
git add src/components/ui/WorkCard.astro
git commit -m "feat: add stretched-link click-through and refine WorkCard spacing"
```

---

### Task 3: Pass `detailsUrl` from `projects.astro`

**Files:**
- Modify: `src/pages/projects.astro`

**Interfaces:**
- Consumes: `WorkCard`'s new `detailsUrl?: string` prop (Task 2); `entry.id` and `entry.data.detailsPage` from `getCollection('projects')` (Task 1's schema).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Pass `detailsUrl` conditionally**

In `src/pages/projects.astro`, change the `entries.map(...)` block from:

```astro
{
	entries.map((entry) => (
		<div data-reveal>
			<WorkCard
				title={entry.data.title}
				description={entry.data.description}
				image={entry.data.image}
				stack={entry.data.stack}
				links={entry.data.links}
			/>
		</div>
	))
}
```

to:

```astro
{
	entries.map((entry) => (
		<div data-reveal>
			<WorkCard
				title={entry.data.title}
				description={entry.data.description}
				image={entry.data.image}
				stack={entry.data.stack}
				links={entry.data.links}
				detailsUrl={entry.data.detailsPage ? `/projects/${entry.id}` : undefined}
			/>
		</div>
	))
}
```

`src/pages/portfolio.astro` is not modified — its `WorkCard` usages
never pass `detailsUrl`, so Portfolio cards are unaffected regardless of
Task 2's changes.

- [ ] **Step 2: Verify and commit**

Run `npm run test` (`18 passed (18)`) and `npm run build` (success).

```bash
git add src/pages/projects.astro
git commit -m "feat: link Projects cards to their detail page when available"
```

---

### Task 4: Add the `/projects/[slug]` detail-page route

**Files:**
- Create: `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: `getCollection`, `render` from `astro:content`; `HeroTitle` (`Props { title: string; size?: 'display'|'h1'; supporting?: string }`); `icons` lookup from `src/components/ui/icons.ts` (unchanged, no new keys).
- Produces: nothing consumed elsewhere — leaf dynamic route.

- [ ] **Step 1: Create the route file**

Create `src/pages/projects/[slug].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import HeroTitle from '../../components/ui/HeroTitle.astro';
import { icons } from '../../components/ui/icons';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
	const entries = await getCollection('projects');
	return entries
		.filter((entry) => entry.data.detailsPage)
		.map((entry) => ({
			params: { slug: entry.id },
			props: { entry }
		}));
}

const { entry } = Astro.props;
const { title, description, shortDescription, image, stack, links } = entry.data;
const { Content } = await render(entry);
---

<BaseLayout title={`${title} — Jarrett Dominic`}>
	<section id="project-detail">
		<a class="back-link" href="/projects">← Back to Projects</a>
		<HeroTitle title={title} size="h1" supporting={shortDescription ?? description} />
		<div class="hero-image">
			<img src={image} alt={`${title} preview`} />
		</div>
		<div class="meta-row">
			<div class="work-stack">
				{
					stack.map((key) => {
						const Icon = icons[key];
						return (
							<span class="stack-tag">
								<Icon />
							</span>
						);
					})
				}
			</div>
			<div class="work-links">
				{
					links.map((link) => {
						const Icon = icons[link.iconKey];
						return (
							<a href={link.href} target="_blank" rel="noopener noreferrer">
								<Icon />
								<span>{link.label}</span>
							</a>
						);
					})
				}
			</div>
		</div>
		<p class="description">{description}</p>
		<div class="body-content">
			<Content />
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@use '../../styles/tokens' as *;

	#project-detail {
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		padding: $space-8 $space-5;
		display: flex;
		flex-direction: column;
		gap: $space-5;

		:global(.hero-title h1) {
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;
			background-clip: text;
		}

		.back-link {
			align-self: flex-start;
			color: $color-text-muted;
			font-family: $font-sans;
			font-size: $font-size-caption;
			text-decoration: none;
			transition: color $duration-hover $ease-out-quick;

			&:hover,
			&:focus-visible {
				color: $color-accent;
			}
		}

		.hero-image {
			border-radius: $radius-md;
			overflow: hidden;
			max-height: 28rem;

			img {
				width: 100%;
				height: 100%;
				max-height: 28rem;
				object-fit: cover;
				display: block;
			}
		}

		.meta-row {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			gap: $space-3;

			.work-stack {
				display: flex;
				flex-wrap: wrap;
				gap: $space-1;

				.stack-tag {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: $space-1;
					border: 1px solid rgba($color-accent, 0.2);
					border-radius: $radius-sm;
					background: rgba($color-accent, 0.08);
					color: $color-text-muted;
					font-size: 1.25rem;
				}
			}

			.work-links {
				display: flex;
				flex-wrap: wrap;
				gap: $space-2;

				a {
					display: flex;
					align-items: center;
					gap: $space-1;
					padding: $space-2 $space-4;
					border: 1px solid rgba($color-accent, 0.25);
					border-radius: $radius-sm;
					background: rgba($color-accent, 0.08);
					color: $color-text;
					font-family: $font-sans;
					font-size: $font-size-body;
					text-decoration: none;
					transition: border-color $duration-hover $ease-out-quick;

					&:hover,
					&:focus-visible {
						border-color: rgba($color-accent, 0.6);
					}
				}
			}
		}

		.description {
			font-family: $font-sans;
			font-size: $font-size-body-lg;
			color: $color-text-muted;
			line-height: 1.6;
			margin: 0;
		}

		.body-content {
			font-family: $font-sans;
			color: $color-text-muted;
			line-height: 1.6;

			:global(h2) {
				font-family: $font-sans;
				font-weight: $font-weight-heading;
				font-size: $font-size-h2;
				color: $color-text;
				margin: $space-5 0 $space-2;
			}

			:global(h3) {
				font-family: $font-sans;
				font-weight: $font-weight-heading;
				font-size: $font-size-body-lg;
				color: $color-text;
				margin: $space-4 0 $space-2;
			}

			:global(p) {
				margin: 0 0 $space-3;
			}

			:global(ul),
			:global(ol) {
				margin: 0 0 $space-3;
				padding-left: $space-4;
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#project-detail {
			padding: $space-6 $space-4;
			text-align: center;

			.meta-row {
				flex-direction: column;
				align-items: center;
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify with a temporary, uncommitted toggle**

First, confirm the "off" state is correct: run `npm run build`. Expect
success with **zero** `/projects/[slug]/` routes generated, since no
current entry sets `detailsPage: true` — this is the correct default
behavior for every existing project.

Then verify the "on" path end-to-end without committing any content
change: temporarily edit the in-memory/working-tree copy of
`src/content/projects/h2g2.md` to add `detailsPage: true` (no other
field changes — leave `shortDescription` and the Markdown body absent,
since that's the honest current state of every real entry, and this
also exercises the "gracefully omit missing sections" path). Run
`npm run build`, confirm exactly one route now generates:
`/projects/h2g2/index.html`. Run `npm run dev`, navigate to
`/projects/h2g2`, confirm:
- "← Back to Projects" link returns to `/projects`.
- Title renders with the warm gradient; the supporting line falls back
  to the full `description` text (since no `shortDescription` is set).
- Hero image, tech-stack badges, and GitHub/Demo chips render.
- The `description` paragraph renders.
- No "optional section" content area renders below it (empty body),
  and nothing looks broken or leaves a visible gap where it would go.
- Navigate to `/projects/yt-app` (no `detailsPage`) directly — confirm
  this 404s (no route was generated), matching "do not create
  unnecessary routes."

After verifying, **revert** `src/content/projects/h2g2.md` to its
original committed content (`git checkout -- src/content/projects/h2g2.md`)
so this plan commits zero content changes to any project entry.

If the dev server output looks wrong in a way that contradicts this
plan's CSS/HTML, cross-check against `npm run build && npm run preview`
before concluding there's a real bug — this project's dev server has a
known history of stale/incomplete HMR CSS mid-session.

- [ ] **Step 3: Run the full test suite, build, and commit**

Run: `npm run test` — expect `18 passed (18)`.
Run: `npm run build` — expect success.

```bash
git add src/pages/projects/[slug].astro
git commit -m "feat: add optional project detail-page route"
```

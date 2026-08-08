# Projects & Portfolio Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `WorkCard.astro` and the `projects.astro`/`portfolio.astro` page shells off legacy pre-2026 styling onto the current design system, with no layout or content changes.

**Architecture:** One shared-component rewrite (`WorkCard.astro`) consumed identically by two page shells, each of which adopts `HeroTitle` with its own heading copy and wires `data-reveal` onto each rendered card.

**Tech Stack:** Astro 7, SCSS (`@use` module syntax), `astro:content` collections (`getCollection`), the shared `revealOnScroll`/`[data-reveal]` motion system (`src/lib/motion/reveal.ts`), `unplugin-icons` icon lookup (`src/components/ui/icons.ts` — no changes needed, all icon keys used by existing content entries already exist there).

## Global Constraints

- No layout restructure: case-study rows (image beside content, stacked vertically) stay exactly as they are today — not a grid.
- No content/copy changes to `src/content/projects/*.md` or `src/content/portfolio/*.md` — same titles, descriptions, images, stack icons, links.
- No changes to the content collection schema.
- No new shared components — reuse `HeroTitle` (`src/components/ui/HeroTitle.astro`, `Props { eyebrow?, title, supporting?, size?: 'display'|'h1' }`) only.
- Migrate fully off legacy tokens in all three files: no `$font-heading`, `$font-body`, `$gradient-purple`, `@import '../styles/tokens'` (or `'../../styles/tokens'` from `WorkCard.astro`) — use `@use '...' as *` and canonical names (`$font-sans`, `$color-accent`, `$color-text`, `$color-text-muted`, `$color-surface`, `$space-*`, `$radius-*`, `$glass-border`, `$font-weight-heading`, `$duration-hover`, `$ease-out-quick`, `$breakpoint-mobile`, `$gradient-warm`).
- `WorkCard`'s card surface: `border: 1px solid $glass-border; background: $color-surface; border-radius: $radius-md; overflow: hidden;` — no drop-shadow, no whole-card hover effect (the card holds multiple independent links, so hover affordance stays on the links themselves).
- `WorkCard`'s link chips: `border: 1px solid rgba($color-accent, 0.25); background: rgba($color-accent, 0.08);` at rest, `border-color: rgba($color-accent, 0.6)` on hover/focus-visible — the same recipe already used for Skills' chips.
- Each `HeroTitle`'s `h1` gets `:global()` `background-image: $gradient-warm; -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;` — the same treatment used on About/Skills/Contact.
- Each rendered `WorkCard` instance carries `data-reveal`.
- No dedicated test file — this codebase's test suite (`src/lib/three/*.test.ts`) covers 3D-hero logic only; no other migrated page has page-level tests. Verification is `npm run test` (regression, must stay 18/18 passing), `npm run build` (must succeed, `/projects/index.html` and `/portfolio/index.html` must be generated), and a manual visual/computed-style check.

---

### Task 1: Redesign `WorkCard.astro`

**Files:**
- Modify: `src/components/ui/WorkCard.astro` (full rewrite of the `<style>` block; markup structure unchanged except adding `data-reveal` is NOT here — that's added by the consuming pages in Tasks 2/3, since `data-reveal` marks each rendered instance, not the component definition itself)

**Interfaces:**
- Consumes: `icons` lookup from `src/components/ui/icons.ts` (unchanged — no new keys needed).
- Produces: `Props { title: string; description: string; image: string; stack: string[]; links: { href: string; label: string; iconKey: string }[] }` — unchanged, consumed by `projects.astro` and `portfolio.astro` in Tasks 2/3.

- [ ] **Step 1: Replace the `<style>` block**

Replace the full contents of the `<style lang="scss">` block in
`src/components/ui/WorkCard.astro` with:

```scss
<style lang="scss">
	@use '../../styles/tokens' as *;

	.work-card {
		display: flex;
		flex-direction: row;
		border: 1px solid $glass-border;
		border-radius: $radius-md;
		background: $color-surface;
		overflow: hidden;
		margin: $space-4 0;

		img {
			width: 35%;
			height: auto;
			object-fit: cover;
		}

		.work-content {
			width: 65%;
			display: flex;
			flex-direction: column;
			padding: $space-4;
			gap: $space-2;

			.work-header {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				gap: $space-2;

				h2 {
					font-family: $font-sans;
					font-weight: $font-weight-heading;
					font-size: $font-size-h2;
					color: $color-text;
					margin: 0;
				}

				.work-stack {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: $space-1;
					flex-shrink: 0;

					span {
						display: flex;
						align-items: center;
						font-size: 1.25rem;
						color: $color-text-muted;
					}
				}
			}

			p {
				font-family: $font-sans;
				font-size: $font-size-body-lg;
				color: $color-text-muted;
				line-height: 1.6;
				margin: 0;
			}

			.work-links {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				gap: $space-2;
				margin-top: $space-1;

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
	}

	@media screen and (max-width: $breakpoint-mobile) {
		.work-card {
			flex-direction: column;
			margin: $space-4 0;

			img {
				width: 100%;
			}

			.work-content {
				width: 100%;
				text-align: center;

				.work-header {
					flex-direction: column;
					gap: $space-2;
				}

				.work-links {
					justify-content: center;
				}
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify visually**

Run `npm run dev`, navigate to `/projects` (any page consuming `WorkCard`
still works with the old page-shell markup at this point — this task
only changes the component's styling, not its markup or props). Confirm:
- Cards render with a hairline border and `$color-surface` background,
  no drop-shadow.
- Title, description, stack icons, and link chips use the new sizing —
  no more oversized `2.5rem`/`1.5rem` raw text.
- Link chips are bordered/tinted, not solid gradient pills, and brighten
  their border on hover.
- Narrow the viewport below 768px and confirm cards stack to a single
  column with centered content.

If the dev server output looks wrong in a way that contradicts this
plan's CSS, cross-check against `npm run build && npm run preview`
before concluding there's a real bug — this project's dev server has a
known history of stale/incomplete HMR CSS mid-session.

- [ ] **Step 3: Run the test suite and commit**

Run: `npm run test` — expect `18 passed (18)`, unchanged from before this
task (no test covers this component).

```bash
git add src/components/ui/WorkCard.astro
git commit -m "feat: restyle WorkCard with the 2026 design system"
```

---

### Task 2: Restyle `projects.astro`

**Files:**
- Modify: `src/pages/projects.astro` (full rewrite of both the markup and the `<style>` block)

**Interfaces:**
- Consumes: `HeroTitle` (`Props { title: string; size?: 'display'|'h1'; supporting?: string }`); `WorkCard` from Task 1 (`Props { title, description, image, stack, links }`, unchanged); `getCollection('projects')` from `astro:content` (unchanged).
- Produces: nothing consumed by other files — leaf page route.

- [ ] **Step 1: Replace the frontmatter and markup**

Replace the full contents of `src/pages/projects.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroTitle from '../components/ui/HeroTitle.astro';
import WorkCard from '../components/ui/WorkCard.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Projects — Jarrett Dominic">
	<section id="projects">
		<HeroTitle
			title="Projects"
			size="h1"
			supporting="Software and web projects I've built end to end, from quick experiments to full applications."
		/>
		<div class="work-wrapper">
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
		</div>
	</section>
</BaseLayout>
```

Note: `data-reveal` wraps each `WorkCard` in its own `<div>` rather than
being added inside `WorkCard.astro` itself, because `WorkCard.astro` is a
plain presentational component with no reveal wiring of its own today —
wrapping at the call site keeps that component free of a hard dependency
on the reveal system, consistent with how `about.astro` wraps its own
`data-reveal` at the page level rather than inside a shared component.

- [ ] **Step 2: Replace the `<style>` block**

Replace the existing `<style lang="scss">` block with:

```scss
<style lang="scss">
	@use '../styles/tokens' as *;

	#projects {
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: $space-8 $space-5;

		:global(.hero-title h1) {
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;
			background-clip: text;
		}

		.work-wrapper {
			display: flex;
			flex-direction: column;
			margin-top: $space-6;
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#projects {
			padding: $space-6 $space-4;
			text-align: center;
		}
	}
</style>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`, navigate to `/projects`, and confirm:
- Heading reads "Projects" with the warm gradient text-fill, followed by
  the supporting line.
- All three project entries (H2G2, YT-App, Portfolio) render as restyled
  `WorkCard`s beneath it, each fading/sliding in on scroll.
- Mobile viewport: heading and cards center correctly.

- [ ] **Step 4: Run the test suite, build, and commit**

Run: `npm run test` — expect `18 passed (18)`.
Run: `npm run build` — expect success, `/projects/index.html` generated.

```bash
git add src/pages/projects.astro
git commit -m "feat: restyle Projects page with the 2026 design system"
```

---

### Task 3: Restyle `portfolio.astro`

**Files:**
- Modify: `src/pages/portfolio.astro` (full rewrite of both the markup and the `<style>` block)

**Interfaces:**
- Consumes: same as Task 2 (`HeroTitle`, `WorkCard`, `getCollection('portfolio')`).
- Produces: nothing consumed by other files — leaf page route.

- [ ] **Step 1: Replace the frontmatter and markup**

Replace the full contents of `src/pages/portfolio.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroTitle from '../components/ui/HeroTitle.astro';
import WorkCard from '../components/ui/WorkCard.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('portfolio')).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Portfolio — Jarrett Dominic">
	<section id="portfolio-work">
		<HeroTitle
			title="Portfolio"
			size="h1"
			supporting="Commissioned design and creative work — branding, illustration, and visual identity for clients."
		/>
		<div class="work-wrapper">
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
		</div>
	</section>
</BaseLayout>
```

- [ ] **Step 2: Replace the `<style>` block**

Replace the existing `<style lang="scss">` block with:

```scss
<style lang="scss">
	@use '../styles/tokens' as *;

	#portfolio-work {
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: $space-8 $space-5;

		:global(.hero-title h1) {
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;
			background-clip: text;
		}

		.work-wrapper {
			display: flex;
			flex-direction: column;
			margin-top: $space-6;
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#portfolio-work {
			padding: $space-6 $space-4;
			text-align: center;
		}
	}
</style>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`, navigate to `/portfolio`, and confirm:
- Heading reads "Portfolio" with the warm gradient text-fill, followed by
  the supporting line.
- All three portfolio entries (35 Below, Caffeine, Miscellaneous Work)
  render as restyled `WorkCard`s beneath it, each fading/sliding in on
  scroll.
- Mobile viewport: heading and cards center correctly.

- [ ] **Step 4: Run the test suite, build, and commit**

Run: `npm run test` — expect `18 passed (18)`.
Run: `npm run build` — expect success, `/portfolio/index.html` generated.

```bash
git add src/pages/portfolio.astro
git commit -m "feat: restyle Portfolio page with the 2026 design system"
```

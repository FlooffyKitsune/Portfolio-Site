# Contact Page Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `src/pages/contact.astro` on the current 2026 design system (tokens, `HeroTitle`, glass-pill chrome, scroll-reveal) with byte-identical content — no new components, no copy changes.

**Architecture:** Single-file change. Replace the page's legacy `@import`-based SCSS and flat markup with `@use '../styles/tokens' as *`, a `HeroTitle` for the heading, and hand-styled email-link/social-icon-row markup wrapped in `data-reveal`.

**Tech Stack:** Astro 7, SCSS (`@use` module syntax), the shared `revealOnScroll`/`[data-reveal]` motion system (`src/lib/motion/reveal.ts`), `unplugin-icons` icon lookup (`src/components/ui/icons.ts`).

## Global Constraints

- Content is byte-for-byte unchanged: heading text "Contact", supporting line "Have a project in mind or just want to say hi? Reach out.", email address `jarrettdominic@proton.me`, GitHub URL `https://github.com/FlooffyKitsune`, LinkedIn URL `https://www.linkedin.com/in/jarrett-dominic/`.
- No new shared components — reuse `HeroTitle` only (`src/components/ui/HeroTitle.astro`, `Props { eyebrow?, title, supporting?, size?: 'display'|'h1' }`).
- No new icon entries — `mdi/email`, `mdi/github`, `mdi/linkedin` already exist in `src/components/ui/icons.ts` and are already imported by the current `contact.astro`.
- Layout is flat/cardless (no `Callout` wrapper) — heading, email link, and social-icon row stacked directly on the page background, matching the current page's overall shape.
- Migrate fully off legacy tokens: no `$font-heading`, `$font-body`, `$color-hover-accent`, or `@import '../styles/tokens'` — use `@use '../styles/tokens' as *` and canonical names (`$font-sans`, `$color-accent`, `$color-text`, `$color-text-muted`, `$space-*`, `$radius-*`, `$glass-*`, `$duration-hover`, `$ease-out-quick`, `$breakpoint-mobile`, `$gradient-warm`).
- Heading gets the same `:global(.hero-title h1) { background-image: $gradient-warm; ... }` text-fill treatment already used in `about.astro` and `skills.astro`, for visual consistency across the three migrated pages.
- Social icon buttons: circular, `2.75rem` diameter, glass-pill chrome (`background: $glass-fill; border: 1px solid $glass-border; backdrop-filter: blur($glass-blur);`), icon glyph at `1.25rem` centered inside, `border-color` brightening to `rgba($color-accent, 0.6)` on hover over `$duration-hover` with `$ease-out-quick`.
- Email link: `$font-size-h2`, `$color-text` at rest, transitions to `$color-accent` on hover over `$duration-hover`/`$ease-out-quick`.
- No dedicated test file — this codebase's existing test suite (`src/lib/three/*.test.ts`) covers 3D-hero logic only; no other migrated page (About, Skills) has page-level tests. Verification is `npm run test` (regression, must stay 18/18 passing), `npm run build` (must succeed), and a manual visual check.

---

### Task 1: Rebuild `contact.astro` on the current design system

**Files:**
- Modify: `src/pages/contact.astro` (full rewrite of both the markup and the `<style>` block)

**Interfaces:**
- Consumes: `HeroTitle` from `src/components/ui/HeroTitle.astro` (`Props { title: string; size?: 'display'|'h1'; supporting?: string }`); `icons` lookup from `src/components/ui/icons.ts` (keys `'mdi/email'`, `'mdi/github'`, `'mdi/linkedin'`, already present — no changes to that file).
- Produces: nothing consumed by other files — `contact.astro` is a leaf page route.

- [ ] **Step 1: Replace the frontmatter and markup**

Replace the full contents of `src/pages/contact.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroTitle from '../components/ui/HeroTitle.astro';
import { icons } from '../components/ui/icons';

const EmailIcon = icons['mdi/email'];
const GithubIcon = icons['mdi/github'];
const LinkedinIcon = icons['mdi/linkedin'];
---

<BaseLayout title="Contact — Jarrett Dominic">
	<section id="contact">
		<HeroTitle
			title="Contact"
			size="h1"
			supporting="Have a project in mind or just want to say hi? Reach out."
		/>
		<div class="contact-links" data-reveal>
			<a class="email-link" href="mailto:jarrettdominic@proton.me">
				<EmailIcon /><span>jarrettdominic@proton.me</span>
			</a>
			<div class="social-links">
				<a
					class="social-icon"
					href="https://github.com/FlooffyKitsune"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
				>
					<GithubIcon />
				</a>
				<a
					class="social-icon"
					href="https://www.linkedin.com/in/jarrett-dominic/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn"
				>
					<LinkedinIcon />
				</a>
			</div>
		</div>
	</section>
</BaseLayout>
```

Note: `aria-label` on the icon-only social links is a minimal accessibility
necessity for icon-only buttons (there's no visible text label to announce
otherwise) — the current page has the same gap today, this just closes it
as part of the rewrite rather than leaving it. It is not new scope beyond
what "restyle these links" already implies.

- [ ] **Step 2: Replace the `<style>` block**

Replace the existing `<style lang="scss">` block with:

```scss
<style lang="scss">
	@use '../styles/tokens' as *;

	#contact {
		width: 100%;
		min-height: 30rem;
		padding: $space-8 $space-5;
		background-color: $color-bg;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: $space-6;

		:global(.hero-title) {
			align-items: center;
		}

		:global(.hero-title h1) {
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;
			background-clip: text;
		}

		.contact-links {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: $space-4;
		}

		.email-link {
			display: flex;
			align-items: center;
			gap: $space-2;
			font-family: $font-sans;
			font-weight: $font-weight-heading;
			font-size: $font-size-h2;
			color: $color-text;
			text-decoration: none;
			transition: color $duration-hover $ease-out-quick;

			&:hover {
				color: $color-accent;
			}
		}

		.social-links {
			display: flex;
			gap: $space-3;
		}

		.social-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2.75rem;
			height: 2.75rem;
			border-radius: 50%;
			background: $glass-fill;
			border: 1px solid $glass-border;
			backdrop-filter: blur($glass-blur);
			-webkit-backdrop-filter: blur($glass-blur);
			color: $color-text;
			font-size: 1.25rem;
			transition: border-color $duration-hover $ease-out-quick;

			&:hover {
				border-color: rgba($color-accent, 0.6);
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#contact {
			padding: $space-6 $space-4;
		}
	}
</style>
```

`:global(.hero-title)` needs `align-items: center` here because
`HeroTitle`'s own root is `display: flex; flex-direction: column;` with no
`align-items` set (it defaults to `stretch`, which is fine for the
left-aligned About/Skills usage but would stretch the eyebrow/h1/supporting
to full width here, defeating `text-align: center` on their inline
content). Centering `align-items` on the flex container centers each child
block instead.

- [ ] **Step 3: Verify visually**

Run `npm run dev`, navigate to `/contact`, and confirm:
- Heading reads "Contact" with the warm gradient text-fill, centered.
- Supporting line renders below it, centered, muted color.
- Email link shows the icon + full address, centered, turns accent-purple on hover.
- Two circular glass-pill buttons (GitHub, LinkedIn) sit in a row below, brighten on hover.
- Both social links still open their correct external URLs in a new tab.
- The email link still opens the system mail client (`mailto:`).
- Resize to a narrow viewport (or use dev-tools device toolbar) and confirm the layout stays centered and doesn't overflow.

If the dev server output looks wrong in a way that contradicts this plan's
CSS, cross-check against `npm run build && npm run preview` before
concluding there's a real bug — this project's dev server has a known
history of stale/incomplete HMR CSS mid-session.

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: `3 passed (3)` test files, `18 passed (18)` tests — this task
touches no code any existing test covers, so the count must stay exactly
as it is today. A change here would mean something outside `contact.astro`
was unintentionally touched.

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: build succeeds, `/contact/index.html` is generated among the
output routes, no new errors or warnings beyond the pre-existing Sass
`@import` deprecation notices from other not-yet-migrated pages.

- [ ] **Step 6: Commit**

```bash
git add src/pages/contact.astro
git commit -m "feat: restyle Contact page with the 2026 design system"
```

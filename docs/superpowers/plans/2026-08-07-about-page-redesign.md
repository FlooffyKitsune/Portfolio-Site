# About Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the still-legacy About page (`src/pages/about.astro`) with the Design Foundation's tokens, scoped SCSS conventions, and scroll-reveal motion system, without changing its content.

**Architecture:** A single-file, atomic rewrite of `about.astro` — new two-column grid markup (photo + copy), migrated from `@import` to `@use '../styles/tokens' as *`, dropping the retired `$gradient-warm` underline, and wiring the section into the site's existing `[data-reveal]` scroll-reveal system (already wired globally by `BaseLayout.astro` — no per-page script needed).

**Tech Stack:** Astro, SCSS (`@use`), the site's existing `src/lib/motion/reveal.ts` scroll-reveal primitive (via the `[data-reveal]` attribute, no direct import needed in this file).

## Global Constraints

- Bio copy (both paragraphs) and the "About Me" heading text are unchanged verbatim — this is a visual restyle only, not a content rewrite.
- No new content sections (no stats row, no timeline, no quick-facts) — out of scope per the spec.
- Migrate `@import '../styles/tokens'` → `@use '../styles/tokens' as *` (this file is being rewritten in full regardless, so there's no reason to leave the deprecated form).
- Drop `$gradient-warm` entirely from this file — not replaced with an equivalent decorative underline; type hierarchy alone carries the heading now.
- Photo radius: `$radius-md` (not the old hardcoded `50px`).
- CV button: solid `$gradient-accent` pill (not the glass-pill style), `$radius-md` radius, hover changes brightness on the same gradient (no second gradient to swap to).
- Bio paragraphs: `$font-size-body-lg` / `$color-text-muted`, not capped at `$prose-max-width` (the two-column grid already narrows the column enough).
- Two-column grid (`1fr 1fr`) on desktop, single column (photo above copy) below `$breakpoint-mobile` (768px) — matching `FeatureSection.astro`'s own breakpoint behavior, but implemented as page-local markup, not through that shared component (its `description` prop is a single string; About's two paragraphs are on different topics and should stay visually separate).
- Whole two-column block is one `[data-reveal]` unit (fades + slides up on scroll via the site's existing `revealOnScroll`/`initRevealElements` system) — no manual GSAP wiring needed in this file, `BaseLayout.astro` already calls `initRevealElements()`/`teardownRevealElements()` on `astro:page-load`/`astro:before-swap` for every `[data-reveal]` element on the page.
- Formatting: tabs, single quotes, no trailing commas, 100 print width (`.prettierrc`).
- No automated test for this page (established project convention for presentational Astro components — verified via typecheck/build/manual browser check instead).

---

### Task 1: Rewrite `about.astro`

**Files:**
- Modify: `src/pages/about.astro` (full replacement)

**Interfaces:**
- Consumes: `icons['basil/document-solid']` from `../components/ui/icons` (unchanged import, existing export).
- Produces: nothing new — this is a leaf page, no other file depends on its internals. The `[data-reveal]` attribute is consumed by the already-existing, unmodified `src/lib/motion/reveal.ts` / `BaseLayout.astro` wiring.

This task replaces the file in one atomic step (markup + styles) rather than being split further — the new grid markup and its styles are tightly coupled, and there's no meaningful intermediate state worth its own commit.

- [ ] **Step 1: Replace `src/pages/about.astro` in full**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';

const DocumentIcon = icons['basil/document-solid'];
---

<BaseLayout title="About — Jarrett Dominic">
	<section id="about">
		<div class="about-grid" data-reveal>
			<img src="/images/jarrett.png" alt="Jarrett Dominic" />
			<div class="about-copy">
				<h1>About Me</h1>
				<p>
					I'm a versatile developer with a primary focus on front-end development. In addition to
					my expertise in crafting user-friendly interfaces, I bring valuable experience in backend
					development and graphic design to the table. My coding journey is fueled by a genuine
					passion for creating digital experiences that seamlessly blend aesthetics and
					functionality. From developing interactive web applications to designing captivating user
					interfaces, I thrive on turning ideas into reality.
				</p>
				<p>
					Beyond the screen, I enjoy working on DIY projects and building things from scratch, as
					well as working with virtual reality. When not immersed in the digital world, you can find
					me pursuing outdoor adventures whether it be mountain biking or rock climbing.
				</p>
				<a
					class="resume-button"
					href="/pdf/JarrettDominicResume.pdf"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span>Download CV</span><DocumentIcon />
				</a>
			</div>
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@use '../styles/tokens' as *;

	#about {
		width: 100%;
		padding: $space-8 0;
		background-color: $color-bg;

		.about-grid {
			max-width: 72rem;
			margin: 0 auto;
			padding: 0 $space-5;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: $space-6;
			align-items: center;

			img {
				width: 100%;
				height: auto;
				aspect-ratio: 1 / 1;
				object-fit: cover;
				border-radius: $radius-md;
				display: block;
			}

			.about-copy {
				display: flex;
				flex-direction: column;
				gap: $space-2;

				h1 {
					font-family: $font-sans;
					font-weight: $font-weight-heading;
					font-size: $font-size-h1;
					color: $color-text;
					margin: 0;
				}

				p {
					font-family: $font-sans;
					font-size: $font-size-body-lg;
					color: $color-text-muted;
					line-height: 1.6;
					margin: 0;
				}

				.resume-button {
					align-self: flex-start;
					margin-top: $space-2;
					display: flex;
					align-items: center;
					gap: $space-1;
					padding: $space-2 $space-4;
					border-radius: $radius-md;
					background: $gradient-accent;
					color: $color-text;
					font-family: $font-sans;
					font-weight: $font-weight-heading;
					font-size: $font-size-body;
					text-decoration: none;
					transition: filter $duration-hover $ease-out-quick;

					&:hover {
						filter: brightness(1.1);
					}
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#about {
			padding: $space-6 0;

			.about-grid {
				grid-template-columns: 1fr;
				text-align: center;

				img {
					max-width: 16rem;
					margin: 0 auto;
				}

				.about-copy {
					align-items: center;

					.resume-button {
						align-self: center;
					}
				}
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify it typechecks and builds**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors.

- [ ] **Step 3: Verify formatting**

```bash
npx prettier --check src/pages/about.astro
```

If it reports issues, run `npx prettier --write src/pages/about.astro` and re-check — the code above was written by hand and may not exactly match this project's `.prettierrc` (tabs, single quotes, no trailing commas, 100 width).

- [ ] **Step 4: Manual browser check — desktop**

Run `npm run dev`, load `http://localhost:4321/about` on a desktop-width viewport. Expected:
- Photo (rounded corners, not a hard square) on one side, heading + both bio paragraphs + a solid accent-gradient "Download CV" button on the other, arranged side by side.
- The whole block fades and slides up into view as it scrolls into the viewport (or is already in view and animates in shortly after the page loads) — not instantly visible with no animation.
- Hovering the CV button brightens it slightly; clicking it opens `/pdf/JarrettDominicResume.pdf` in a new tab.
- No leftover trace of the old orange/pink underline under the heading.

- [ ] **Step 5: Manual browser check — mobile and reduced motion**

Resize below 768px (or use device emulation): photo stacks above the copy, everything center-aligned, CV button centered. Emulate `prefers-reduced-motion: reduce` and reload: the section should appear instantly in its final state (no fade/slide), consistent with how every other `[data-reveal]` element on this site already behaves under reduced motion — no page-specific reduced-motion handling should be needed here, since `initRevealElements()` already gates on it globally.

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: restyle About page with the 2026 design system"
```

---

### Task 2: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated check**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run test
npm run build
npm run lint
```

Expected: all five pass with no errors.

- [ ] **Step 2: Full manual pass**

Repeat Task 1's Steps 4-5 once more against the final committed state (not mid-development), to catch anything that regressed. Additionally: navigate to `/about` via a client-side link from another page (e.g. click "About" in the header from `/`) and confirm the reveal animation still plays correctly on a client-side navigation, not just a full page load — and navigate away and back again to confirm it replays correctly each time (this site's `[data-reveal]` system is shared/global and already has its own remount-safety tests elsewhere, but a quick confirmation here costs little).

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in About page redesign final verification pass"
```

(Skip this step if Steps 1-2 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** Layout (two-column grid, page-local markup following `FeatureSection`'s conventions without literally using it) — Task 1. Photo treatment (`$radius-md`, adaptive sizing) — Task 1. Heading (plain `<h1>`, new type tokens, no `$gradient-warm`) — Task 1. Bio paragraphs (unchanged text, `$font-size-body-lg`/`$color-text-muted`, no `$prose-max-width` cap) — Task 1. CV button (solid `$gradient-accent` pill, `$radius-md`, brightness-shift hover) — Task 1. Responsive collapse to single column — Task 1 (CSS) + Task 1 Step 5 (verification). Motion (`[data-reveal]` entrance) — Task 1 (markup) + Task 1 Step 4-5 (verification). Out-of-scope items (content rewrite, new sections, shared-component extraction) — correctly absent from both tasks.
- **Type consistency:** N/A — this plan touches no shared types/interfaces, only one page's markup and scoped styles.
- **No placeholders:** Task 1's code block is the complete, real file content — no "similar to the old version" shortcuts.

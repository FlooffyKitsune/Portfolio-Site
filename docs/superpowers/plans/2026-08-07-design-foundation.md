# Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's design tokens, add a GSAP-based motion system, and build five shared components (`HeroTitle`, `SectionIntro`, `StatCard`, `Callout`, `FeatureSection`) — the foundation every future page-redesign sub-project builds on. No existing page under `src/pages/` is modified in this pass.

**Architecture:** Design tokens live in `src/styles/tokens.scss` as SCSS variables. Legacy token names still referenced by unmigrated pages are kept defined (values updated where the spec calls for it, so old pages inherit the new palette/type automatically; a few renamed as aliases) so nothing currently on `main` breaks. A small `src/lib/motion/` module wraps GSAP + ScrollTrigger behind a `revealOnScroll` primitive, gated by `prefers-reduced-motion` via `gsap.matchMedia()`, wired into Astro's `<ClientRouter/>` lifecycle (`astro:page-load`/`astro:before-swap`) from `BaseLayout.astro` so it survives client-side navigation — the same lifecycle bug class the 3D hero already hit and fixed once, applied proactively here. Five new Astro components in `src/components/ui/` consume the tokens and motion system; `Header.astro` gets a sticky/glass treatment using the same lifecycle pattern; `Footer.astro` gets a small token cleanup.

**Tech Stack:** Astro 7, Svelte 5 (unaffected by this plan), SCSS, GSAP 3 + ScrollTrigger, Fontsource (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`).

## Global Constraints

- No file under `src/pages/` is created, deleted, or modified in this plan — page redesigns are separate future sub-projects.
- These legacy SCSS token names are referenced by unmigrated pages/components and MUST remain defined and functional throughout every task in this plan (verified via repo-wide grep before this plan was written): `$color-bg`, `$color-surface`, `$color-text`, `$color-hover-accent`, `$gradient-purple`, `$gradient-warm`, `$font-heading`, `$font-heading-serif`, `$font-body`, `$breakpoint-mobile`. `$color-accent-purple`, `$color-accent-purple-dark`, `$color-header-bg`, `$color-shadow` are referenced ONLY by `Header.astro` (grep-confirmed) and may be retired once Task 9 stops referencing them — not before.
- No hardcoded colors, fonts, or spacing values in any new or modified `<style>` block — everything through `tokens.scss` (existing repo-wide convention, enforced in code review during the 3D hero plan).
- Every GSAP animation must respect `prefers-reduced-motion` via `gsap.matchMedia()` — reduced-motion visitors get the final state applied instantly, never a shorter/faster version of the same tween.
- Any script that sets up scroll listeners, ScrollTriggers, or other page-lifecycle state must hook `astro:page-load` (setup, fires on first load and every client-side navigation) and `astro:before-swap` (teardown, fires before the DOM is replaced) — this site uses `<ClientRouter/>` site-wide (`BaseLayout.astro`), which does not re-run inline/module scripts on navigation. This exact bug (a script that only ran once, plus a leaked, never-torn-down render loop) was found and fixed in the 3D hero's final review; this plan applies that lesson from the start instead of rediscovering it.
- No automated test suite exists or is added for this UI work, consistent with this project's established convention — verification is `npm run check` + `npm run build` + a manual browser check, kept minimal (per explicit prior guidance that browser-automation/Playwright checks are credit-heavy — use only where a claim genuinely can't be verified by reading code or build output).
- Formatting: tabs, single quotes, no trailing commas, 100 print width (`.prettierrc`) — run `npm run lint`/`prettier --write` before committing.
- Astro/Svelte component internals are NOT deep-typechecked by `npm run check` alone in this repo (known gap, discovered during the 3D hero plan) — also run `npx svelte-check --tsconfig ./tsconfig.json` wherever a task touches `.astro` or `.svelte` files (all of them, in this plan).

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `gsap`, `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` available as installed dependencies. Task 2 imports the two font packages; Task 3 imports `gsap`.

- [ ] **Step 1: Install the packages**

```bash
npm install gsap @fontsource-variable/geist @fontsource-variable/geist-mono
```

Expected: all three added to `package.json` `dependencies`, `package-lock.json` regenerated, 0 vulnerabilities reported.

- [ ] **Step 2: Verify the install didn't break anything**

```bash
npm run check
npm run build
```

Expected: both pass with no errors — nothing imports these packages yet, so this just confirms the install itself is clean.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gsap and Geist font dependencies"
```

---

### Task 2: Design tokens and Geist font loading

**Files:**
- Modify: `src/styles/tokens.scss` (full replacement)
- Modify: `src/layouts/BaseLayout.astro:1-24` (font loading)

**Interfaces:**
- Consumes: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` (Task 1).
- Produces: every token listed below. Tasks 3-10 consume `$font-sans`, `$font-mono`, `$color-accent`, `$color-hover-accent`, `$color-text-muted`, `$space-*`, `$radius-*`, `$shadow-soft`, `$glass-*`, `$ease-*`, `$duration-*`, `$font-size-*`, `$prose-max-width`. All pre-existing legacy names (see Global Constraints) remain defined.

This task is one atomic change: the font FILES being loaded (Task 1's packages, wired in `BaseLayout.astro`) and the font TOKEN VALUES that reference them (`tokens.scss`) must change together — if the token names pointed at Geist while the old Google Fonts `<link>` were still the only thing loaded (or vice versa), pages would silently fall back to a system font with no visible error.

- [ ] **Step 1: Replace `src/styles/tokens.scss` in full**

```scss
// Design tokens — single source of truth for color, type, spacing, motion.
// Dark theme only. Near-black base + single violet accent (2026 modernization pass).
//
// Legacy names below ($font-heading, $font-heading-serif, $font-body, $gradient-purple)
// are aliased to their modern replacements so pages not yet migrated to the new
// components keep compiling and inherit the new palette/type automatically. New work
// should reference the canonical names ($font-sans, $font-mono, $gradient-accent, etc.)
// directly.
//
// $color-accent-purple, $color-accent-purple-dark, $color-header-bg, and $color-shadow
// are Header.astro's own legacy tokens, left untouched here — Header.astro (and these
// four) are updated/retired in a later task in this same plan, not this one.
//
// $gradient-warm keeps its original value, unaliased — it's a true legacy holdout used
// by every page's current section-heading underline, slated for removal page-by-page
// as each page gets its own future redesign pass (out of scope here).

// --- Color ---
$color-bg: #0a0a0c;
$color-surface: #16171b;
$color-text: #f2f2f4;
$color-text-muted: #8b8d98;

$color-accent: #8b5cf6;
$color-hover-accent: #a78bfa;

$color-accent-purple: #b288c0; // legacy — Header.astro only, see file header
$color-accent-purple-dark: #63458a; // legacy — Header.astro only
$color-header-bg: #23272a; // legacy — Header.astro only
$color-shadow: #00000059; // legacy — Header.astro only

$gradient-accent: linear-gradient(to right top, #a78bfa, #8b5cf6, #7c3aed);
$gradient-purple: $gradient-accent; // legacy alias

$gradient-warm: linear-gradient(to right top, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f); // legacy, unaliased

// --- Typography ---
$font-sans: 'Geist Variable', sans-serif;
$font-mono: 'Geist Mono Variable', monospace;

$font-heading: $font-sans; // legacy alias
$font-heading-serif: $font-sans; // legacy alias
$font-body: $font-sans; // legacy alias

$font-size-display: clamp(2.5rem, 6vw, 6rem);
$font-size-h1: clamp(2rem, 4vw, 3.5rem);
$font-size-h2: clamp(1.5rem, 2.5vw, 2.25rem);
$font-size-body-lg: clamp(1.125rem, 1.5vw, 1.375rem);
$font-size-body: 1rem;
$font-size-caption: 0.875rem;

$prose-max-width: 65ch;

// --- Spacing (8px base) ---
$space-1: 0.5rem;
$space-2: 1rem;
$space-3: 1.5rem;
$space-4: 2rem;
$space-5: 2.5rem;
$space-6: 3rem;
$space-7: 3.5rem;
$space-8: 4rem;

// --- Radius ---
$radius-sm: 6px;
$radius-md: 12px;

// --- Shadow / glass ---
$shadow-soft: 0 20px 60px -20px rgba(0, 0, 0, 0.5);
$glass-blur: 16px;
$glass-fill: rgba(242, 242, 244, 0.06);
$glass-border: rgba(242, 242, 244, 0.1);

// --- Motion ---
$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
$ease-out-quick: cubic-bezier(0.33, 1, 0.68, 1);
$duration-reveal: 0.8s;
$duration-hover: 0.2s;

// --- Breakpoints ---
$breakpoint-mobile: 768px;
```

- [ ] **Step 2: Swap font loading in `src/layouts/BaseLayout.astro`**

In the frontmatter (top of file), add the font imports alongside the existing imports:

```astro
---
import Header from '../components/ui/Header.astro';
import Footer from '../components/ui/Footer.astro';
import { ClientRouter } from 'astro:transitions';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../styles/global.scss';

interface Props {
	title: string;
}

const { title } = Astro.props;
---
```

In the `<head>`, remove the Google Fonts preconnect and stylesheet `<link>` tags (the two font families they loaded, Ubuntu/Unna/Inknut Antiqua, are no longer referenced by any token after Step 1):

```astro
<!doctype html>
<html lang="en" style="scroll-behavior: smooth;">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>{title}</title>
		<ClientRouter />
	</head>
	<body>
		<Header />
		<slot />
		<Footer />
		<script>
			import { consoleLogo, consoleLogoStyle } from '../lib/console-logo';
			console.log(consoleLogo, consoleLogoStyle);
		</script>
	</body>
</html>
```

- [ ] **Step 3: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: all pass, 0 errors.

- [ ] **Step 4: Manual visual check**

```bash
npm run dev
```

Open `http://localhost:4321/` (and one other page, e.g. `/about`) in a browser. Expected: text renders in Geist (a clean grotesque sans, not a serif and not the browser's default system font — open devtools' computed-style panel on any heading and confirm `font-family` resolves to `"Geist Variable"`, not a fallback), background is near-black, no console errors about missing fonts.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.scss src/layouts/BaseLayout.astro
git commit -m "feat: modernize design tokens and switch to Geist"
```

---

### Task 3: Motion system core

**Files:**
- Create: `src/lib/motion/gsap-setup.ts`
- Create: `src/lib/motion/reduced-motion.ts`
- Create: `src/lib/motion/reveal.ts`
- Modify: `src/layouts/BaseLayout.astro` (page-load/before-swap wiring)

**Interfaces:**
- Consumes: `gsap` (Task 1), `$ease-out-expo`/`$duration-reveal` intent from `tokens.scss` (Task 2 — matched conceptually via GSAP's built-in `expo.out` ease, not imported directly since SCSS variables aren't available in `.ts`).
- Produces: `revealOnScroll(element: Element, options?: RevealOptions): void` and `initRevealElements(): void` / `teardownRevealElements(): void`, both from `src/lib/motion/reveal.ts`. Tasks 4-8 (the five shared components) call `revealOnScroll` is NOT called directly by components — instead each component marks its root with a `data-reveal` attribute, and `initRevealElements()` (wired into `BaseLayout.astro`'s `astro:page-load` listener) queries and wires up every `[data-reveal]` element on the page. This avoids every component shipping its own duplicate lifecycle-wiring script.

- [ ] **Step 1: Create `src/lib/motion/gsap-setup.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
```

- [ ] **Step 2: Create `src/lib/motion/reduced-motion.ts`**

```ts
import { gsap } from './gsap-setup';

/**
 * Runs `animate` normally, or `instant` (final-state-only, no tween) when the
 * visitor prefers reduced motion. Wrap every non-essential scroll/entrance
 * animation in this so reduced-motion visitors get immediate state changes
 * instead of the animation playing anyway at a shorter duration.
 */
export function withReducedMotion(animate: () => void, instant: () => void) {
	const mm = gsap.matchMedia();

	mm.add(
		{
			reduce: '(prefers-reduced-motion: reduce)',
			motionOk: '(prefers-reduced-motion: no-preference)'
		},
		(context) => {
			const conditions = context.conditions as { reduce: boolean };
			if (conditions.reduce) {
				instant();
			} else {
				animate();
			}
		}
	);

	return mm;
}
```

- [ ] **Step 3: Create `src/lib/motion/reveal.ts`**

```ts
import { gsap, ScrollTrigger } from './gsap-setup';
import { withReducedMotion } from './reduced-motion';

export interface RevealOptions {
	/** Pixels to slide up from. Defaults to 24. */
	y?: number;
	/** Seconds. Defaults to 0.8, matching the $duration-reveal token. */
	duration?: number;
	/** ScrollTrigger `start` value. Defaults to entering the bottom 15% of the viewport. */
	start?: string;
}

const REVEAL_SELECTOR = '[data-reveal]';

/**
 * Fades and slides `element` in as it scrolls into view — the default
 * section-entrance animation. Uses `expo.out`, the closest built-in GSAP ease
 * to the `$ease-out-expo` CSS token, so scroll reveals and CSS hover
 * transitions read as one motion system. Respects `prefers-reduced-motion`.
 */
export function revealOnScroll(element: Element, options: RevealOptions = {}) {
	const { y = 24, duration = 0.8, start = 'top 85%' } = options;

	return withReducedMotion(
		() => {
			gsap.from(element, {
				autoAlpha: 0,
				y,
				duration,
				ease: 'expo.out',
				scrollTrigger: {
					trigger: element,
					start
				}
			});
		},
		() => {
			gsap.set(element, { autoAlpha: 1, y: 0 });
		}
	);
}

/**
 * Wires up every `[data-reveal]` element currently in the DOM. Called on
 * `astro:page-load` (BaseLayout.astro) — this site uses `<ClientRouter/>`,
 * so this must re-run on every client-side navigation, not just the first
 * load, or elements on pages navigated to client-side would never animate.
 */
export function initRevealElements() {
	document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
		revealOnScroll(element);
	});
}

/**
 * Kills every ScrollTrigger created by `initRevealElements`. Called on
 * `astro:before-swap` (BaseLayout.astro), before the outgoing page's DOM
 * (and the elements these triggers are attached to) is discarded — without
 * this, triggers would accumulate and double-fire across navigations.
 */
export function teardownRevealElements() {
	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
```

- [ ] **Step 4: Wire the lifecycle into `src/layouts/BaseLayout.astro`**

Add a second inline `<script>` block (after the existing console-logo one), and import the two lifecycle functions:

```astro
		<script>
			import { consoleLogo, consoleLogoStyle } from '../lib/console-logo';
			console.log(consoleLogo, consoleLogoStyle);
		</script>
		<script>
			import { initRevealElements, teardownRevealElements } from '../lib/motion/reveal';

			document.addEventListener('astro:page-load', initRevealElements);
			document.addEventListener('astro:before-swap', teardownRevealElements);
		</script>
	</body>
</html>
```

- [ ] **Step 5: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: all pass, 0 errors. (No `[data-reveal]` elements exist yet — Tasks 4-8 add the first ones — so there's nothing to visually check yet; this step confirms the wiring itself compiles and builds cleanly.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/motion src/layouts/BaseLayout.astro
git commit -m "feat: add GSAP-based scroll-reveal motion system"
```

---

### Task 4: `HeroTitle` component

**Files:**
- Create: `src/components/ui/HeroTitle.astro`

**Interfaces:**
- Consumes: `tokens.scss` (Task 2) tokens directly; `data-reveal` convention (Task 3) — no direct import, just the attribute.
- Produces: `HeroTitle` with `Props { eyebrow?: string; title: string; supporting?: string; size?: 'display' | 'h1' }`. Renders exactly one `<h1>` — every future page using this component must not render a second `<h1>` of its own.

- [ ] **Step 1: Create `src/components/ui/HeroTitle.astro`**

```astro
---
interface Props {
	eyebrow?: string;
	title: string;
	supporting?: string;
	size?: 'display' | 'h1';
}

const { eyebrow, title, supporting, size = 'display' } = Astro.props;
---

<div class="hero-title" data-reveal>
	{eyebrow && <p class="eyebrow">{eyebrow}</p>}
	<h1 class:list={[size]}>{title}</h1>
	{supporting && <p class="supporting">{supporting}</p>}
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.hero-title {
		display: flex;
		flex-direction: column;
		gap: $space-2;

		.eyebrow {
			font-family: $font-mono;
			font-size: $font-size-caption;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: $color-text-muted;
			margin: 0;
		}

		h1 {
			font-family: $font-sans;
			font-weight: 600;
			line-height: 1.05;
			color: $color-text;
			margin: 0;

			&.display {
				font-size: $font-size-display;
			}

			&.h1 {
				font-size: $font-size-h1;
			}
		}

		.supporting {
			font-family: $font-sans;
			font-size: $font-size-body-lg;
			color: $color-text-muted;
			max-width: $prose-max-width;
			margin: 0;
		}
	}
</style>
```

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors. (Not yet used by any page, so no visual check — Astro will still typecheck and build an unused component fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/HeroTitle.astro
git commit -m "feat: add HeroTitle component"
```

---

### Task 5: `SectionIntro` component

**Files:**
- Create: `src/components/ui/SectionIntro.astro`

**Interfaces:**
- Consumes: `tokens.scss` (Task 2), `data-reveal` convention (Task 3).
- Produces: `SectionIntro` with `Props { eyebrow?: string; title: string; description?: string }`. Renders one `<h2>` — intended to replace the current per-page gradient-underline section heading pattern in each page's own future redesign.

- [ ] **Step 1: Create `src/components/ui/SectionIntro.astro`**

```astro
---
interface Props {
	eyebrow?: string;
	title: string;
	description?: string;
}

const { eyebrow, title, description } = Astro.props;
---

<div class="section-intro" data-reveal>
	{eyebrow && <p class="eyebrow">{eyebrow}</p>}
	<h2>{title}</h2>
	{description && <p class="description">{description}</p>}
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.section-intro {
		display: flex;
		flex-direction: column;
		gap: $space-1;
		margin-bottom: $space-6;

		.eyebrow {
			font-family: $font-mono;
			font-size: $font-size-caption;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: $color-accent;
			margin: 0;
		}

		h2 {
			font-family: $font-sans;
			font-weight: 600;
			font-size: $font-size-h2;
			color: $color-text;
			margin: 0;
		}

		.description {
			font-family: $font-sans;
			font-size: $font-size-body-lg;
			color: $color-text-muted;
			max-width: $prose-max-width;
			margin: 0;
		}
	}
</style>
```

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SectionIntro.astro
git commit -m "feat: add SectionIntro component"
```

---

### Task 6: `StatCard` component

**Files:**
- Create: `src/components/ui/StatCard.astro`

**Interfaces:**
- Consumes: `tokens.scss` (Task 2), `data-reveal` convention (Task 3).
- Produces: `StatCard` with `Props { value: string; label: string }`. No card border/background by default (bare number/label pair, per the design spec).

- [ ] **Step 1: Create `src/components/ui/StatCard.astro`**

```astro
---
interface Props {
	value: string;
	label: string;
}

const { value, label } = Astro.props;
---

<div class="stat-card" data-reveal>
	<p class="value">{value}</p>
	<p class="label">{label}</p>
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: $space-1;

		.value {
			font-family: $font-mono;
			font-size: $font-size-h1;
			font-weight: 500;
			color: $color-text;
			margin: 0;
		}

		.label {
			font-family: $font-sans;
			font-size: $font-size-caption;
			color: $color-text-muted;
			margin: 0;
		}
	}
</style>
```

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StatCard.astro
git commit -m "feat: add StatCard component"
```

---

### Task 7: `Callout` component

**Files:**
- Create: `src/components/ui/Callout.astro`

**Interfaces:**
- Consumes: `tokens.scss` (Task 2), `data-reveal` convention (Task 3).
- Produces: `Callout` with `Props { title?: string }` and a default slot for body content. The one component in this set with a visible border, per the "cards only when they improve readability" rule.

- [ ] **Step 1: Create `src/components/ui/Callout.astro`**

```astro
---
interface Props {
	title?: string;
}

const { title } = Astro.props;
---

<div class="callout" data-reveal>
	{title && <p class="title">{title}</p>}
	<div class="content">
		<slot />
	</div>
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.callout {
		border: 1px solid $glass-border;
		border-radius: $radius-md;
		padding: $space-4;
		background: rgba(255, 255, 255, 0.02);

		.title {
			font-family: $font-sans;
			font-weight: 600;
			font-size: $font-size-body;
			color: $color-accent;
			margin: 0 0 $space-1;
		}

		.content {
			font-family: $font-sans;
			font-size: $font-size-body;
			color: $color-text-muted;
			line-height: 1.6;
		}
	}
</style>
```

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Callout.astro
git commit -m "feat: add Callout component"
```

---

### Task 8: `FeatureSection` component

**Files:**
- Create: `src/components/ui/FeatureSection.astro`

**Interfaces:**
- Consumes: `tokens.scss` (Task 2), `data-reveal` convention (Task 3).
- Produces: `FeatureSection` with `Props { title: string; description: string; reverse?: boolean }` and a default slot for media (image/video). Alternates media/copy column order via the `reverse` prop — the mechanism future pages (e.g. Projects case studies) will compose with to alternate layouts.

- [ ] **Step 1: Create `src/components/ui/FeatureSection.astro`**

```astro
---
interface Props {
	title: string;
	description: string;
	reverse?: boolean;
}

const { title, description, reverse = false } = Astro.props;
---

<div class:list={['feature-section', { reverse }]} data-reveal>
	<div class="media">
		<slot />
	</div>
	<div class="copy">
		<h2>{title}</h2>
		<p>{description}</p>
	</div>
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.feature-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: $space-6;
		align-items: center;

		.media {
			width: 100%;
			order: 1;

			:global(img),
			:global(video) {
				width: 100%;
				height: auto;
				border-radius: $radius-md;
				display: block;
			}
		}

		.copy {
			display: flex;
			flex-direction: column;
			gap: $space-2;
			order: 2;

			h2 {
				font-family: $font-sans;
				font-weight: 600;
				font-size: $font-size-h2;
				color: $color-text;
				margin: 0;
			}

			p {
				font-family: $font-sans;
				font-size: $font-size-body-lg;
				color: $color-text-muted;
				margin: 0;
			}
		}

		&.reverse {
			.media {
				order: 2;
			}

			.copy {
				order: 1;
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		.feature-section {
			grid-template-columns: 1fr;

			.media,
			.copy,
			&.reverse .media,
			&.reverse .copy {
				order: initial;
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/FeatureSection.astro
git commit -m "feat: add FeatureSection component"
```

---

### Task 9: Header glass/sticky treatment

**Files:**
- Modify: `src/components/ui/Header.astro` (full replacement)
- Modify: `src/styles/tokens.scss` (remove the 4 now-unused legacy tokens)

**Interfaces:**
- Consumes: `$glass-blur`, `$glass-fill`, `$glass-border`, `$color-accent`, `$color-hover-accent`, `$font-sans`, `$font-size-caption`, `$duration-hover`, `$ease-out-quick`, `$breakpoint-mobile` (Task 2).
- Produces: no new exports — this is a leaf UI change. Removes `$color-accent-purple`, `$color-accent-purple-dark`, `$color-header-bg`, `$color-shadow` from `tokens.scss`, which is safe only because this task is the one that stops referencing them (grep-confirmed nothing else in the repo does).

- [ ] **Step 1: Replace `src/components/ui/Header.astro` in full**

```astro
---
const navItems = [
	{ href: '/about', label: 'About' },
	{ href: '/skills', label: 'Skills' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/portfolio', label: 'Portfolio' },
	{ href: '/contact', label: 'Contact' }
];
---

<header data-site-header>
	<a href="/"><img src="/images/svg/logo.svg?v=1" alt="Logo" /></a>
	<nav>
		<ul>
			{
				navItems.map((item) => (
					<li>
						<a href={item.href}>{item.label}</a>
					</li>
				))
			}
		</ul>
	</nav>
</header>

<style lang="scss">
	@import '../../styles/tokens';

	header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		background: transparent;
		border-bottom: 1px solid transparent;
		transition:
			background-color $duration-hover $ease-out-quick,
			border-color $duration-hover $ease-out-quick;

		&.is-scrolled {
			background: $glass-fill;
			backdrop-filter: blur($glass-blur);
			-webkit-backdrop-filter: blur($glass-blur);
			border-bottom-color: $glass-border;
		}

		a {
			display: flex;
		}

		img {
			width: 5rem;
			padding-top: 1rem;
			margin-left: 2.5rem;
		}

		nav {
			min-height: 10vh;
			margin: auto;
			width: 90%;
			display: flex;
			align-items: center;
			justify-content: space-between;

			ul {
				width: 100%;
				list-style: none;
				display: flex;
				justify-content: flex-end;
				align-items: center;

				li {
					padding: 0 1rem;
					font-size: $font-size-caption;
					font-weight: 500;
					font-family: $font-sans;
					letter-spacing: 0.1rem;
					text-transform: uppercase;

					a {
						text-decoration: none;
						color: $color-accent;
						transition: color $duration-hover $ease-out-quick;

						&:hover {
							color: $color-hover-accent;
						}
					}
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		header {
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 1rem 0;

			img {
				margin: 0;
			}

			nav {
				min-height: auto;
				width: 100%;
				margin-top: 0.5rem;

				ul {
					flex-wrap: wrap;
					justify-content: center;

					li {
						padding: 0.5rem;
						font-size: 1rem;
					}
				}
			}
		}
	}
</style>

<script>
	const SCROLL_THRESHOLD = 24;
	let header: HTMLElement | null = null;

	function updateScrolledState() {
		if (!header) return;
		header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
	}

	function setup() {
		header = document.querySelector('header[data-site-header]');
		if (!header) return;
		updateScrolledState();
		window.addEventListener('scroll', updateScrolledState, { passive: true });
	}

	function teardown() {
		window.removeEventListener('scroll', updateScrolledState);
		header = null;
	}

	document.addEventListener('astro:page-load', setup);
	document.addEventListener('astro:before-swap', teardown);
</script>
```

Note what changed and why: `position: sticky` + `z-index: 10` (safely above the homepage hero's highest z-index of 2, see `index.astro`) makes the header stick to the top of the viewport. It starts fully transparent and picks up the glass recipe (`$glass-fill` + `backdrop-filter: blur($glass-blur)` + `$glass-border`) only once scrolled past `SCROLL_THRESHOLD` px, via the `is-scrolled` class. The scroll listener follows this plan's `astro:page-load`/`astro:before-swap` lifecycle rule (Global Constraints) — `Header.astro` is rendered fresh on every client-side navigation (it's not marked `transition:persist`), so a listener attached once at initial load would be attached to a stale, detached header on any later page.

- [ ] **Step 2: Remove the 4 now-unused legacy tokens from `src/styles/tokens.scss`**

Delete these four lines (and their trailing comments) from the `--- Color ---` section:

```scss
$color-accent-purple: #b288c0; // legacy — Header.astro only, see file header
$color-accent-purple-dark: #63458a; // legacy — Header.astro only
$color-header-bg: #23272a; // legacy — Header.astro only
$color-shadow: #00000059; // legacy — Header.astro only
```

Also delete the paragraph in the file's top comment block that explains them (the "`$color-accent-purple`, ... are Header.astro's own legacy tokens..." paragraph) — it's no longer applicable.

- [ ] **Step 3: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors — confirms nothing else in the repo referenced the four removed tokens (this plan's Global Constraints already asserted this via grep, this step is the build-level proof).

- [ ] **Step 4: Manual visual check**

```bash
npm run dev
```

Open `http://localhost:4321/` in a browser. Expected: header is transparent at the top of the page; scrolling down ~24px+ transitions it to a frosted glass background with a subtle bottom border; nav links use the new violet accent; resize below 768px and confirm the existing mobile stacked-layout behavior still works. Then click a nav link (e.g. "About") to trigger a client-side navigation, scroll on that page, and confirm the glass effect still engages (proves the `astro:page-load` re-wiring works, not just the very first page load).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Header.astro src/styles/tokens.scss
git commit -m "feat: add sticky glass header, retire header-only legacy tokens"
```

---

### Task 10: Footer token cleanup

**Files:**
- Modify: `src/components/ui/Footer.astro`

**Interfaces:**
- Consumes: `$font-sans`, `$font-size-caption`, `$color-text-muted` (Task 2).
- Produces: no new exports — leaf UI change only.

- [ ] **Step 1: Update `src/components/ui/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---

<footer>
	<p>© {year} Jarrett Dominic</p>
</footer>

<style lang="scss">
	@import '../../styles/tokens';

	footer {
		width: 100%;
		height: 6rem;
		background: $color-bg;
		display: flex;
		justify-content: center;
		align-items: center;
		color: $color-text-muted;
		font-family: $font-sans;
		font-size: $font-size-caption;
	}
</style>
```

Changed: `font-family` moves off the legacy `$font-heading` alias onto the canonical `$font-sans`; `color` moves from full-brightness `$color-text` to `$color-text-muted` (a footer reads better de-emphasized against the new near-black background); `font-size` moves off a hardcoded `1.2rem` onto the `$font-size-caption` token. `background: $color-bg` is left as-is — it already inherits the new near-black value automatically from Task 2's token change, no edit needed here.

- [ ] **Step 2: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Footer.astro
git commit -m "feat: update Footer to use canonical design tokens"
```

---

### Task 11: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated check**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
npm run lint
```

Expected: all four pass with no errors.

- [ ] **Step 2: Manual browser check — every existing page still renders**

```bash
npm run dev
```

Visit `/`, `/about`, `/skills`, `/projects`, `/portfolio`, `/contact`. Expected: every page still renders (nothing crashes from a missing token), all now show the near-black background, off-white text, and Geist typeface (inherited automatically through the token cascade), header is sticky and glass-on-scroll on every page, footer shows the updated muted styling. Pages still visually resemble their pre-redesign layout otherwise (no page content was rewritten in this plan) — including `$gradient-warm`-based section headings still present and functioning, just visually not yet part of the new language (expected, tracked as future per-page work).

- [ ] **Step 3: Manual check — reduced motion**

In devtools, emulate `prefers-reduced-motion: reduce`, reload any page. Since no page yet has a `data-reveal` element in production use (Tasks 4-8 only build the components; a future page-redesign sub-project is what actually places them on a page), this step has nothing to visually confirm yet — skip it for this plan, but note it explicitly as the first manual check required once any future page places a `HeroTitle`/`SectionIntro`/`StatCard`/`Callout`/`FeatureSection` on-page. Do not skip verifying `npm run build` succeeds with `prefers-reduced-motion` emulation on (i.e. no build-time dependency on runtime media state) — confirmed already by Step 1.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in design foundation final verification pass"
```

(Skip this step if Steps 1-3 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** Design tokens (Task 2 covers typography, color, spacing, radius, shadow/glass, motion tokens from the spec's "Design Tokens" section in full). Motion system (Task 3 covers library setup, location, reduced-motion, and the Astro view-transitions integration called out explicitly in the spec). All five shared components (Tasks 4-8, matching the spec's "Shared Components" section prop-for-prop). Header/Footer changes (Tasks 9-10, matching the spec's "Header / Footer Changes" section). File layout matches the spec's "File Layout" section exactly. Verification approach matches the spec's "Verification" section, including the explicit Playwright-cost-consciousness note.
- **Type consistency:** `RevealOptions` (Task 3) is used identically by `revealOnScroll`'s only caller in this plan (`initRevealElements`, same file). `Props` interfaces across all five components (Tasks 4-8) are self-contained (no cross-component type sharing needed at this stage — each is a leaf UI component). `data-reveal` is the one convention every component (Tasks 4-8) and the motion system (Task 3) agree on by exact attribute name.
- **No placeholders:** every task has complete, real code — including the trickiest part (the exact Fontsource package names and the `"Geist Variable"`/`"Geist Mono Variable"` CSS font-family strings), which were verified against the real npm registry and Fontsource's documentation before being written into this plan, not guessed.
- **Legacy-token safety:** the plan was written only after grepping the entire `src/` tree for every existing SCSS variable usage, to guarantee Task 2 doesn't silently break any of the 6 unmigrated pages. Task 9 is the only task that removes token names, and only the 4 confirmed Header-only ones, in the same task that stops referencing them.

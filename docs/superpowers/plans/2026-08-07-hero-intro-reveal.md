# Hero Intro Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's instant, permanent hero-text-over-3D-scene layout with a sequence: a small loading pulse while the model downloads, a single coordinated GSAP fade (not an instant attribute toggle) that reveals the fully unobstructed 3D scene once it's ready, and a dismissible "click around to explore" tooltip afterward.

**Architecture:** A new `oninteract` callback is threaded through the existing `onready`/`onerror` prop chain (`HeroScene.svelte` → `Hero3D.svelte` → `mount-hero-3d.ts`) so `index.astro`'s script can learn about the visitor's first hotspot hover/click without any new cross-component wiring. `index.astro`'s own script and markup absorb the rest: a `data-hero-intro` marker replaces the narrower `data-hero-links` marker so the whole intro group (background, heading, tagline, pulse, fallback links) fades as one GSAP tween instead of two separately-toggled pieces.

**Tech Stack:** Astro, Svelte 5, GSAP (via the existing shared `src/lib/motion/gsap-setup.ts` instance), SCSS.

## Global Constraints

- No change to the mobile/reduced-motion/low-power fallback experience — `shouldUseSimplifiedHero()` already excludes those visitors from the entire 3D path before any of this code runs, so nothing in this plan needs its own reduced-motion handling.
- No change to `.button-wrapper` (GitHub/LinkedIn icon links) — stays visible always, unaffected.
- No change to hover/click/highlight mechanics in `src/lib/three/*` — this plan only adds a new callback invocation at two existing call sites, it doesn't touch the lookup/highlight logic itself.
- The intro-group fade uses `autoAlpha` (not `opacity`) and a `0.8s`/`expo.out` GSAP tween, matching the design foundation's `$duration-reveal` convention for content reveals (distinct from the click-fade's snappier `0.5s`, a navigation-gate duration). The tooltip fade-in matches this; its dismissal fade is quicker (`0.3s`) since it's a "get out of the way" exit, not a reveal.
- Tooltip copy is exactly: `Click around to explore`.
- Formatting: tabs, single quotes, no trailing commas, 100 print width (`.prettierrc`).
- No automated test for this UI sequencing (established project convention for 3D/animation code) — existing Vitest coverage for `findHotspotObject`/`hotspot-highlight.ts` is unaffected and unchanged.
- Astro/Svelte component internals are not deep-typechecked by `npm run check` alone in this repo (known gap) — also run `npx svelte-check --tsconfig ./tsconfig.json` on every task that touches `.astro` or `.svelte` files.

---

### Task 1: Thread `oninteract` through the callback chain

**Files:**
- Modify: `src/components/islands/HeroScene.svelte`
- Modify: `src/components/islands/Hero3D.svelte`
- Modify: `src/components/islands/mount-hero-3d.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `oninteract?: () => void` added to `HeroScene.svelte`'s `Props`, `Hero3D.svelte`'s `Props`, and `mount-hero-3d.ts`'s `MountHero3DCallbacks`. Called from `HeroScene.svelte`'s `handlePointerMove` (when a hotspot is found) and `handleClick` (when a valid hotspot resolves). Task 2's `index.astro` passes a handler through `mountHero3D(root, { onready, onerror, oninteract })`.

This task is safe to land on its own: nothing currently passes `oninteract`, so `oninteract?.()` is a no-op everywhere until Task 2 wires a real handler — existing hover/click/highlight behavior is completely unchanged.

- [ ] **Step 1: Update `src/components/islands/HeroScene.svelte`**

In the `Props` interface, add the new callback:

```ts
interface Props {
	/** Fired once the glTF has finished downloading/parsing and is in the scene. */
	onready?: () => void;
	/** Fired if the glTF fails to download or parse. */
	onerror?: (error: unknown) => void;
	/** Fired the first time the visitor hovers or clicks a hotspot. */
	oninteract?: () => void;
}

let { onready, onerror, oninteract }: Props = $props();
```

In `handleClick`, call it once a valid hotspot is resolved:

```ts
function handleClick(event: { object: Object3D }) {
	const id = findHotspotId(event.object);
	const hotspot = hotspots.find((h) => h.id === id);
	if (!hotspot) return;
	oninteract?.();

	const overlay = ensureOverlay();
	gsap.to(overlay, {
		autoAlpha: 1,
		duration: 0.5,
		ease: 'expo.out',
		onComplete: () => navigate(hotspot.route)
	});
}
```

In `handlePointerMove`, call it in the branch where a hotspot is actually found (not on every pointer move — only genuine hotspot hovers):

```ts
function handlePointerMove(event: { object: Object3D; nativeEvent: Event }) {
	if (event.nativeEvent === lastPointerMoveEvent) return;
	lastPointerMoveEvent = event.nativeEvent;

	const hotspotObject = findHotspotObject(event.object);

	if (hotspotObject === highlightedHotspot) return;

	if (highlightedHotspot) clearHighlight(highlightedHotspot);

	if (hotspotObject) {
		applyHighlight(hotspotObject);
		document.body.style.cursor = 'pointer';
		oninteract?.();
	} else {
		document.body.style.cursor = 'default';
	}

	highlightedHotspot = hotspotObject;
}
```

Everything else in this file (imports, `gltf.then`, `onDestroy`, `handlePointerLeave`, the template) stays exactly as it currently is — do not modify anything not shown above.

- [ ] **Step 2: Update `src/components/islands/Hero3D.svelte`**

Full file (only the `Props` interface and the destructure/pass-through change):

```svelte
<!-- Sized via inline style, not a scoped <style> block: this component is loaded
     through a dynamic import(), and its Vite-injected dev-mode <style> tag gets
     dropped by Astro's <ClientRouter/> page swap on navigation away from `/`.
     Because the JS module is cached, re-importing it on a later visit doesn't
     re-run its top-level code, so that stylesheet never gets reinserted — the
     canvas's container silently loses its 100%/100% sizing and Threlte measures
     the wrong dimensions. An inline style lives on the element itself and can't
     be dropped this way. (Confirmed dev-server-only: a production build/preview
     doesn't exhibit this, since Vite's production dynamic-import CSS handling
     re-checks and reinserts the stylesheet link on every import() call.) -->
<script lang="ts">
	import { Canvas } from '@threlte/core';
	import HeroScene from './HeroScene.svelte';

	interface Props {
		/** Fired once the hero model is loaded and actually visible. */
		onready?: () => void;
		/** Fired if the hero model fails to load. */
		onerror?: (error: unknown) => void;
		/** Fired the first time the visitor hovers or clicks a hotspot. */
		oninteract?: () => void;
	}

	let { onready, onerror, oninteract }: Props = $props();
</script>

<div class="hero-3d" style="width: 100%; height: 100%;">
	<Canvas renderMode="always">
		<HeroScene {onready} {onerror} {oninteract} />
	</Canvas>
</div>
```

(This reproduces the file's current content exactly except for the `oninteract` addition — the comment stays above the `<script>` block exactly where it already is, since that's this file's current structure.)

- [ ] **Step 3: Update `src/components/islands/mount-hero-3d.ts`**

```ts
import { mount } from 'svelte';
import Hero3D from './Hero3D.svelte';

export interface MountHero3DCallbacks {
	/** Called once the hero model has finished loading and is on screen. */
	onready?: () => void;
	/** Called if the hero model fails to load. */
	onerror?: (error: unknown) => void;
	/** Called the first time the visitor hovers or clicks a hotspot. */
	oninteract?: () => void;
}

/**
 * Mounts the 3D hero into `target`.
 *
 * Returns the mount handle so the caller can pass it to Svelte's `unmount()`.
 * This matters because the site uses Astro's `<ClientRouter />`: navigating away
 * swaps the DOM out from under the canvas without ever destroying it, so without
 * an explicit unmount the WebGL context and the per-frame render loop would keep
 * running, detached, for the rest of the browsing session.
 */
export function mountHero3D(
	target: HTMLElement,
	callbacks: MountHero3DCallbacks = {}
): Record<string, unknown> {
	target.innerHTML = '';
	return mount(Hero3D, { target, props: callbacks });
}
```

- [ ] **Step 4: Verify**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: 0 errors on all three. Nothing observable changes yet (no page passes `oninteract` until Task 2) — this step just confirms the new plumbing compiles cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/components/islands/HeroScene.svelte src/components/islands/Hero3D.svelte src/components/islands/mount-hero-3d.ts
git commit -m "feat: add oninteract callback to the hero mount chain"
```

---

### Task 2: Loading pulse, coordinated fade, and tooltip in `index.astro`

**Files:**
- Modify: `src/pages/index.astro` (full replacement)

**Interfaces:**
- Consumes: `MountHero3DCallbacks`'s `oninteract` (Task 1).
- Produces: no new exports — this is the page itself.

This task replaces the file in one atomic step rather than being split further: the markup (new `data-hero-intro` marker, pulse element, tooltip element), the styles (pulse keyframes, tooltip appearance), and the script (pulse reveal, GSAP fade, tooltip show/dismiss) are tightly coupled — splitting them across separate tasks would leave a broken intermediate state (e.g., new markup with no script driving it, or a script referencing a marker attribute the markup doesn't have yet).

Two deliberate implementation choices, both consistent with the spec's own stated reasoning — noted here so they don't read as unexplained deviations:
- The loading pulse is placed *inline* at the end of the tagline `<p>` (not as a separate block-level element after it) — reads as "I'm a Full-Stack Developer based in Tampa, Florida. •" with a small dot trailing the text, closer to a live "still working" indicator than a separate floating element.
- The `onerror`/import-`catch` paths no longer call a `setFallbackHidden(false)`-style revert: since the new `revealHero()` (this task) is the *only* place that hides `[data-hero-intro]` elements, and it only ever runs from `onready`, those elements can never already be hidden by the time an error path runs — the old defensive revert call was covering a case that can no longer occur, so it's removed rather than kept as dead code. The loading pulse still gets explicitly hidden on error, since (unlike the intro elements) it *is* shown before the ready/error outcome is known.
- This task also migrates this file's `@import '../styles/tokens';` to `@use '../styles/tokens' as *;` — the deprecated-`@import` cleanup already done for 7 other files in the design foundation plan intentionally excluded pages, but since this task is already rewriting this file's `<style>` block in full, doing the migration here too costs nothing extra and avoids adding a ninth file to that already-known cleanup list instead of shrinking it.

- [ ] **Step 1: Replace `src/pages/index.astro` in full**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';
import { hotspots } from '../data/hotspots';

const GithubIcon = icons['mdi/github'];
const LinkedinIcon = icons['mdi/linkedin'];
---

<BaseLayout title="Jarrett Dominic">
	<main>
		<img id="background" data-hero-intro src="/images/svg/wave.svg" alt="" />
		<div id="hero-root"></div>
		<div class="landing-wrapper">
			<div class="landing-content" data-hero-intro>
				<h1>Hi, I am Jarrett Dominic.</h1>
				<p>
					I'm a Full-Stack Developer based in Tampa, Florida.
					<span class="loading-pulse" data-loading-pulse hidden aria-hidden="true"></span>
				</p>
				<nav class="hotspot-links" aria-label="Portfolio sections">
					<ul>
						{
							hotspots.map((hotspot) => (
								<li>
									<a href={hotspot.route}>{hotspot.label}</a>
								</li>
							))
						}
					</ul>
				</nav>
			</div>
			<div class="button-wrapper">
				<a href="https://github.com/FlooffyKitsune" target="_blank" rel="noopener noreferrer">
					<GithubIcon />
				</a>
				<a
					href="https://www.linkedin.com/in/jarrett-dominic/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkedinIcon />
				</a>
			</div>
		</div>
		<div class="hero-tooltip" data-hero-tooltip hidden>Click around to explore</div>
		<div class="gradient"></div>
	</main>
</BaseLayout>

<style lang="scss">
	@use '../styles/tokens' as *;

	main {
		width: 100%;
		height: 50rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: $color-text;
		font-family: $font-heading;
		margin-bottom: -2rem;
		position: relative;

		#background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: calc(50rem + 96px);
			object-fit: cover;
			object-position: center;
			z-index: -2;
			opacity: 0.2;
		}

		#hero-root {
			position: absolute;
			inset: 0;
			/* Must stay non-negative: a negative z-index here places the canvas
			   behind the stacking context root's own box for hit-testing purposes,
			   which makes it unable to receive any pointer/click events at all. */
			z-index: 0;
		}

		.gradient {
			width: 100%;
			height: 6rem;
			background: linear-gradient(to bottom, rgba(255, 0, 191, 0), $color-bg);
			position: absolute;
			top: 50rem;
			border-bottom: $color-bg 2rem solid;
			z-index: 2;
		}
	}

	.landing-wrapper {
		display: flex;
		flex-direction: row-reverse;
		width: 100%;
		position: relative;
		z-index: 1;
		/* This wrapper is full-width and sits above #hero-root purely so the text
		   renders on top of the canvas. Without this it would also intercept every
		   click across a full-width band through the vertical centre of the page —
		   exactly where the 3D model and its hotspots are. Pointer events pass
		   through the layout boxes; the actual content opts back in below. */
		pointer-events: none;

		.landing-content {
			width: 63%;
			padding: 0 2rem;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			border-left: $color-text 1px solid;

			h1 {
				font-family: $font-heading-serif;
				font-size: 3rem;
				font-weight: 700;
				background: $gradient-purple;
				-webkit-text-fill-color: transparent;
				-webkit-background-clip: text;
				/* Deliberately NOT pointer-events:auto (unlike the links below):
				   two of the 3D hero's five hotspots render on-screen underneath
				   this heading's box, and since the hero is the primary way to
				   reach them, staying click/hover-through here matters more than
				   this heading being text-selectable. */
			}

			p {
				font-size: 1.5rem;
				padding-bottom: 2rem;
				/* See the h1 rule above — same reasoning, same tradeoff. */

				.loading-pulse {
					display: inline-block;
					width: 0.5rem;
					height: 0.5rem;
					margin-left: 0.5rem;
					border-radius: 50%;
					background: $color-accent;
					animation: hero-pulse 1.4s ease-in-out infinite;
				}
			}

			.hotspot-links {
				ul {
					list-style: none;
					display: flex;
					flex-wrap: wrap;
					gap: 0.75rem;
				}

				a {
					pointer-events: auto;
					display: inline-block;
					padding: 0.5rem 1.25rem;
					border-radius: 20px;
					text-decoration: none;
					color: $color-text;
					font-size: 1rem;
					background: $gradient-purple;
					transition: opacity 0.2s ease-in-out;

					&:hover {
						opacity: 0.85;
					}
				}
			}
		}

		.button-wrapper {
			width: 37%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: end;
			padding-right: 1rem;

			a {
				pointer-events: auto;
				color: $color-text;
				font-size: 2.5rem;
				transition: all 0.2s ease-in-out;

				&:hover {
					color: $color-hover-accent;
				}
			}
		}
	}

	.hero-tooltip {
		position: absolute;
		right: 2rem;
		bottom: 3rem;
		z-index: 3;
		padding: 0.5rem 1rem;
		border-radius: $radius-md;
		background: $glass-fill;
		backdrop-filter: blur($glass-blur);
		-webkit-backdrop-filter: blur($glass-blur);
		border: 1px solid $glass-border;
		color: $color-text;
		font-family: $font-sans;
		font-size: $font-size-caption;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	@keyframes hero-pulse {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(0.85);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		main {
			height: 100%;
			margin: 5rem 0;

			#background {
				height: 100vh;
			}

			.gradient {
				display: none;
			}
		}

		.landing-wrapper {
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.landing-content {
				width: 100%;
				border-left: none;
				border-bottom: $color-text 1px solid;
				padding: 0 2rem;
				text-align: center;

				h1 {
					font-size: 2rem;
				}

				p {
					font-size: 1.2rem;
				}

				.hotspot-links ul {
					justify-content: center;
				}
			}

			.button-wrapper {
				width: 100%;
				padding: 0;
				margin-top: 1rem;
				flex-direction: row;
				justify-content: center;
				align-items: center;

				a {
					margin: 0 1rem;
				}
			}
		}
	}
</style>

<script>
	import { unmount } from 'svelte';
	import { gsap } from '../lib/motion/gsap-setup';
	import { shouldUseSimplifiedHero } from '../lib/three/capability-detection';

	// The site uses <ClientRouter />, so this module is evaluated exactly once for
	// the whole session: Astro marks inline scripts as executed and will not
	// re-run them after a client-side swap. All per-navigation work therefore has
	// to hang off the transition lifecycle events, and the mounted app has to
	// live in module scope so both listeners can see it.
	let app: Record<string, unknown> | null = null;
	let mounting = false;
	// Bumped on every teardown so a late-arriving dynamic import or onready/onerror
	// callback belonging to a superseded page can't touch the current DOM.
	let generation = 0;

	function showLoadingPulse() {
		document.querySelector('[data-loading-pulse]')?.removeAttribute('hidden');
	}

	function hideLoadingPulse() {
		document.querySelector('[data-loading-pulse]')?.setAttribute('hidden', '');
	}

	function revealHero() {
		hideLoadingPulse();
		const introElements = document.querySelectorAll('[data-hero-intro]');
		gsap.to(introElements, {
			autoAlpha: 0,
			duration: 0.8,
			ease: 'expo.out',
			onComplete: () => {
				introElements.forEach((el) => el.setAttribute('hidden', ''));
				showTooltip();
			}
		});
	}

	function showTooltip() {
		const tooltip = document.querySelector('[data-hero-tooltip]');
		if (!tooltip) return;
		tooltip.removeAttribute('hidden');
		gsap.to(tooltip, { autoAlpha: 1, duration: 0.8, ease: 'expo.out' });
	}

	function dismissTooltip() {
		const tooltip = document.querySelector('[data-hero-tooltip]');
		if (!tooltip) return;
		gsap.to(tooltip, {
			autoAlpha: 0,
			duration: 0.3,
			ease: 'expo.out',
			onComplete: () => tooltip.setAttribute('hidden', '')
		});
	}

	function teardownHero() {
		generation += 1;
		mounting = false;
		// The intro/tooltip fades' onComplete callbacks only ever touch local
		// DOM state (no cross-page side effect like a navigation call), so a
		// stale tween ticking against an about-to-be-discarded page is harmless
		// either way — killed here purely for cleanliness, matching this
		// project's established practice of not leaving animations running
		// against departed page state.
		gsap.killTweensOf('[data-hero-intro]');
		gsap.killTweensOf('[data-hero-tooltip]');
		if (!app) return;
		const mounted = app;
		app = null;
		// Without this the WebGL context and the `useTask` render loop keep running
		// detached, on every page, for the rest of the session.
		void unmount(mounted);
	}

	function setupHero() {
		const root = document.getElementById('hero-root');
		// Fires on every page, not just the homepage.
		if (!root) return;
		// Astro's first-load/transition sequencing can deliver page-load more than
		// once; never stack two WebGL contexts on the same root.
		if (app || mounting) return;

		const useSimplified = shouldUseSimplifiedHero({
			viewportWidth: window.innerWidth,
			prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
			hardwareConcurrency: navigator.hardwareConcurrency
		});
		if (useSimplified) return;

		// Reveal the loading signal as soon as we've committed to the 3D path —
		// before the dynamic import (and the much larger model download inside
		// it) even starts, not just once the download begins.
		showLoadingPulse();

		const mountGeneration = generation;
		mounting = true;

		import('../components/islands/mount-hero-3d')
			.then(({ mountHero3D }) => {
				if (mountGeneration !== generation) return;
				app = mountHero3D(root, {
					// Hiding the static fallback is deliberately deferred until the
					// scene reports ready. mountHero3D() returns synchronously, but the
					// ~100MB hero.glb is still downloading and parsing inside
					// HeroScene; hiding the wave background and the link list at mount
					// time would leave a completely blank hero for the whole download.
					onready: () => {
						if (mountGeneration !== generation) return;
						revealHero();
					},
					onerror: (error: unknown) => {
						if (mountGeneration !== generation) return;
						console.error('[hero] 3D scene failed to load; keeping static hero', error);
						teardownHero();
						hideLoadingPulse();
					},
					oninteract: () => {
						if (mountGeneration !== generation) return;
						dismissTooltip();
					}
				});
			})
			.catch((error: unknown) => {
				if (mountGeneration !== generation) return;
				console.error('[hero] failed to load 3D hero module; keeping static hero', error);
				hideLoadingPulse();
			})
			.finally(() => {
				if (mountGeneration === generation) mounting = false;
			});
	}

	// astro:page-load fires after the initial load *and* after every client-side
	// navigation; astro:before-swap fires just before the outgoing DOM (including
	// the canvas) is discarded.
	document.addEventListener('astro:page-load', setupHero);
	document.addEventListener('astro:before-swap', teardownHero);
</script>
```

- [ ] **Step 2: Verify it typechecks and builds**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors.

- [ ] **Step 3: Manual browser check — the full sequence**

Run `npm run dev`, load `http://localhost:4321/` on a desktop-width viewport. Expected, in order:
- Immediately: heading, tagline, wave background, and fallback nav links all visible (as today) — plus a small pulsing dot right after the tagline text.
- While the model is still loading, the fallback links are fully functional (they're real `<a href>` elements, unaffected by any of this).
- Once loaded: the pulse, heading, tagline, wave background, and fallback nav all fade out together smoothly (not an instant snap) — 3D scene fully visible afterward, with nothing overlaid on it.
- Shortly after that fade completes: a small tooltip fades in at the bottom-right reading "Click around to explore".
- Hover or click any hotspot: the tooltip fades back out.

- [ ] **Step 4: Manual browser check — remount and fallback paths**

Navigate away (e.g. click a header nav link) and back to `/`: confirm the whole sequence above repeats correctly from the top (pulse → fade → tooltip), not stuck in a stale state from the previous visit.

Resize below the mobile breakpoint (or emulate `prefers-reduced-motion: reduce`), reload `/`: confirm the fallback experience is completely unaffected — no pulse ever appears, heading/tagline/links stay permanently visible exactly as before this plan, no tooltip.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add hero loading pulse, coordinated fade, and discovery tooltip"
```

---

### Task 3: Final verification pass

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

Repeat Task 2's Steps 3-4 checks once more against the final committed state (not mid-development), to catch anything that regressed between tasks. Additionally: confirm the GitHub/LinkedIn icon links (`.button-wrapper`) stay visible and functional throughout the entire sequence (before, during, and after the fade) — they were explicitly out of scope for this plan and must be completely unaffected.

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in hero intro reveal final verification pass"
```

(Skip this step if Steps 1-2 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** Loading pulse (Task 2 — inline dot, CSS-only animation loop, shown on 3D-path commit, hidden on ready/error). Coordinated intro fade (Task 2 — `data-hero-intro` marker replacing `data-hero-links`, single GSAP `autoAlpha` tween at `0.8s`/`expo.out`, `hidden` attribute applied on complete). Tooltip (Task 2 — exact copy, position, glass styling matching the design foundation's established recipe, sequenced after the fade via `onComplete`, dismissed via the new `oninteract` callback from Task 1). Fallback/reduced-motion exclusion and `.button-wrapper` exclusion both explicitly re-verified in Task 3.
- **Type consistency:** `oninteract?: () => void` is spelled identically across all three files in Task 1 and consumed identically in Task 2's `mountHero3D(root, { onready, onerror, oninteract })` call — same name, same signature, no drift.
- **No placeholders:** every task has complete, real code, including the two implementation choices (inline pulse placement, removed dead-code error-path revert) that could otherwise read as unexplained deviations from the spec — both are called out with their reasoning directly in Task 2's preamble.

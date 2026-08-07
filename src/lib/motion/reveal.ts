import { gsap } from './gsap-setup';
import { createReducedMotionContext } from './reduced-motion';

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
 * The single `gsap.matchMedia()` context managing every `[data-reveal]` element
 * on the current page, or `null` when the reveal system is not active (no
 * reveal elements on this page, or already torn down). Doubles as the
 * idempotency guard for `initRevealElements`.
 */
let activeMatchMedia: gsap.MatchMedia | null = null;

/**
 * Fades and slides `element` in as it scrolls into view — the default
 * section-entrance animation. Uses `expo.out`, the closest built-in GSAP ease
 * to the `$ease-out-expo` CSS token, so scroll reveals and CSS hover
 * transitions read as one motion system.
 *
 * Must be called from inside the shared reduced-motion matchMedia context (see
 * `initRevealElements`) — it does not gate on `prefers-reduced-motion` itself,
 * and the tween/ScrollTrigger it creates are only cleaned up on teardown
 * because the enclosing GSAP context adopts them.
 *
 * Uses `gsap.set` + `gsap.to` rather than `gsap.from`. `gsap.from` applies its
 * "start from invisible" state only when the tween is *created*, which is at
 * `astro:page-load` (i.e. window `load`, after every image and font settles) —
 * leaving reveal elements fully visible from first paint and then snapping them
 * invisible to re-animate. The `html.js [data-reveal] { visibility: hidden }`
 * rule in `global.scss` now owns the pre-JS hidden state instead, and this
 * explicit `set` keeps GSAP's inline state in sync with it.
 */
export function revealOnScroll(element: Element, options: RevealOptions = {}) {
	const { y = 24, duration = 0.8, start = 'top 85%' } = options;

	gsap.set(element, { autoAlpha: 0, y });

	gsap.to(element, {
		autoAlpha: 1,
		y: 0,
		duration,
		ease: 'expo.out',
		scrollTrigger: {
			trigger: element,
			start
		}
	});
}

/**
 * Wires up every `[data-reveal]` element currently in the DOM. Called on
 * `astro:page-load` (BaseLayout.astro) — this site uses `<ClientRouter/>`,
 * so this must re-run on every client-side navigation, not just the first
 * load, or elements on pages navigated to client-side would never animate.
 *
 * Every element is registered inside ONE `gsap.matchMedia()` context (see
 * `createReducedMotionContext` for why one-per-page matters), so
 * `prefers-reduced-motion` is resolved once for the whole page and a single
 * `.kill()` tears the entire reveal system down.
 *
 * Idempotent: a second call before a teardown is a no-op. Astro's
 * first-load/transition sequencing can deliver `astro:page-load` more than once
 * (the same lesson the 3D hero in `src/pages/index.astro` already encodes), and
 * without this guard every element would get a second stacked
 * matchMedia + tween + ScrollTrigger. A no-op is preferred over an implicit
 * teardown-and-reinit: between two `page-load` events with no intervening
 * `astro:before-swap` the DOM has not changed, so the existing context is still
 * correct and rebuilding it would only throw away in-flight animations.
 */
export function initRevealElements() {
	if (activeMatchMedia) return;

	const elements = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
	if (elements.length === 0) return;

	activeMatchMedia = createReducedMotionContext(
		() => {
			elements.forEach((element) => revealOnScroll(element));
		},
		() => {
			gsap.set(elements, { autoAlpha: 1, y: 0 });
		}
	);
}

/**
 * Tears down the reveal system. Called on `astro:before-swap`
 * (BaseLayout.astro), before the outgoing page's DOM (and the elements these
 * triggers are attached to) is discarded — without this, triggers would
 * accumulate and double-fire across navigations, and the matchMedia instance
 * would leak its `prefers-reduced-motion` change listeners for the lifetime of
 * the SPA session.
 *
 * Killing the single matchMedia instance is sufficient: `MatchMedia.kill()`
 * calls `Context.kill()` on each of its contexts, which runs
 * `data.forEach(e => e.kill())`. Anything created while that context is active
 * — tweens *and* ScrollTriggers, since `new ScrollTrigger()` calls
 * `gsap.core.context(this)` which pushes itself onto `context.data` — is in
 * that list (verified against `node_modules/gsap/gsap-core.js` and
 * `node_modules/gsap/ScrollTrigger.js`). So there is deliberately no
 * `ScrollTrigger.getAll().forEach(t => t.kill())` here: it is both redundant
 * and destructive, because this is a shared foundation module and a global kill
 * would take out ScrollTriggers belonging to any other feature on the page.
 *
 * Safe to call when the reveal system was never initialised (e.g. a page with
 * no `[data-reveal]` elements) — it is a no-op.
 */
export function teardownRevealElements() {
	activeMatchMedia?.kill();
	activeMatchMedia = null;
}

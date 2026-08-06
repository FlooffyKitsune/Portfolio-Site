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

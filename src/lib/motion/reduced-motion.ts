import { gsap } from './gsap-setup';

/**
 * Creates ONE `gsap.matchMedia()` context that runs `animate` for visitors who
 * are fine with motion and `instant` (final-state-only, no tween) for visitors
 * who prefer reduced motion. GSAP re-runs the matching branch automatically if
 * the visitor flips the OS setting mid-session, reverting whatever the previous
 * branch created first.
 *
 * IMPORTANT — this is a page-scoped factory, not a per-element wrapper. Every
 * call creates a `MatchMedia` instance whose `.add()` registers a native
 * `window.matchMedia(...).addEventListener('change', ...)` listener *per
 * condition* (see `MatchMedia.prototype.add` in `node_modules/gsap`). GSAP's
 * `MatchMedia.kill()` unregisters the context from GSAP's module-level `_media`
 * registry but never removes those native listeners, so they are retained for
 * the whole session. Calling this once per element would therefore leak
 * `2 x element count` MediaQueryList listeners per client-side navigation.
 * Call it ONCE per page and register every animated element inside the single
 * `animate`/`instant` pair, then `.kill()` the returned instance on teardown.
 */
export function createReducedMotionContext(
	animate: () => void,
	instant: () => void
): gsap.MatchMedia {
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

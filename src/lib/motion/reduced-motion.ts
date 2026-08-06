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

import { describe, expect, it } from 'vitest';
import { shouldUseSimplifiedHero } from './capability-detection';

describe('shouldUseSimplifiedHero', () => {
	it('returns false for a wide viewport, no reduced motion, and enough cores', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false,
			hardwareConcurrency: 8
		});
		expect(result).toBe(false);
	});

	it('returns true when the viewport is narrower than the mobile breakpoint', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 500,
			prefersReducedMotion: false,
			hardwareConcurrency: 8
		});
		expect(result).toBe(true);
	});

	it('returns true when the user prefers reduced motion, regardless of viewport', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: true,
			hardwareConcurrency: 8
		});
		expect(result).toBe(true);
	});

	it('returns true when hardwareConcurrency is below the minimum core threshold', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false,
			hardwareConcurrency: 2
		});
		expect(result).toBe(true);
	});

	it('returns false when hardwareConcurrency is unavailable (undefined)', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false
		});
		expect(result).toBe(false);
	});
});

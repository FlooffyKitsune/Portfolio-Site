export interface CapabilityInputs {
	viewportWidth: number;
	prefersReducedMotion: boolean;
	hardwareConcurrency?: number;
}

const MOBILE_BREAKPOINT = 768;
const MIN_CORES_FOR_3D = 4;

export function shouldUseSimplifiedHero(inputs: CapabilityInputs): boolean {
	if (inputs.prefersReducedMotion) return true;
	if (inputs.viewportWidth < MOBILE_BREAKPOINT) return true;
	if (inputs.hardwareConcurrency !== undefined && inputs.hardwareConcurrency < MIN_CORES_FOR_3D) {
		return true;
	}
	return false;
}

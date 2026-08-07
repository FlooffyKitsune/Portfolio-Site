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

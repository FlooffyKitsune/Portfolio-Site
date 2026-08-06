import { mount } from 'svelte';
import Hero3D from './Hero3D.svelte';

export function mountHero3D(target: HTMLElement): void {
	target.innerHTML = '';
	mount(Hero3D, { target });
}

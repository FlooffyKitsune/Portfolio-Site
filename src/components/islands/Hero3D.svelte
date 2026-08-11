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
<div class="hero-3d" style="width: 100%; height: 100%;">
	<Canvas renderMode="always">
		<HeroScene {onready} {onerror} {oninteract} />
	</Canvas>
</div>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T } from '@threlte/core';
	import { useGltf, interactivity } from '@threlte/extras';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import type { Object3D } from 'three';
	import { navigate } from 'astro:transitions/client';
	import { gsap } from '../../lib/motion/gsap-setup';
	import { hotspots } from '../../data/hotspots';
	import { findHotspotId, findHotspotObject } from '../../lib/three/hotspot-lookup';
	import {
		applyHighlight,
		clearAllPreparedHotspots,
		clearHighlight,
		prepareHotspotForHighlight
	} from '../../lib/three/hotspot-highlight';
	import {
		cameraPosition,
		cameraFov,
		dracoDecoderPath,
		fadeOverlayColor
	} from '../../lib/three/scene-config';

	interface Props {
		/** Fired once the glTF has finished downloading/parsing and is in the scene. */
		onready?: () => void;
		/** Fired if the glTF fails to download or parse. */
		onerror?: (error: unknown) => void;
	}

	let { onready, onerror }: Props = $props();

	interactivity();

	// See `dracoDecoderPath` for why this is registered even though the current
	// model is uncompressed.
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath(dracoDecoderPath);

	const gltf = useGltf('/models/hero.glb', { dracoLoader });

	gltf
		.then((resolved) => {
			// One-time material-clone pass per hotspot, so hover highlighting
			// (wired below) never risks mutating a material shared with a
			// non-hotspot mesh. Must run before any hover can occur.
			for (const hotspot of hotspots) {
				const hotspotObject = resolved.scene.getObjectByName(`hotspot-${hotspot.id}`);
				if (hotspotObject) prepareHotspotForHighlight(hotspotObject);
			}
			onready?.();
		})
		.catch((error: unknown) => onerror?.(error));

	// Tracks whichever hotspot is currently highlighted, so a pointermove that
	// lands on a *different* hotspot (or on no hotspot at all) knows what to
	// clear before applying (or not applying) a new highlight.
	let highlightedHotspot: Object3D | null = null;

	// Created lazily on first click — a full-viewport DOM overlay for the
	// accent-fade transition. This can't be part of this component's own
	// template: everything HeroScene.svelte renders is interpreted as Threlte
	// scene-graph content (it's mounted inside a <Canvas>), so a plain HTML
	// element has to be created imperatively instead, outside Threlte's control.
	let overlayElement: HTMLDivElement | null = null;

	function ensureOverlay(): HTMLDivElement {
		if (!overlayElement) {
			overlayElement = document.createElement('div');
			overlayElement.style.cssText = `
				position: fixed;
				inset: 0;
				background: ${fadeOverlayColor};
				opacity: 0;
				visibility: hidden;
				pointer-events: none;
				z-index: 50;
			`;
			// Above this site's sticky header (z-index: 10, see Header.astro) and
			// every other positioned element on the homepage (max z-index: 2, see
			// index.astro) — must render on top of everything during the fade.
			document.body.appendChild(overlayElement);
		}
		return overlayElement;
	}

	onDestroy(() => {
		dracoLoader.dispose();
		// The scene is commonly unmounted while the pointer is still over a
		// hotspot (clicking one navigates away), which would otherwise leave
		// `cursor: pointer` stuck on <body> for the rest of the session.
		document.body.style.cursor = 'default';
		// `preparedHotspots` inside hotspot-highlight.ts is module-scoped, so it
		// survives remounts under Astro's <ClientRouter /> (see mount-hero-3d.ts:
		// navigating back to `/` within a session unmounts and remounts this
		// component without a full page reload). Without this, every remount's
		// prepare pass would leak the previous mount's cloned materials/meshes.
		clearAllPreparedHotspots();
		overlayElement?.remove();
	});

	function handleClick(event: { object: Object3D }) {
		const id = findHotspotId(event.object);
		const hotspot = hotspots.find((h) => h.id === id);
		if (!hotspot) return;

		const overlay = ensureOverlay();
		gsap.to(overlay, {
			autoAlpha: 1,
			duration: 0.5,
			ease: 'expo.out',
			onComplete: () => navigate(hotspot.route)
		});
	}

	// See the file-level note above this task's code block for why this uses
	// pointermove rather than pointerenter for per-hotspot hover tracking.
	function handlePointerMove(event: { object: Object3D }) {
		const hotspotObject = findHotspotObject(event.object);

		if (hotspotObject === highlightedHotspot) return;

		if (highlightedHotspot) clearHighlight(highlightedHotspot);

		if (hotspotObject) {
			applyHighlight(hotspotObject);
			document.body.style.cursor = 'pointer';
		} else {
			document.body.style.cursor = 'default';
		}

		highlightedHotspot = hotspotObject;
	}

	function handlePointerLeave() {
		document.body.style.cursor = 'default';
		if (highlightedHotspot) {
			clearHighlight(highlightedHotspot);
			highlightedHotspot = null;
		}
	}
</script>

{#if $gltf && $gltf.cameras[0]}
	<!-- Sourced from the model's own embedded Camera (framed in Blender) so a
	     re-export with a different angle just works. The scene is fully static
	     — nothing in this file animates any transform — so this is simply the
	     camera the model shipped with, rendered as-is. Kept as a sibling of the
	     model below (not a descendant) for architectural clarity: cameras are
	     independent of the geometry they view, not a reason tied to rotation. -->
	<T is={$gltf.cameras[0]} makeDefault />
{:else}
	<T.PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
{/if}

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight intensity={1} position={[5, 10, 5]} />

{#if $gltf}
	<T
		is={$gltf.scene}
		onclick={handleClick}
		onpointermove={handlePointerMove}
		onpointerleave={handlePointerLeave}
	/>
{/if}

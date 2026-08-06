<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T, useTask } from '@threlte/core';
	import { useGltf, interactivity } from '@threlte/extras';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import type { Group, Object3D } from 'three';
	import { hotspots } from '../../data/hotspots';
	import { findHotspotId } from '../../lib/three/hotspot-lookup';
	import {
		cameraPosition,
		cameraFov,
		autoRotateSpeed,
		dracoDecoderPath
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

	// `useGltf` returns an AsyncWritable: a Svelte store that is *also* the
	// underlying promise, so the caller can be told when the (large) model is
	// actually usable instead of merely "mounted".
	gltf.then(() => onready?.()).catch((error: unknown) => onerror?.(error));

	onDestroy(() => {
		dracoLoader.dispose();
		// The scene is commonly unmounted while the pointer is still over a
		// hotspot (clicking one navigates away), which would otherwise leave
		// `cursor: pointer` stuck on <body> for the rest of the session.
		document.body.style.cursor = 'default';
	});

	let group = $state.raw<Group>();

	useTask((delta) => {
		if (group) group.rotation.y += autoRotateSpeed * delta;
	});

	function handleClick(event: { object: Object3D }) {
		const id = findHotspotId(event.object);
		const hotspot = hotspots.find((h) => h.id === id);
		if (hotspot) window.location.href = hotspot.route;
	}

	function handlePointerEnter(event: { object: Object3D }) {
		if (findHotspotId(event.object)) {
			document.body.style.cursor = 'pointer';
		}
	}

	function handlePointerLeave() {
		document.body.style.cursor = 'default';
	}
</script>

<T.PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />

<T.AmbientLight intensity={0.6} />
<T.DirectionalLight intensity={1} position={[5, 10, 5]} />

{#if $gltf}
	<T.Group bind:ref={group}>
		<T
			is={$gltf.scene}
			onclick={handleClick}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
		/>
	</T.Group>
{/if}

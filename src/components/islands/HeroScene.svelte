<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { useGltf, interactivity } from '@threlte/extras';
	import type { Group, Object3D } from 'three';
	import { hotspots } from '../../data/hotspots';
	import { findHotspotId } from '../../lib/three/hotspot-lookup';
	import { cameraPosition, cameraFov, autoRotateSpeed } from '../../lib/three/scene-config';

	interactivity();

	const gltf = useGltf('/models/hero.glb');
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

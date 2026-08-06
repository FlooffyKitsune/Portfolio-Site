<script lang="ts">
	import { Canvas } from '@threlte/core';
	import HeroScene from './HeroScene.svelte';

	interface Props {
		/** Fired once the hero model is loaded and actually visible. */
		onready?: () => void;
		/** Fired if the hero model fails to load. */
		onerror?: (error: unknown) => void;
	}

	let { onready, onerror }: Props = $props();
</script>

<div class="hero-3d">
	<Canvas renderMode="always">
		<HeroScene {onready} {onerror} />
	</Canvas>
</div>

<style>
	.hero-3d {
		width: 100%;
		height: 100%;
	}
</style>

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import HeroScene from './HeroScene.svelte';
</script>

<div class="hero-3d">
	<Canvas renderMode="always">
		<HeroScene />
	</Canvas>
</div>

<style>
	.hero-3d {
		width: 100%;
		height: 100%;
	}
</style>

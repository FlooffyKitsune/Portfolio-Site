import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	integrations: [svelte()],
	vite: {
		plugins: [Icons({ compiler: 'svelte' })]
	},
	legacy: {
		collectionsBackwardsCompat: true
	}
});

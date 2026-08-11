# Three.js Hero & Hotspot Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's temporary static hero with an interactive Three.js scene — the user's prepared 3D model with clickable hotspots that navigate to About/Skills/Projects/Portfolio/Contact — while keeping a fully functional, JS-light fallback for mobile, `prefers-reduced-motion`, and low-power devices.

**Architecture:** The hero is a progressively-enhanced Svelte island built with Threlte (`@threlte/core` + `@threlte/extras`) on top of Three.js. `index.astro` always server-renders a static, accessible fallback (the existing hero heading/tagline plus a real `<a>` link list for the five destinations — no JS required). A small inline script measures device capability (viewport width, `prefers-reduced-motion`, `navigator.hardwareConcurrency`) and, only when the device qualifies, dynamically `import()`s and manually mounts the Threlte scene into a canvas container, then hides the redundant static link list. This guarantees mobile/low-power visitors never download the Three.js bundle at all. Hotspots are named objects inside the `.glb` (convention: `hotspot-<id>`, e.g. `hotspot-about`) resolved against a single shared `src/data/hotspots.ts` — the same file both the 3D scene and the static fallback read from, so there is one source of truth for "what links where."

**Tech Stack:** Three.js 0.185, `@threlte/core` 8, `@threlte/extras` 8 (Svelte 5), `@gltf-transform/core` (dev-only, for asset inspection), Vitest 4 (for the pure-logic capability-detection and hotspot-lookup helpers only — UI is still verified by build + manual browser check per the project's existing convention).

## Global Constraints

- This plan builds directly on `docs/superpowers/plans/2026-08-06-astro-migration-content-pages.md` — `BaseLayout`, `Header`, the icon registry, and `index.astro`'s temporary hero must already exist.
- Mobile / `prefers-reduced-motion` / low-power visitors must never load the Three.js/Threlte JS bundle — this is enforced by dynamic `import()` gated behind the capability check, not by CSS visibility alone.
- Hotspots are the single list in `src/data/hotspots.ts`; both the 3D scene and the static fallback read from it. Do not hardcode the five destinations a second time anywhere.
- The `.glb`'s interactive objects must be named `hotspot-<id>` where `<id>` matches an id in `hotspots.ts` (`about`, `skills`, `projects`, `portfolio`, `contact`). This is a naming contract with the 3D asset, not a coincidence — Task 1 verifies it against the real file.
- Automated tests apply only to pure-logic modules (`capability-detection.ts`, `hotspot-lookup.ts`) via Vitest. The Threlte scene itself has no automated test — verified by loading the dev server and interacting with it in a browser, per the design spec's Verification section.
- Output stays `static` — the capability check and scene mounting happen entirely client-side; nothing here requires a server.

---

### Task 1: Install dependencies, place the model, verify hotspot naming

**Files:**
- Modify: `package.json`
- Create: `scripts/inspect-gltf.mjs`
- Create: `public/models/hero.glb` (the user's prepared model file)

**Interfaces:**
- Produces: `public/models/hero.glb` served at `/models/hero.glb`, with confirmed object names `hotspot-about`, `hotspot-skills`, `hotspot-projects`, `hotspot-portfolio`, `hotspot-contact` present somewhere in its node hierarchy. Every later task that loads the model (Task 5) depends on this naming being correct.

- [ ] **Step 1: Install runtime and dev dependencies**

```bash
npm install three @threlte/core @threlte/extras
npm install -D @types/three @gltf-transform/core vitest
```

- [ ] **Step 2: Copy the prepared model into the project**

Copy the `.glb` file to `public/models/hero.glb`.

- [ ] **Step 3: Create the inspection script `scripts/inspect-gltf.mjs`**

```js
import { NodeIO } from '@gltf-transform/core';

const path = process.argv[2];
if (!path) {
	console.error('Usage: node scripts/inspect-gltf.mjs <path-to-glb>');
	process.exit(1);
}

const io = new NodeIO();
const document = await io.read(path);
const root = document.getRoot();

function printNode(node, depth) {
	const mesh = node.getMesh();
	console.log(`${'  '.repeat(depth)}- ${node.getName() || '(unnamed)'}${mesh ? ' [mesh]' : ''}`);
	for (const child of node.listChildren()) {
		printNode(child, depth + 1);
	}
}

for (const scene of root.listScenes()) {
	console.log(`Scene: ${scene.getName() || '(unnamed)'}`);
	for (const node of scene.listChildren()) {
		printNode(node, 1);
	}
}
```

- [ ] **Step 4: Run the inspection script**

```bash
node scripts/inspect-gltf.mjs public/models/hero.glb
```

Expected: a printed node tree. If this fails with an error mentioning an unsupported extension (e.g. `KHR_draco_mesh_compression`), the file uses Draco or Meshopt compression — install `@gltf-transform/extensions` and `draco3dgltf`, then register `ALL_EXTENSIONS` and the Draco decoder on the `NodeIO` instance in the script (see glTF-Transform's I/O configuration docs) and re-run.

- [ ] **Step 5: Confirm hotspot naming, fixing the source model if needed**

Check the printed tree for five nodes named exactly `hotspot-about`, `hotspot-skills`, `hotspot-projects`, `hotspot-portfolio`, `hotspot-contact`. For any that are missing: rename the corresponding object in the authoring tool (e.g. Blender's Outliner) to match, re-export the `.glb` over `public/models/hero.glb`, and re-run Step 4 until all five names are present.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/inspect-gltf.mjs public/models/hero.glb
git commit -m "chore: add Three.js/Threlte deps, hero model, and glTF inspection script"
```

---

### Task 2: Hotspot data

**Files:**
- Create: `src/data/hotspots.ts`

**Interfaces:**
- Produces: `hotspots: Hotspot[]` where `Hotspot = { id: string; route: string; label: string }`. Consumed by `hotspot-lookup.ts` (Task 3), `HeroScene.svelte` (Task 5), and `index.astro` (Task 7).

- [ ] **Step 1: Create `src/data/hotspots.ts`**

```ts
export interface Hotspot {
	id: string;
	route: string;
	label: string;
}

export const hotspots: Hotspot[] = [
	{ id: 'about', route: '/about', label: 'About' },
	{ id: 'skills', route: '/skills', label: 'Skills' },
	{ id: 'projects', route: '/projects', label: 'Projects' },
	{ id: 'portfolio', route: '/portfolio', label: 'Portfolio' },
	{ id: 'contact', route: '/contact', label: 'Contact' }
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/hotspots.ts
git commit -m "feat: add shared hotspot data"
```

---

### Task 3: Capability detection (TDD, Vitest)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/three/capability-detection.ts`
- Test: `src/lib/three/capability-detection.test.ts`
- Modify: `package.json` (add `"test": "vitest run"` script)

**Interfaces:**
- Produces: `shouldUseSimplifiedHero(inputs: { viewportWidth: number; prefersReducedMotion: boolean; hardwareConcurrency?: number }): boolean`. Consumed by `index.astro`'s inline script (Task 7).

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts']
	}
});
```

- [ ] **Step 2: Add the `test` script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing test — `src/lib/three/capability-detection.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { shouldUseSimplifiedHero } from './capability-detection';

describe('shouldUseSimplifiedHero', () => {
	it('returns false for a wide viewport, no reduced motion, and enough cores', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false,
			hardwareConcurrency: 8
		});
		expect(result).toBe(false);
	});

	it('returns true when the viewport is narrower than the mobile breakpoint', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 500,
			prefersReducedMotion: false,
			hardwareConcurrency: 8
		});
		expect(result).toBe(true);
	});

	it('returns true when the user prefers reduced motion, regardless of viewport', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: true,
			hardwareConcurrency: 8
		});
		expect(result).toBe(true);
	});

	it('returns true when hardwareConcurrency is below the minimum core threshold', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false,
			hardwareConcurrency: 2
		});
		expect(result).toBe(true);
	});

	it('returns false when hardwareConcurrency is unavailable (undefined)', () => {
		const result = shouldUseSimplifiedHero({
			viewportWidth: 1440,
			prefersReducedMotion: false
		});
		expect(result).toBe(false);
	});
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npm run test -- capability-detection
```

Expected: FAIL — `Cannot find module './capability-detection'` (the file doesn't exist yet).

- [ ] **Step 5: Write `src/lib/three/capability-detection.ts`**

```ts
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
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm run test -- capability-detection
```

Expected: PASS, all 5 assertions green.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json src/lib/three/capability-detection.ts src/lib/three/capability-detection.test.ts
git commit -m "feat: add hero capability detection with tests"
```

---

### Task 4: Scene config & hotspot lookup (TDD, Vitest)

**Files:**
- Create: `src/lib/three/scene-config.ts`
- Create: `src/lib/three/hotspot-lookup.ts`
- Test: `src/lib/three/hotspot-lookup.test.ts`

**Interfaces:**
- Consumes: nothing runtime (uses the `three` package's `Object3D` type only).
- Produces: `cameraPosition: [number, number, number]`, `cameraFov: number`, `autoRotateSpeed: number` (scene-config.ts); `findHotspotId(object: Object3D): string | null` (hotspot-lookup.ts). Both consumed by `HeroScene.svelte` (Task 5).

- [ ] **Step 1: Create `src/lib/three/scene-config.ts`**

```ts
export const cameraPosition: [number, number, number] = [0, 1.5, 6];
export const cameraFov = 45;
export const autoRotateSpeed = 0.15; // radians per second
```

- [ ] **Step 2: Write the failing test — `src/lib/three/hotspot-lookup.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { Object3D } from 'three';
import { findHotspotId } from './hotspot-lookup';

describe('findHotspotId', () => {
	it('returns the id when the object itself is named hotspot-<id>', () => {
		const object = new Object3D();
		object.name = 'hotspot-about';
		expect(findHotspotId(object)).toBe('about');
	});

	it('walks up parents to find a named hotspot ancestor', () => {
		const parent = new Object3D();
		parent.name = 'hotspot-projects';
		const child = new Object3D();
		parent.add(child);
		expect(findHotspotId(child)).toBe('projects');
	});

	it('returns null when no ancestor is a hotspot', () => {
		const parent = new Object3D();
		parent.name = 'Scene';
		const child = new Object3D();
		child.name = 'SomeMesh';
		parent.add(child);
		expect(findHotspotId(child)).toBeNull();
	});
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm run test -- hotspot-lookup
```

Expected: FAIL — `Cannot find module './hotspot-lookup'`.

- [ ] **Step 4: Write `src/lib/three/hotspot-lookup.ts`**

```ts
import type { Object3D } from 'three';

const HOTSPOT_PREFIX = 'hotspot-';

export function findHotspotId(object: Object3D): string | null {
	let current: Object3D | null = object;
	while (current) {
		if (current.name.startsWith(HOTSPOT_PREFIX)) {
			return current.name.slice(HOTSPOT_PREFIX.length);
		}
		current = current.parent;
	}
	return null;
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm run test -- hotspot-lookup
```

Expected: PASS, all 3 assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/three/scene-config.ts src/lib/three/hotspot-lookup.ts src/lib/three/hotspot-lookup.test.ts
git commit -m "feat: add scene config and hotspot lookup with tests"
```

---

### Task 5: Threlte hero scene component

**Files:**
- Create: `src/components/islands/HeroScene.svelte`
- Create: `src/components/islands/Hero3D.svelte`

**Interfaces:**
- Consumes: `hotspots` (Task 2), `findHotspotId` (Task 4), `cameraPosition`/`cameraFov`/`autoRotateSpeed` (Task 4).
- Produces: `Hero3D.svelte`, a self-contained component with no required props, exporting a default Svelte component — this is what Task 6's `mount-hero-3d.ts` mounts.

- [ ] **Step 1: Create `src/components/islands/HeroScene.svelte`**

```svelte
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
```

- [ ] **Step 2: Create `src/components/islands/Hero3D.svelte`**

```svelte
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
```

- [ ] **Step 3: Verify it typechecks**

```bash
npm run check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/islands/HeroScene.svelte src/components/islands/Hero3D.svelte
git commit -m "feat: add Threlte hero scene and canvas wrapper"
```

---

### Task 6: Manual mount helper

**Files:**
- Create: `src/components/islands/mount-hero-3d.ts`

**Interfaces:**
- Consumes: `Hero3D.svelte` (Task 5).
- Produces: `mountHero3D(target: HTMLElement): void`. Consumed by `index.astro`'s inline script (Task 7).

- [ ] **Step 1: Create `src/components/islands/mount-hero-3d.ts`**

```ts
import { mount } from 'svelte';
import Hero3D from './Hero3D.svelte';

export function mountHero3D(target: HTMLElement): void {
	target.innerHTML = '';
	mount(Hero3D, { target });
}
```

- [ ] **Step 2: Verify it typechecks**

```bash
npm run check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/islands/mount-hero-3d.ts
git commit -m "feat: add manual mount helper for the 3D hero island"
```

---

### Task 7: Wire the hero into the homepage

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `hotspots` (Task 2), `shouldUseSimplifiedHero` (Task 3), `mountHero3D` (Task 6).

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';
import { hotspots } from '../data/hotspots';

const GithubIcon = icons['mdi/github'];
const LinkedinIcon = icons['mdi/linkedin'];
---

<BaseLayout title="Jarrett Dominic">
	<main>
		<img id="background" src="/images/svg/wave.svg" alt="" />
		<div id="hero-root"></div>
		<div class="landing-wrapper">
			<div class="landing-content">
				<h1>Hi, I am Jarrett Dominic.</h1>
				<p>I'm a Full-Stack Developer based in Tampa, Florida.</p>
				<nav class="hotspot-links" data-hero-links aria-label="Portfolio sections">
					<ul>
						{
							hotspots.map((hotspot) => (
								<li>
									<a href={hotspot.route}>{hotspot.label}</a>
								</li>
							))
						}
					</ul>
				</nav>
			</div>
			<div class="button-wrapper">
				<a href="https://github.com/FlooffyKitsune" target="_blank" rel="noopener noreferrer">
					<GithubIcon />
				</a>
				<a
					href="https://www.linkedin.com/in/jarrett-dominic/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkedinIcon />
				</a>
			</div>
		</div>
		<div class="gradient"></div>
	</main>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	main {
		width: 100%;
		height: 50rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: $color-text;
		font-family: $font-heading;
		margin-bottom: -2rem;
		position: relative;

		#background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: calc(50rem + 96px);
			object-fit: cover;
			object-position: center;
			z-index: -2;
			opacity: 0.2;
		}

		#hero-root {
			position: absolute;
			inset: 0;
			z-index: -1;
		}

		.gradient {
			width: 100%;
			height: 6rem;
			background: linear-gradient(to bottom, rgba(255, 0, 191, 0), $color-bg);
			position: absolute;
			top: 50rem;
			border-bottom: $color-bg 2rem solid;
		}
	}

	.landing-wrapper {
		display: flex;
		flex-direction: row-reverse;
		width: 100%;

		.landing-content {
			width: 63%;
			padding: 0 2rem;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			border-left: $color-text 1px solid;

			h1 {
				font-family: $font-heading-serif;
				font-size: 3rem;
				font-weight: 700;
				background: $gradient-purple;
				-webkit-text-fill-color: transparent;
				-webkit-background-clip: text;
			}

			p {
				font-size: 1.5rem;
				padding-bottom: 2rem;
			}

			.hotspot-links {
				ul {
					list-style: none;
					display: flex;
					flex-wrap: wrap;
					gap: 0.75rem;
				}

				a {
					display: inline-block;
					padding: 0.5rem 1.25rem;
					border-radius: 20px;
					text-decoration: none;
					color: $color-text;
					font-size: 1rem;
					background: $gradient-purple;
					transition: opacity 0.2s ease-in-out;

					&:hover {
						opacity: 0.85;
					}
				}
			}
		}

		.button-wrapper {
			width: 37%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: end;
			padding-right: 1rem;

			a {
				color: $color-text;
				font-size: 2.5rem;
				transition: all 0.2s ease-in-out;

				&:hover {
					color: #e4b7e5;
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		main {
			height: 100%;
			margin: 5rem 0;

			#background {
				height: 100vh;
			}

			.gradient {
				display: none;
			}
		}

		.landing-wrapper {
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.landing-content {
				width: 100%;
				border-left: none;
				border-bottom: $color-text 1px solid;
				padding: 0 2rem;
				text-align: center;

				h1 {
					font-size: 2rem;
				}

				p {
					font-size: 1.2rem;
				}

				.hotspot-links ul {
					justify-content: center;
				}
			}

			.button-wrapper {
				width: 100%;
				padding: 0;
				margin-top: 1rem;
				flex-direction: row;
				justify-content: center;
				align-items: center;

				a {
					margin: 0 1rem;
				}
			}
		}
	}
</style>

<script>
	import { shouldUseSimplifiedHero } from '../lib/three/capability-detection';

	const root = document.getElementById('hero-root');
	const useSimplified = shouldUseSimplifiedHero({
		viewportWidth: window.innerWidth,
		prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		hardwareConcurrency: navigator.hardwareConcurrency
	});

	if (!useSimplified && root) {
		import('../components/islands/mount-hero-3d').then(({ mountHero3D }) => {
			mountHero3D(root);
			document.getElementById('background')?.setAttribute('hidden', '');
			document.querySelectorAll('[data-hero-links]').forEach((el) => {
				el.setAttribute('hidden', '');
			});
		});
	}
</script>
```

Note what changed from the temporary hero (Plan A, Task 10): added `#hero-root` (the 3D mount point), added the always-rendered `.hotspot-links` nav (the accessible, no-JS fallback for hotspot navigation — this is what mobile/reduced-motion/low-power visitors see and use), and the inline script that conditionally mounts the 3D scene and hides the now-redundant background image and link list once it succeeds.

- [ ] **Step 2: Verify it builds and typechecks**

```bash
npm run check
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: wire Threlte hero and hotspot navigation into the homepage"
```

---

### Task 8: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated check**

```bash
npm run check
npm run test
npm run build
```

Expected: all three pass with no errors.

- [ ] **Step 2: Desktop manual check**

```bash
npm run dev
```

Open `http://localhost:4321/` in a desktop-width browser window. Expected:
- The 3D model renders and slowly auto-rotates.
- Hovering a hotspot object changes the cursor to a pointer.
- Clicking a hotspot navigates to its route (`/about`, `/skills`, `/projects`, `/portfolio`, `/contact`).
- The static `.hotspot-links` list and the wave background are hidden (the 3D scene replaced them).

- [ ] **Step 3: Mobile / reduced-motion manual check**

In the browser devtools, either resize the viewport below 768px or enable "Emulate CSS prefers-reduced-motion: reduce". Reload the page. Expected:
- The wave background and the `.hotspot-links` list are visible (not hidden).
- All five links in `.hotspot-links` work as normal `<a>` navigation.
- In the Network tab, confirm no request for `hero.glb`, `three`, or any `@threlte/*` chunk was made — the 3D bundle was never downloaded.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in final hero verification pass"
```

(Skip this step if Steps 1–3 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** the design spec's section F (3D hero & hotspot navigation) is covered by Tasks 1–7: named-mesh hotspot resolution (Task 1 contract + Task 4 lookup), shared hotspot data (Task 2), mobile/reduced-motion/low-power fallback that avoids downloading the 3D bundle (Task 3 + Task 7's dynamic import), and hover/click interactivity (Task 5). Section G (persistent nav) was already satisfied by the companion plan's `Header`; this plan doesn't duplicate it.
- **Type consistency:** `Hotspot` (Task 2) is used identically in `hotspot-lookup.test.ts`, `HeroScene.svelte`, and `index.astro`. `findHotspotId(object: Object3D): string | null` (Task 4) matches how `HeroScene.svelte` calls it in both `handleClick` and `handlePointerEnter`. `shouldUseSimplifiedHero`'s `CapabilityInputs` shape (Task 3) matches exactly how `index.astro`'s inline script calls it.
- **No placeholders:** the one genuine external dependency — the real names of interactive objects inside the user's `.glb` — is resolved by an actual runnable inspection script (Task 1) with a concrete fix-and-recheck loop, not a "TBD."

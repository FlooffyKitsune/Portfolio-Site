# Hero 3D Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage's 3D hero a fully static, locked-camera scene with an accent-colored hover glow on hotspots and a smooth accent-fade transition (via Astro's client-side navigation) instead of the current instant full-page-reload on click.

**Architecture:** Three small `src/lib/three/*` modules stay pure-logic and unit-tested (`findHotspotObject` alongside the existing `findHotspotId`; a new `hotspot-highlight.ts` for material clone/apply/clear). `HeroScene.svelte` is the only rendering file touched — it wires these modules together, removes the auto-rotate `useTask`, and replaces the click handler's raw `window.location.href` with an imperatively-created full-viewport overlay (GSAP-faded, using the shared `gsap-setup` instance) that calls Astro's `navigate()` on completion. No other file changes.

**Tech Stack:** Threlte (`@threlte/core`, `@threlte/extras`), three.js, GSAP (via the existing `src/lib/motion/gsap-setup.ts`), Astro's `astro:transitions/client`, Vitest.

## Global Constraints

- No change to `src/data/hotspots.ts` (the id → route mapping) or the five hotspot ids themselves.
- No change to the mobile/reduced-motion/low-power static fallback (`.hotspot-links` in `index.astro`) — untouched, still instant plain `<a href>` navigation.
- No change to `mount-hero-3d.ts`, `Hero3D.svelte`, or `index.astro`'s capability-gate script.
- The scene must be **fully static** — no rotation, no per-frame transform animation of any kind. This must be verified empirically in a real browser, not assumed from code review alone (see Task 1).
- Hover highlighting must never affect a mesh outside the hovered hotspot's own subtree, even if the source model shares a material instance across multiple objects — achieved by cloning materials once per hotspot after load, never mutating a shared original.
- The click-to-navigate fade only needs to run for visitors who already have the 3D scene mounted (which itself required passing the `prefers-reduced-motion`/mobile/low-power capability gate) — no separate reduced-motion check on the fade itself.
- Any script that would set up per-navigation state must follow this site's established `astro:page-load`/`astro:before-swap` `<ClientRouter/>` lifecycle discipline — not directly applicable to this plan's files (HeroScene.svelte's own mount/unmount is already handled by the existing `mountHero3D`/`onDestroy` machinery from the original hero plan), but the overlay element created in Task 5 must not leak or duplicate if a visitor returns to the homepage after navigating away (Svelte's existing `onDestroy` cleanup covers this — see Task 5).
- Formatting: tabs, single quotes, no trailing commas, 100 print width (`.prettierrc`).
- No automated test for 3D rendering/interaction itself (established project convention) — pure-logic modules (`findHotspotObject`, `hotspot-highlight.ts`) get Vitest coverage; everything visual is verified by build + manual browser check, kept minimal per explicit prior guidance that Playwright/browser-automation is credit-heavy for this user.

---

### Task 1: Remove auto-rotation, finalize static camera

**Files:**
- Modify: `src/lib/three/scene-config.ts`
- Modify: `src/components/islands/HeroScene.svelte` (full replacement)

**Interfaces:**
- Consumes: nothing new.
- Produces: `HeroScene.svelte` with no rotation logic anywhere. Later tasks build on this file's `handleClick`/`handlePointerEnter`/`handlePointerLeave` functions and the `<T is={$gltf.scene} ...>` element — their exact current shape after this task is the baseline Tasks 4-5 modify.

This task also finalizes the camera-sourcing logic that was already drafted (uncommitted) in the working tree before this plan existed — that draft assumed the room would keep rotating and reasoned about the camera needing to stay outside a rotating group; since rotation is being removed entirely in this same task, that reasoning is now moot, and the code comment is updated to reflect the simpler reality.

- [ ] **Step 1: Remove `autoRotateSpeed` from `src/lib/three/scene-config.ts`**

```ts
export const cameraPosition: [number, number, number] = [0, 1.5, 6];
export const cameraFov = 45;

/**
 * Where GLTFLoader fetches the Draco decoder (wasm/js) from.
 *
 * The current `/models/hero.glb` is NOT Draco-compressed, but registering a
 * DRACOLoader is harmless: three's GLTFLoader only invokes the decoder for
 * primitives that declare the `KHR_draco_mesh_compression` extension, and
 * DRACOLoader spins up its worker lazily on first use. Wiring it now means a
 * Draco-compressed re-export can be dropped in at the same path with no code
 * change. Hosted on gstatic rather than self-hosted because this project keeps
 * no third-party binaries in `public/` and self-hosting would need extra build
 * wiring to copy the decoder out of `node_modules`.
 */
export const dracoDecoderPath = 'https://www.gstatic.com/draco/v1/decoders/';
```

- [ ] **Step 2: Replace `src/components/islands/HeroScene.svelte` in full**

```svelte
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T } from '@threlte/core';
	import { useGltf, interactivity } from '@threlte/extras';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import type { Object3D } from 'three';
	import { hotspots } from '../../data/hotspots';
	import { findHotspotId } from '../../lib/three/hotspot-lookup';
	import { cameraPosition, cameraFov, dracoDecoderPath } from '../../lib/three/scene-config';

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
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
	/>
{/if}
```

Note what changed from the pre-plan working tree: `useTask`, the `Group`-typed `group` state, and `bind:ref={group}` are all gone (nothing reads or animates them anymore — the `<T.Group>` wrapper itself is also gone since it served no purpose once nothing needed a ref to rotate). `autoRotateSpeed` is no longer imported. Everything else (camera-sourcing `{#if}`, lighting, click/hover handlers) is unchanged from the pre-plan draft — Tasks 4 and 5 modify the handler functions further.

- [ ] **Step 3: Verify it typechecks and builds**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors. (`npm run check` alone does not deep-typecheck `.svelte` internals in this repo — a known gap — `svelte-check` is required too.)

- [ ] **Step 4: Verify the scene is actually static — do not skip, do not assume**

First, confirm by code inspection that nothing remaining in the file (or its imports) mutates any object's transform over time:

```bash
grep -n "useTask\|requestAnimationFrame\|setInterval" src/components/islands/HeroScene.svelte
```

Expected: no matches (confirms no remaining per-frame animation code exists in this file).

Then, one lightweight visual confirmation: run `npm run dev`, load `http://localhost:4321/`, and watch the scene for a few seconds. Expected: the camera view does not move, rotate, or drift at all — it looks exactly like a single locked photograph of the room the entire time. A single screenshot is enough evidence if a live visual check isn't practical in your environment (per the project's Playwright-cost-consciousness — do not set up a timed multi-screenshot comparison for this, direct observation is sufficient and cheaper).

- [ ] **Step 5: Commit**

```bash
git add src/lib/three/scene-config.ts src/components/islands/HeroScene.svelte
git commit -m "fix: remove hero auto-rotation, lock to the model's static camera"
```

---

### Task 2: `findHotspotObject` helper (TDD)

**Files:**
- Modify: `src/lib/three/hotspot-lookup.ts`
- Test: `src/lib/three/hotspot-lookup.test.ts`

**Interfaces:**
- Consumes: nothing new (same `Object3D` parent-walk pattern as the existing `findHotspotId`).
- Produces: `findHotspotObject(object: Object3D): Object3D | null` — same parent-walk logic as `findHotspotId`, but returns the matched ancestor **object itself**, not its id string. Task 4 uses this to resolve which hotspot's mesh subtree to highlight (which requires the actual object to traverse, not just its name).

- [ ] **Step 1: Read the current file to confirm its exact contents before editing**

`src/lib/three/hotspot-lookup.ts` currently contains only `findHotspotId`. Confirm this matches:

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

If it doesn't match, stop and report — something upstream of this plan changed unexpectedly.

- [ ] **Step 2: Write the failing test — add to `src/lib/three/hotspot-lookup.test.ts`**

The file already has a `describe('findHotspotId', ...)` block with 3 tests — do not modify it. Add a new block below it:

```ts
describe('findHotspotObject', () => {
	it('returns the object itself when it is named hotspot-<id>', () => {
		const object = new Object3D();
		object.name = 'hotspot-about';
		expect(findHotspotObject(object)).toBe(object);
	});

	it('walks up parents to find and return a named hotspot ancestor', () => {
		const parent = new Object3D();
		parent.name = 'hotspot-projects';
		const child = new Object3D();
		parent.add(child);
		expect(findHotspotObject(child)).toBe(parent);
	});

	it('returns null when no ancestor is a hotspot', () => {
		const parent = new Object3D();
		parent.name = 'Scene';
		const child = new Object3D();
		child.name = 'SomeMesh';
		parent.add(child);
		expect(findHotspotObject(child)).toBeNull();
	});
});
```

Add `findHotspotObject` to the existing `import { findHotspotId } from './hotspot-lookup';` line so it reads `import { findHotspotId, findHotspotObject } from './hotspot-lookup';`.

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm run test -- hotspot-lookup
```

Expected: FAIL — `findHotspotObject` is not exported yet.

- [ ] **Step 4: Add `findHotspotObject` to `src/lib/three/hotspot-lookup.ts`**

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

export function findHotspotObject(object: Object3D): Object3D | null {
	let current: Object3D | null = object;
	while (current) {
		if (current.name.startsWith(HOTSPOT_PREFIX)) {
			return current;
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

Expected: PASS, all 6 assertions green (3 existing + 3 new).

- [ ] **Step 6: Commit**

```bash
git add src/lib/three/hotspot-lookup.ts src/lib/three/hotspot-lookup.test.ts
git commit -m "feat: add findHotspotObject alongside findHotspotId"
```

---

### Task 3: Hotspot highlight module (TDD)

**Files:**
- Modify: `src/lib/three/scene-config.ts`
- Create: `src/lib/three/hotspot-highlight.ts`
- Test: `src/lib/three/hotspot-highlight.test.ts`

**Interfaces:**
- Consumes: `hotspotHighlightColor`, `hotspotHighlightIntensityBoost` (this task, `scene-config.ts`).
- Produces: `prepareHotspotForHighlight(hotspotObject: Object3D): void`, `applyHighlight(hotspotObject: Object3D): void`, `clearHighlight(hotspotObject: Object3D): void`. Task 4 calls `prepareHotspotForHighlight` once per hotspot after the model loads, then `applyHighlight`/`clearHighlight` on hover transitions.

This module's logic is pure three.js object manipulation with no renderer/DOM dependency — `Object3D`, `Mesh`, and `MeshStandardMaterial` all work as plain JS objects in Vitest's Node environment without a WebGL context, the same way the existing `hotspot-lookup.test.ts` already constructs real `Object3D` graphs.

- [ ] **Step 1: Add highlight constants to `src/lib/three/scene-config.ts`**

Add below the existing exports:

```ts
/**
 * Hover-highlight color and intensity boost for hotspot meshes.
 *
 * Plain numeric/JS values, not the SCSS `$color-accent` token — three.js
 * material properties take raw color values, and there's no build-time
 * bridge between the SCSS token system and this file. Keep this in sync by
 * hand if `$color-accent` in `src/styles/tokens.scss` ever changes; as of
 * this writing `$color-accent: #8b5cf6`.
 */
export const hotspotHighlightColor = 0x8b5cf6;
export const hotspotHighlightIntensityBoost = 0.6;
```

- [ ] **Step 2: Write the failing test — `src/lib/three/hotspot-highlight.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { applyHighlight, clearHighlight, prepareHotspotForHighlight } from './hotspot-highlight';
import { hotspotHighlightColor, hotspotHighlightIntensityBoost } from './scene-config';

function makeHotspot() {
	const group = new Group();
	group.name = 'hotspot-test';
	const material = new MeshStandardMaterial({ emissive: 0x000000, emissiveIntensity: 0 });
	const mesh = new Mesh(new BoxGeometry(), material);
	group.add(mesh);
	return { group, mesh, originalMaterial: material };
}

describe('hotspot-highlight', () => {
	it('clones the mesh material so the original instance is never mutated', () => {
		const { group, mesh, originalMaterial } = makeHotspot();
		prepareHotspotForHighlight(group);
		expect(mesh.material).not.toBe(originalMaterial);
	});

	it('applyHighlight sets the accent emissive color and boosts intensity', () => {
		const { group, mesh } = makeHotspot();
		prepareHotspotForHighlight(group);
		applyHighlight(group);
		const material = mesh.material as MeshStandardMaterial;
		expect(material.emissive.getHex()).toBe(hotspotHighlightColor);
		expect(material.emissiveIntensity).toBeCloseTo(hotspotHighlightIntensityBoost);
	});

	it('clearHighlight restores the original emissive color and intensity', () => {
		const { group, mesh } = makeHotspot();
		prepareHotspotForHighlight(group);
		applyHighlight(group);
		clearHighlight(group);
		const material = mesh.material as MeshStandardMaterial;
		expect(material.emissive.getHex()).toBe(0x000000);
		expect(material.emissiveIntensity).toBe(0);
	});

	it('does nothing and does not throw for a hotspot that was never prepared', () => {
		const { group, mesh } = makeHotspot();
		expect(() => applyHighlight(group)).not.toThrow();
		expect(() => clearHighlight(group)).not.toThrow();
		expect((mesh.material as MeshStandardMaterial).emissive.getHex()).toBe(0x000000);
	});

	it('does not affect a sibling mesh outside the prepared hotspot, even with a shared original material', () => {
		const sharedMaterial = new MeshStandardMaterial({ emissive: 0x000000, emissiveIntensity: 0 });
		const hotspotGroup = new Group();
		hotspotGroup.name = 'hotspot-shared';
		const hotspotMesh = new Mesh(new BoxGeometry(), sharedMaterial);
		hotspotGroup.add(hotspotMesh);

		const unrelatedMesh = new Mesh(new BoxGeometry(), sharedMaterial);

		prepareHotspotForHighlight(hotspotGroup);
		applyHighlight(hotspotGroup);

		expect((unrelatedMesh.material as MeshStandardMaterial).emissive.getHex()).toBe(0x000000);
	});
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm run test -- hotspot-highlight
```

Expected: FAIL — `Cannot find module './hotspot-highlight'`.

- [ ] **Step 4: Create `src/lib/three/hotspot-highlight.ts`**

```ts
import type { Color, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { hotspotHighlightColor, hotspotHighlightIntensityBoost } from './scene-config';

interface MeshOriginalState {
	mesh: Mesh;
	material: MeshStandardMaterial;
	emissive: Color;
	emissiveIntensity: number;
}

const preparedHotspots = new Map<Object3D, MeshOriginalState[]>();

function collectMeshes(root: Object3D): Mesh[] {
	const meshes: Mesh[] = [];
	root.traverse((child) => {
		if ((child as Mesh).isMesh) meshes.push(child as Mesh);
	});
	return meshes;
}

/**
 * Clones every mesh's material within `hotspotObject`'s subtree, so later
 * `applyHighlight`/`clearHighlight` calls can never affect a mesh outside
 * this hotspot — even if the source model shares one material instance
 * across multiple objects (common in exported glTFs for efficiency). Call
 * once per hotspot after the model has loaded, before any hover can occur.
 *
 * Materials are expected to be `MeshStandardMaterial` (or a subclass, like
 * `MeshPhysicalMaterial`, which extends it and keeps the same `emissive`/
 * `emissiveIntensity` properties) — the standard result of glTF's default
 * metallic-roughness material model. Verify this against the real
 * `hero.glb` during implementation rather than assuming it.
 */
export function prepareHotspotForHighlight(hotspotObject: Object3D): void {
	const states: MeshOriginalState[] = [];

	for (const mesh of collectMeshes(hotspotObject)) {
		const original = (
			Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
		) as MeshStandardMaterial;
		const cloned = original.clone();
		mesh.material = cloned;
		states.push({
			mesh,
			material: cloned,
			emissive: original.emissive.clone(),
			emissiveIntensity: original.emissiveIntensity
		});
	}

	preparedHotspots.set(hotspotObject, states);
}

export function applyHighlight(hotspotObject: Object3D): void {
	const states = preparedHotspots.get(hotspotObject);
	if (!states) return;
	for (const state of states) {
		state.material.emissive.set(hotspotHighlightColor);
		state.material.emissiveIntensity = state.emissiveIntensity + hotspotHighlightIntensityBoost;
	}
}

export function clearHighlight(hotspotObject: Object3D): void {
	const states = preparedHotspots.get(hotspotObject);
	if (!states) return;
	for (const state of states) {
		state.material.emissive.copy(state.emissive);
		state.material.emissiveIntensity = state.emissiveIntensity;
	}
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm run test -- hotspot-highlight
```

Expected: PASS, all 5 assertions green.

- [ ] **Step 6: Verify typecheck**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/three/scene-config.ts src/lib/three/hotspot-highlight.ts src/lib/three/hotspot-highlight.test.ts
git commit -m "feat: add hotspot hover-highlight module with tests"
```

---

### Task 4: Wire hover highlight into `HeroScene.svelte`

**Files:**
- Modify: `src/components/islands/HeroScene.svelte`

**Interfaces:**
- Consumes: `findHotspotObject` (Task 2), `prepareHotspotForHighlight`/`applyHighlight`/`clearHighlight` (Task 3).
- Produces: no new exports — this wires the pure-logic modules into the rendering component.

**Important — read before implementing.** The naive approach (register `onpointerenter`/`onpointerleave` per-hotspot, expect them to fire on every transition between hotspots) does **not** work correctly with how Threlte's interactivity actually operates. Verified directly against `node_modules/@threlte/extras/dist/interactivity/setupInteractivity.svelte.js`: event handlers are registered on whichever object you attach them to in the template — in this file, that's the single `<T is={$gltf.scene} onpointerenter=... onpointerleave=...>` root, not per-mesh or per-hotspot. Internally, hover state is tracked by an "intersection id" keyed off the **registered event object** (`eventObject`, the object the handler is actually attached to — here, always `$gltf.scene`), not the specific mesh the raycaster hit. That means `onpointerenter`/`onpointerleave` fire once when the cursor enters/leaves the model **as a whole**, not per-hotspot-transition — moving the cursor from one hotspot's mesh directly to an adjacent hotspot's mesh, without ever leaving the model's surface, would not retrigger `onpointerenter`.

The fix: use `onpointermove` instead for the fine-grained tracking. Unlike `onpointerenter`/`onpointerleave`, the event object passed to an `onpointermove` handler (`event.object`) reflects the actual raycaster-hit mesh on every call, not the bubbled-up registered ancestor — confirmed in the same source file (the dispatched `intersectionEvent` spreads the raw intersection, whose `.object` is the real hit, separately from `.eventObject`). `onpointerleave` is still correct and still needed, but only for its true purpose: resetting cursor/highlight state when the pointer leaves the model's interactive surface entirely (the DOM-level `pointerleave` on the canvas, which correctly fires exactly once per model-exit).

- [ ] **Step 1: Update `src/components/islands/HeroScene.svelte`**

Modify the `<script>` block (template stays the same as Task 1 except the `onpointerenter`/`onpointermove` attribute swap in Step 2 below):

```svelte
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { T } from '@threlte/core';
	import { useGltf, interactivity } from '@threlte/extras';
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
	import type { Object3D } from 'three';
	import { hotspots } from '../../data/hotspots';
	import { findHotspotId, findHotspotObject } from '../../lib/three/hotspot-lookup';
	import {
		applyHighlight,
		clearHighlight,
		prepareHotspotForHighlight
	} from '../../lib/three/hotspot-highlight';
	import { cameraPosition, cameraFov, dracoDecoderPath } from '../../lib/three/scene-config';

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

	onDestroy(() => {
		dracoLoader.dispose();
		// The scene is commonly unmounted while the pointer is still over a
		// hotspot (clicking one navigates away), which would otherwise leave
		// `cursor: pointer` stuck on <body> for the rest of the session.
		document.body.style.cursor = 'default';
	});

	function handleClick(event: { object: Object3D }) {
		const id = findHotspotId(event.object);
		const hotspot = hotspots.find((h) => h.id === id);
		if (hotspot) window.location.href = hotspot.route;
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
```

- [ ] **Step 2: Update the template's event bindings**

Replace `onpointerenter={handlePointerEnter}` with `onpointermove={handlePointerMove}` on the `<T is={$gltf.scene} ...>` element, so it reads:

```svelte
{#if $gltf}
	<T
		is={$gltf.scene}
		onclick={handleClick}
		onpointermove={handlePointerMove}
		onpointerleave={handlePointerLeave}
	/>
{/if}
```

(The camera/lighting elements above it are unchanged from Task 1.)

- [ ] **Step 3: Verify typecheck and build**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors.

- [ ] **Step 4: Manual browser check**

Run `npm run dev`, load `http://localhost:4321/`. Hover each of the five hotspots (about/skills/projects/portfolio/contact — consult `src/data/hotspots.ts` for what's visually where, or `node scripts/inspect-gltf.mjs public/models/hero.glb` for the node names) one at a time: confirm the cursor becomes a pointer and the hotspot's mesh(es) visibly glow. Then move the cursor directly from one hotspot to an adjacent one without leaving the model's surface in between — confirm the first hotspot's glow clears and the second's applies (this is the specific behavior the pointermove fix exists to guarantee — do not skip this check, it's the one a naive pointerenter-based implementation would silently fail). Move the cursor off the model entirely — confirm the glow clears and cursor resets to default.

- [ ] **Step 5: Commit**

```bash
git add src/components/islands/HeroScene.svelte
git commit -m "feat: add hover highlight to hero hotspots"
```

---

### Task 5: Click — accent fade, then navigate

**Files:**
- Modify: `src/lib/three/scene-config.ts`
- Modify: `src/components/islands/HeroScene.svelte`

**Interfaces:**
- Consumes: `gsap` (from `src/lib/motion/gsap-setup.ts`, the design foundation's shared GSAP instance — import from there, not the raw `gsap` package, matching this codebase's established convention), `navigate` (from `astro:transitions/client`).
- Produces: no new exports.

- [ ] **Step 1: Add the overlay color constant to `src/lib/three/scene-config.ts`**

Add below the highlight constants from Task 3:

```ts
/**
 * CSS color for the full-viewport fade-through overlay shown on hotspot
 * click, before navigating. A CSS-ready string rather than a three.js hex
 * number (unlike `hotspotHighlightColor` above) because this paints a plain
 * DOM element, not a three.js material. Same violet as `$color-accent` /
 * `hotspotHighlightColor` — kept in sync by hand for the same reason noted
 * on `hotspotHighlightColor`.
 */
export const fadeOverlayColor = '#8b5cf6';
```

- [ ] **Step 2: Update `src/components/islands/HeroScene.svelte`**

Add two imports at the top of the `<script>` block (alongside the existing ones from Task 4):

```ts
import { navigate } from 'astro:transitions/client';
import { gsap } from '../../lib/motion/gsap-setup';
```

Update the `scene-config` import line to include the new constant:

```ts
import {
	cameraPosition,
	cameraFov,
	dracoDecoderPath,
	fadeOverlayColor
} from '../../lib/three/scene-config';
```

Add overlay state and a helper, and update `handleClick` and `onDestroy`:

```ts
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
```

Replace `handleClick` (the version currently doing `window.location.href = hotspot.route`) with:

```ts
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
```

Update `onDestroy` to also clean up the overlay element if the component unmounts without ever navigating (defensive — matches this codebase's established cleanup discipline):

```ts
onDestroy(() => {
	dracoLoader.dispose();
	document.body.style.cursor = 'default';
	overlayElement?.remove();
});
```

- [ ] **Step 3: Verify typecheck and build**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors.

- [ ] **Step 4: Manual browser check**

Run `npm run dev`, load `http://localhost:4321/`, click a hotspot. Expected: the screen fades to a translucent violet tint, then the destination page appears — via Astro's client-side transition, not a raw browser reload (confirm in the Network tab: no full-document HTML request for the destination page outside of Astro's fetch-based transition machinery; the URL bar updates without a visible white-flash full reload). Then navigate back to `/` (e.g. via the header logo) and click a *different* hotspot — confirm the fade-then-navigate still works correctly on a return visit (proves the overlay element, discarded when Astro swaps the page away from `/`, is correctly recreated by `ensureOverlay()` rather than referencing a stale detached node).

- [ ] **Step 5: Commit**

```bash
git add src/lib/three/scene-config.ts src/components/islands/HeroScene.svelte
git commit -m "feat: fade to accent color before navigating on hotspot click"
```

---

### Task 6: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated check**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run test
npm run build
npm run lint
```

Expected: all five pass with no errors.

- [ ] **Step 2: Full manual pass, desktop**

```bash
npm run dev
```

Open `http://localhost:4321/`. Confirm, in one pass:
- Scene is static (camera doesn't move) — re-confirm per Task 1's guidance, since Tasks 4-5 touched the same file afterward.
- All five hotspots individually: hover glows the correct object, cursor becomes a pointer.
- Moving between adjacent hotspots without leaving the model transitions the glow correctly (Task 4's specific fix).
- Clicking each of the five hotspots (one at a time, navigating back to `/` between each): accent fade, then correct destination page, via client-side transition not a raw reload.

- [ ] **Step 3: Confirm the fallback path is unaffected**

Resize below the mobile breakpoint (or emulate `prefers-reduced-motion: reduce`), reload `/`. Confirm: the static `.hotspot-links` list and wave background are visible, no 3D bundle downloaded (Network tab: no `hero.glb`, `three`, `@threlte/*`, `gsap` request), all five links work as plain instant navigation with no fade. This exercises code this plan didn't touch, but confirms nothing in this plan's changes leaked into or broke the fallback gate.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in hero 3D interaction final verification pass"
```

(Skip this step if Steps 1-3 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** Camera (Task 1 — rotation removed, camera-sourcing draft finalized). Hover highlight (Tasks 2-4 — `findHotspotObject`, `hotspot-highlight.ts`, wired into the component; the pointermove-vs-pointerenter correction was discovered during plan-writing by reading Threlte's actual interactivity source, not assumed from the spec, and is now load-bearing to the plan rather than left as a latent bug). Click fade-then-navigate (Task 5, using the design foundation's shared GSAP instance and Astro's client-side `navigate`). Fallback explicitly re-verified untouched (Task 6). Camera-spinning concern raised during design discussion is resolved as a natural consequence of Task 1 (no code path left that animates rotation) and explicitly called out for empirical (not just reasoned) verification.
- **Type consistency:** `findHotspotObject(object: Object3D): Object3D | null` (Task 2) matches how Task 4 calls it in `handlePointerMove`. `prepareHotspotForHighlight`/`applyHighlight`/`clearHighlight` (Task 3) signatures match Task 4's usage exactly (`Object3D` in, `void` out). `hotspotHighlightColor`/`hotspotHighlightIntensityBoost`/`fadeOverlayColor` (Tasks 3 and 5, both in `scene-config.ts`) are each defined once and consumed once, no naming drift.
- **No placeholders:** every task has complete, real code, including the two things that needed actual investigation rather than assumption during plan-writing — the Threlte pointermove/pointerenter distinction (verified against `node_modules` source) and the "why Hero3D.svelte doesn't need to change" resolution (the overlay is created imperatively from `HeroScene.svelte`'s script, not its Threlte-scene-graph template, so it never needed to move to a different file).

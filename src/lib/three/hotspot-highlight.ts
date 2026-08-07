import type { Color, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { hotspotHighlightColor, hotspotHighlightIntensityBoost } from './scene-config';

interface MeshOriginalState {
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
 * Materials are `MeshStandardMaterial` (or a subclass, like
 * `MeshPhysicalMaterial`, which extends it and keeps the same `emissive`/
 * `emissiveIntensity` properties) — the standard result of glTF's default
 * metallic-roughness material model. This was confirmed against the real
 * `hero.glb`: every hotspot primitive uses `TRIANGLES` mode with a material,
 * and the material extensions the export relies on (`KHR_materials_specular`,
 * `KHR_materials_ior`, `KHR_materials_emissive_strength`) all map onto
 * `MeshStandardMaterial`/`MeshPhysicalMaterial` in three.js's GLTFLoader.
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

/**
 * Disposes every hotspot's cloned materials and forgets the prepared state,
 * so those clones release their GPU-side resources immediately rather than
 * waiting on GC (mirroring the `dracoLoader.dispose()` call on the same
 * teardown path).
 *
 * `preparedHotspots` is module-scoped, not tied to any component instance —
 * and this site uses Astro's `<ClientRouter />`, under which navigating away
 * from and back to `/` within one browsing session unmounts and remounts
 * `Hero3D` without a full page reload (see `mount-hero-3d.ts`). The JS
 * module graph, including this Map, survives that remount. Without calling
 * this on teardown, every remount's `prepareHotspotForHighlight` pass would
 * add five more entries on top of the previous mount's five, each holding a
 * strong reference to that mount's now-orphaned material clones — unbounded
 * growth across repeat homepage visits in one session.
 *
 * Call once from the component's teardown path, *after* clearing any active
 * highlight: this is the only record of a highlighted material's original
 * emissive values, so once it's gone there's nothing left to restore from.
 */
export function clearAllPreparedHotspots(): void {
	for (const states of preparedHotspots.values()) {
		for (const state of states) {
			state.material.dispose();
		}
	}
	preparedHotspots.clear();
}

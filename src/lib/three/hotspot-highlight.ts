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

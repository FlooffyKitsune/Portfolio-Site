import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import {
	applyHighlight,
	clearAllPreparedHotspots,
	clearHighlight,
	prepareHotspotForHighlight
} from './hotspot-highlight';
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

	it('clearAllPreparedHotspots removes prepared entries, making applyHighlight a no-op again', () => {
		const { group, mesh } = makeHotspot();
		prepareHotspotForHighlight(group);

		// Sanity check: highlighting works before the cleanup call.
		applyHighlight(group);
		expect((mesh.material as MeshStandardMaterial).emissive.getHex()).toBe(hotspotHighlightColor);
		clearHighlight(group);

		clearAllPreparedHotspots();

		// With the entry gone, this hotspot should behave exactly as if it had
		// never been prepared: applyHighlight is a no-op and doesn't throw.
		expect(() => applyHighlight(group)).not.toThrow();
		const material = mesh.material as MeshStandardMaterial;
		expect(material.emissive.getHex()).toBe(0x000000);
		expect(material.emissiveIntensity).toBe(0);
	});
});

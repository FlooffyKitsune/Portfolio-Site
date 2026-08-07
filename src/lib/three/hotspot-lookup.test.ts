import { describe, expect, it } from 'vitest';
import { Object3D } from 'three';
import { findHotspotId, findHotspotObject } from './hotspot-lookup';

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

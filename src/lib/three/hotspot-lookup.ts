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

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const path = process.argv[2];
if (!path) {
	console.error('Usage: node scripts/inspect-gltf.mjs <path-to-glb>');
	process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
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

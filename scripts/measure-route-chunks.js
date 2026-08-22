#!/usr/bin/env node
/**
 * measure-route-chunks.js — compute per-route JS payload.
 *
 * Combines the SvelteKit route dictionary with the Vite manifest
 * to show how much JS each route loads on initial visit.
 *
 * Usage: node scripts/measure-route-chunks.js
 */

import fs from 'node:fs';
import path from 'node:path';

const MANIFEST_PATH = '.svelte-kit/output/client/.vite/manifest.json';
const CHUNKS_ROOT = '.svelte-kit/output/client';
const APP_JS_PATH = '.svelte-kit/generated/client-optimized/app.js';

if (!fs.existsSync(MANIFEST_PATH)) {
	console.error(`❌ Manifest not found at ${MANIFEST_PATH}`);
	console.error('   Run: npm run build');
	process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

// Parse SvelteKit route dictionary from app.js
const appJs = fs.readFileSync(APP_JS_PATH, 'utf-8');
const dictMatch = appJs.match(/export const dictionary = \{([\s\S]*?)\};/);
if (!dictMatch) {
	console.error('❌ Could not find route dictionary in app.js');
	process.exit(1);
}
// Parse "/path": [node, node, ...] entries
const routeDict = {};
const entryRegex = /"([^"]+)":\s*\[([\d,\s]+)\]/g;
let m;
while ((m = entryRegex.exec(dictMatch[1])) !== null) {
	routeDict[m[1]] = m[2].split(',').map((s) => parseInt(s.trim(), 10));
}

// Build full transitive dependency graph starting from a set of chunk keys
function collectChunks(startKeys, visited = new Set()) {
	const queue = [...startKeys];
	while (queue.length > 0) {
		const key = queue.shift();
		if (visited.has(key)) continue;
		visited.add(key);
		const entry = manifest[key];
		if (!entry) continue;
		for (const imp of entry.imports ?? []) queue.push(imp);
		// dynamicImports are lazy — they do NOT count toward initial payload
	}
	return visited;
}

// Initial load requires: app entry + root layout (node 0) + node 1 (usually +layout or root)
const appKey = '.svelte-kit/generated/client-optimized/app.js';
const sharedKeys = [appKey, '.svelte-kit/generated/client-optimized/nodes/0.js'];

const shared = collectChunks(sharedKeys);
let sharedSize = 0;
const sharedFiles = [];
for (const k of shared) {
	const e = manifest[k];
	if (!e?.file) continue;
	const p = path.join(CHUNKS_ROOT, e.file);
	if (!fs.existsSync(p)) continue;
	const s = fs.statSync(p).size;
	sharedSize += s;
	sharedFiles.push({ file: e.file, size: s });
}
sharedFiles.sort((a, b) => b.size - a.size);

console.log('Route JS Payload Analysis');
console.log(`(initial-load sizes — dynamic imports excluded)\n`);

console.log(`SHARED (every route):`);
console.log(`  ${(sharedSize / 1024).toFixed(0).padStart(6)} KB across ${shared.size} chunks`);
for (const f of sharedFiles.slice(0, 5)) {
	console.log(`  ${(f.size / 1024).toFixed(0).padStart(6)} KB  ${f.file}`);
}
console.log();

// Per route
console.log(`${'Route'.padEnd(28)} ${'Total'.padStart(8)}  ${'Route-only'.padStart(10)}  Chunks`);
console.log('─'.repeat(70));

const routeStats = [];
for (const [routePath, nodeIds] of Object.entries(routeDict)) {
	const routeKeys = nodeIds.map((id) => `.svelte-kit/generated/client-optimized/nodes/${id}.js`);
	const all = collectChunks([...sharedKeys, ...routeKeys]);

	let total = 0;
	const files = [];
	for (const k of all) {
		const e = manifest[k];
		if (!e?.file) continue;
		const p = path.join(CHUNKS_ROOT, e.file);
		if (!fs.existsSync(p)) continue;
		const s = fs.statSync(p).size;
		total += s;
		files.push({ file: e.file, size: s });
	}

	routeStats.push({
		route: routePath,
		total,
		routeOnly: total - sharedSize,
		chunks: all.size,
		files: files.sort((a, b) => b.size - a.size)
	});
}

routeStats.sort((a, b) => b.total - a.total);

for (const r of routeStats) {
	const totalKb = (r.total / 1024).toFixed(0).padStart(6);
	const routeKb = (r.routeOnly / 1024).toFixed(0).padStart(8);
	console.log(`${r.route.padEnd(28)} ${totalKb} KB  ${routeKb} KB  ${r.chunks}`);
}

console.log('─'.repeat(70));
const heaviest = routeStats[0];
const lightest = routeStats[routeStats.length - 1];
console.log(`\nHeaviest: ${heaviest.route} at ${(heaviest.total / 1024).toFixed(0)} KB`);
console.log(`Lightest: ${lightest.route} at ${(lightest.total / 1024).toFixed(0)} KB`);

import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Hand-written stand-ins for the Node modules the browser bundle reaches. See
// src/lib/node-compat/ for what each one implements and what it deliberately
// refuses to.
//
// `assert` is deliberately `.cjs` and the others are `.ts`. The consumers differ:
// everything reaches `crypto`/`bip39`/`bip32` through a property (`crypto_1.default
// .createHash`, `bip39.generateMnemonic`), which a namespace object satisfies, but
// partisia-blockchain-applications-rpc calls the `assert` module *itself*
// (`var assert = require('assert'); assert(...)`). An ES module compiles to a
// non-callable namespace there; a CommonJS one binds straight to `module.exports`.
// See the comment at the top of assert.cjs for what that cost us.
const nodeCompatAliases: Record<string, string> = {
	crypto: 'src/lib/node-compat/crypto.ts',
	assert: 'src/lib/node-compat/assert.cjs',
	bip39: 'src/lib/node-compat/bip39.ts',
	bip32: 'src/lib/node-compat/bip32.ts'
};

const nodeCompatAliasEntries = Object.fromEntries(
	Object.entries(nodeCompatAliases).map(([id, target]) => [id, path.join(projectRoot, target)])
);

// Tripwires. `crypto-browserify` used to drag all of these into the client chunk;
// nothing should import them now, and a clean build confirms it. Vite's own behaviour
// here is the trap that broke the previous attempt: an unresolved `crypto` is
// *externalized with a warning* and the build still exits 0, leaving a Proxy that
// throws on property access at runtime. Failing the build instead makes a regression
// impossible to miss.
//
// `stream`, `string_decoder` and `util` are listed because they are what
// `crypto-browserify` reached for; they are the trail it would come back along.
const forbiddenInBrowser = ['crypto-browserify', 'scrypt', 'stream', 'string_decoder', 'util'];

/**
 * Fail the client build if a module with no browser implementation sneaks back in.
 *
 * The mapping itself lives in `resolve.alias`, not here. A `resolveId` hook looks
 * tidier and can exempt SSR, but Vite's dev dependency optimizer pre-bundles with
 * esbuild and never calls it — so in `npm run dev` the aliases silently did not
 * apply, `crypto` was externalized inside .vite/deps, and every private-key login
 * failed on a throwing Proxy. `resolve.alias` is honoured by esbuild and Rollup
 * alike, which is why the mapping has to go there.
 *
 * Aliasing globally is safe for SSR because SvelteKit externalizes dependencies:
 * the server imports @metanames/sdk from node_modules at runtime, through plain
 * Node resolution that Vite never touches. App source under src/ imports none of
 * these directly.
 */
function nodeCompat(): Plugin {
	return {
		name: 'node-compat-tripwire',
		enforce: 'pre',
		resolveId(source, importer, options) {
			if (options?.ssr) return null;

			const bare = source.replace(/^node:/, '');

			if (forbiddenInBrowser.includes(bare))
				throw new Error(
					`[node-compat] "${source}" was imported by ${importer ?? '(unknown)'} but has no ` +
						`browser implementation. Add one under src/lib/node-compat/ and register it in ` +
						`vite.config.ts, or keep it out of the client graph. Leaving it unresolved would ` +
						`let Vite externalize it into a Proxy that throws only when a property is read.`
				);

			return null;
		}
	};
}

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'metanames',
				project: 'app'
			}
		}),
		sveltekit(),
		nodeCompat(),
		// Kept, but narrowed to `buffer`, for exactly one job: injecting the `Buffer`
		// global. @metanames/sdk, @secata-public/bitmanipulation-ts and the Partisia
		// crypto library all use `Buffer` as a free variable, so something has to bind
		// it, and doing that correctly means an AST-aware transform ordered against
		// Vite's CommonJS conversion — which this plugin already gets right. That is
		// why the plugin stays rather than being removed outright: `resolve.alias`
		// maps module *imports*, and a free variable is not an import.
		//
		// Dropping `crypto` and `stream` from the list is what sheds crypto-browserify,
		// scrypt, pbkdf2, browserify-aes, des.js, public-encrypt and the readable-stream
		// shim. `stream` turned out to be dead config — nothing in the client graph
		// imports it, and the tripwire above now fails the build if that changes.
		// Note `include: []` would mean *all* modules, not none.
		//
		// `global` and `process` are kept deliberately, not by inertia. Measured with
		// `process: false`: SHARED drops 1023 KB -> 1021 KB, and dev leaves
		// `globalThis.process` undefined with no page error on /, /domain/[name],
		// /register/[name] or /profile. So the shim costs 2 KB and no page load needs it.
		//
		// It stays because a wallet SDK does. partisia-blockchain-applications-sdk reads
		// a bare `process.env.DEV` in `sdk-listeners.js`, on the connect and sign paths,
		// inside the loop that waits for the extension to answer — so a real
		// (asynchronous) extension reaches it and the synchronous stub in
		// tests/e2e/crypto-shim.spec.ts does not. The same CommonJS idiom is all over
		// Ledger WebUSB and the MetaMask SDK, neither of which any spec drives. 0.2% of
		// the payload buys immunity from the exact failure this whole step is built to
		// avoid: a wallet path that throws only once a user reaches it.
		nodePolyfills({
			include: ['buffer'],
			globals: { Buffer: true, global: true, process: true }
		}),
		tsconfigPaths(),
		// Keep this LAST so it sees the final bundle
		visualizer({
			filename: 'bundle-report.html',
			template: 'raw-data',
			gzipSize: true,
			brotliSize: true
		})
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Split Partisia SDK by submodule so routes load only what they need
					if (id.includes('@partisiablockchain/zk-client')) return 'sdk-zk';
					if (id.includes('@partisiablockchain/blockchain-api-transaction-client')) return 'sdk-tx';
					if (id.includes('@partisiablockchain/abi-client')) return 'sdk-abi';
					if (id.includes('@partisiablockchain/rpc-client')) return 'sdk-rpc';
					// MetaMask SDK is also large
					if (id.includes('@metamask/')) return 'metamask';
					if (id.includes('ethers')) return 'ethers';
					// Everything else: let Vite decide
				}
			}
		}
	},
	// `bn.js` was bundled 7 times (~709 KB rendered): once as the hoisted 5.2.3 that
	// the Partisia packages ask for, plus a private 4.12.x copy each for elliptic,
	// tiny-secp256k1, asn1.js, create-ecdh, diffie-hellman, miller-rabin and
	// public-encrypt. Deduping resolves them all to the root 5.2.3. That crosses a
	// major boundary for the 4.x consumers — 5.0 renamed `strip` to `_strip` and
	// dropped `inspect` — so `crypto-vectors.test.ts` pins the elliptic + bn.js
	// signature/address output to catch a silently-wrong implementation.
	//
	// `@noble/hashes` deliberately is *not* deduped, though it looks like the same
	// case: `crypto.ts` asks for the root 1.8.0, so npm nests a private 1.4.0 under
	// each of @scure/bip32, @scure/bip39 and @noble/curves, and all three want the
	// same `~1.4.0` — three identical copies of sha256, sha512, ripemd160, hmac and
	// utils, ~60 KB rendered in the wallet-crypto chunk. Adding it here fails the
	// build: 1.8.0 renamed `_assert`'s `bytes` export to `abytes`, and @scure/bip32
	// imports the old name from that private path. Tolerable, because the whole 60 KB
	// is in an async chunk only the Partisia wallet fetches, never in SHARED. Revisit
	// when @scure/bip32 moves to @noble/hashes 1.8+, not before.
	resolve: {
		dedupe: ['bn.js'],
		alias: nodeCompatAliasEntries
	},
	// Ledger's lib-es builds use extensionless ESM imports (`./helpers`), which
	// Node's native ESM resolver rejects when Vite externalizes them during SSR.
	// Force them through Vite's bundler instead.
	ssr: {
		noExternal: [/^@ledgerhq\//]
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Vitest resolves Node builtins as external before `resolve.alias` applies, so
		// it needs the mapping restated here. Without it the unit suite would exercise
		// Node's real `crypto` and `assert` — passing while telling us nothing about
		// what ships.
		//
		// The reach of this is narrower than it looks, and the difference matters.
		// It covers bare imports from files Vitest transforms — i.e. src/, which is
		// what node-compat/smoke.test.ts exercises. It does *not* reach the Partisia
		// crypto package: dependencies are externalized and loaded by Node, and
		// `server.deps.inline` does not change that here because Vite only converts
		// CommonJS during build, so the package's `require('crypto')` stays a native
		// one either way. Verified by making `createHash` throw and watching
		// crypto-vectors.test.ts still pass. Those vectors therefore pin the
		// elliptic + bn.js half of the stack (the part `resolve.dedupe` moved) under
		// Node's real crypto; the shims' own output is pinned by smoke.test.ts and
		// node-compat/wallet-crypto.test.ts, and the two are wired together only in a
		// browser, which tests/e2e/crypto-shim.spec.ts covers against the dev server —
		// including the Partisia connect handshake, which is the only path that reaches
		// HD derivation and the ciphers.
		alias: nodeCompatAliasEntries,
		coverage: {
			provider: 'v8',
			// Vitest instruments everything by default, which pulled `playwright.config.ts`,
			// `svelte.config.js` and all 25 `.svelte` files — none of which a Vitest test can
			// reach — into the report. That reported 14.09 % while `src/lib` was at 88 %.
			// Components are covered by the Playwright suite instead.
			include: ['src/lib/**/*.ts'],
			exclude: ['src/lib/**/*.{test,spec}.ts', 'src/lib/index.ts'],
			reporter: ['text', 'lcov'],
			thresholds: {
				statements: 98,
				branches: 94,
				functions: 99,
				lines: 98
			}
		}
	}
});

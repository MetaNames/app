import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'metanames',
				project: 'app'
			}
		}),
		sveltekit(),
		nodePolyfills({
			include: ['buffer', 'crypto', 'stream']
		}),
		tsconfigPaths()
	],
	// Ledger's lib-es builds use extensionless ESM imports (`./helpers`), which
	// Node's native ESM resolver rejects when Vite externalizes them during SSR.
	// Force them through Vite's bundler instead.
	ssr: {
		noExternal: [/^@ledgerhq\//]
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

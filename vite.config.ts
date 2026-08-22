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
		include: ['src/**/*.{test,spec}.{js,ts}'],
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

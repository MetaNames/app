import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills-vite8';

export default defineConfig({
	plugins: [
		// sentrySvelteKit({
		// 	sourceMapsUploadOptions: {
		// 		org: 'metanames',
		// 		project: 'app'
		// 	}
		// }),
		sveltekit(),
		nodePolyfills({
			include: ['buffer', 'crypto', 'stream']
		})
	],
	resolve: {
		tsconfigPaths: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'


import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills(), tsconfigPaths()],
	optimizeDeps: {
		include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

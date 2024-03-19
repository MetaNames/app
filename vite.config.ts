import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
    plugins: [sveltekit(), nodePolyfills(), tsconfigPaths()],
    build: {
        rollupOptions: {
            plugins: [
                nodeResolve({
                    resolveId(source) {
                        if (source === 'crypto' || source === 'stream') return false;

                        return null;
                    }
                }),
            ]
        }
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});

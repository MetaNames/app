import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
    plugins: [sentrySvelteKit({
        sourceMapsUploadOptions: {
            org: "metanames",
            project: "app"
        }
    }), sveltekit(), nodePolyfills(), tsconfigPaths()],
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
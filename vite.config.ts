import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills-vite8';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
		})
	],
	resolve: {
		tsconfigPaths: true,
		alias: {
			'@ledgerhq/hw-transport-webusb': path.resolve(
				__dirname,
				'node_modules/@ledgerhq/hw-transport-webusb/lib/TransportWebUSB.js'
			)
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

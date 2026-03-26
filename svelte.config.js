import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess({
		// Use modern Sass API to silence deprecation warning
		// The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0
		style: {
			scss: {
				api: 'modern'
			}
		}
	}),

	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		inlineStyleThreshold: 4096,
		alias: {
			'src/*': './src/*',
			$lib: './src/lib',
			'$lib/*': './src/lib/*'
		}
	}
};

export default config;

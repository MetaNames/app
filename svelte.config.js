import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: preprocess(),

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

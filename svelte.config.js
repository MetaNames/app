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
			'$lib/*': './src/lib/*',
			// `@smui/banner` points its `types` at `src/index.d.ts`, which pulls the uncompiled
			// `src/Banner.types.ts` into the typecheck; that file re-exports ambient const enums
			// from `@material/banner`, which `verbatimModuleSyntax` forbids. Point at the published
			// `dist` entry — the same one the package's `svelte` export condition resolves to — so
			// the check reads `dist/*.d.ts` and `skipLibCheck` covers it.
			'@smui/banner': './node_modules/@smui/banner/dist'
		}
	}
};

export default config;

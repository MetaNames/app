import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	{
		ignores: [
			'.svelte-kit/',
			'.vercel/',
			'build/',
			'coverage/',
			'package/',
			'node_modules/',
			'src/styles/theme/',
			'static/',
			'test-results/',
			'.jules/',
			'.Jules/'
		]
	},
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.svelte'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
				extraFileExtensions: ['.svelte']
			},
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: { '@typescript-eslint': tsPlugin },
		rules: { ...tsPlugin.configs.recommended.rules }
	},
	{
		// typescript-eslint's documented guidance: no-undef cannot see type-only globals
		// (e.g. `RequestInit`) and duplicates what tsc already checks, so it is off for TS.
		files: ['**/*.ts', '**/*.svelte'],
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: { parser: tsParser }
		}
	}
];

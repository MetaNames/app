import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020
			},
			globals: {
				browser: true,
				es2017: true,
				node: true
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsparser
			},
			globals: {
				browser: true,
				es2017: true,
				node: true
			}
		},
		plugins: {
			svelte: sveltePlugin,
			'@typescript-eslint': tseslint
		},
		rules: {
			...sveltePlugin.configs.recommended.rules,
			...tseslint.configs.recommended.rules
		}
	},
	{
		ignores: ['node_modules/**', 'dist/**', '.svelte-kit/**', 'build/**', '.vercel/**']
	}
];

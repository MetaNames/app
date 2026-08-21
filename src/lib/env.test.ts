import { describe, it, expect } from 'vitest';
import { optionalEnv } from './env';

describe('optionalEnv', () => {
	it('returns the value when set', () => {
		expect(optionalEnv('https://metanames.app', '')).toBe('https://metanames.app');
	});

	it('falls back when the value is undefined', () => {
		expect(optionalEnv(undefined, 'https://metanames.app')).toBe('https://metanames.app');
	});

	it('falls back when the value is the literal string "undefined"', () => {
		expect(optionalEnv('undefined', 'https://metanames.app')).toBe('https://metanames.app');
	});

	it('falls back on an empty value', () => {
		expect(optionalEnv('', 'https://metanames.app')).toBe('https://metanames.app');
	});
});

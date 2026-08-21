import { describe, it, expect } from 'vitest';
import { filterDomainsByName } from './filter';

const domains = [{ name: 'alice.meta' }, { name: 'bob.meta' }, { name: 'ALICIA.meta' }];

describe('filterDomainsByName', () => {
	it('returns every domain for an empty search', () => {
		expect(filterDomainsByName(domains, '')).toEqual(domains);
	});

	it('returns every domain for a whitespace-only search', () => {
		expect(filterDomainsByName(domains, '   ')).toEqual(domains);
	});

	it('matches case-insensitively on a substring', () => {
		expect(filterDomainsByName(domains, 'ali')).toEqual([
			{ name: 'alice.meta' },
			{ name: 'ALICIA.meta' }
		]);
	});

	it('returns nothing when nothing matches', () => {
		expect(filterDomainsByName(domains, 'zzz')).toEqual([]);
	});
});

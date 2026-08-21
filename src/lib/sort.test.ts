import { describe, it, expect } from 'vitest';
import { compareByKey } from './sort';

const rows = [
	{ tokenId: 3, name: 'c.meta' },
	{ tokenId: 1, name: 'a.meta' },
	{ tokenId: 2, name: 'b.meta' }
];

describe('compareByKey', () => {
	it('sorts numbers ascending', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'ascending'));

		expect(sorted.map((row) => row.tokenId)).toEqual([1, 2, 3]);
	});

	it('sorts numbers descending', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'descending'));

		expect(sorted.map((row) => row.tokenId)).toEqual([3, 2, 1]);
	});

	it('sorts strings with locale compare', () => {
		const sorted = [...rows].sort(compareByKey('name', 'ascending'));

		expect(sorted.map((row) => row.name)).toEqual(['a.meta', 'b.meta', 'c.meta']);
	});

	it('treats an unsorted column the same as descending, as the table does today', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'none'));

		expect(sorted.map((row) => row.tokenId)).toEqual([3, 2, 1]);
	});
});

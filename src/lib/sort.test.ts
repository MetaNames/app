import { describe, it, expect } from 'vitest';
import { compareByKey, paginateSorted } from './sort';

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

	it('treats the other direction the same as descending, as the table does today', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'other'));

		expect(sorted.map((row) => row.tokenId)).toEqual([3, 2, 1]);
	});
});

describe('paginateSorted', () => {
	it('returns a new sorted array without mutating the input', () => {
		const input = [...rows];

		const page = paginateSorted(input, 'tokenId', 'ascending', 0, 2);

		expect(page.map((row) => row.tokenId)).toEqual([1, 2]);
		// original array untouched: same order as before the call
		expect(input.map((row) => row.tokenId)).toEqual([3, 1, 2]);
	});

	it('returns the requested page slice', () => {
		const sortedAsc = [...rows].sort(compareByKey('tokenId', 'ascending'));

		expect(paginateSorted(rows, 'tokenId', 'ascending', 0, 2).map((r) => r.tokenId)).toEqual(
			sortedAsc.slice(0, 2).map((r) => r.tokenId)
		);
		expect(paginateSorted(rows, 'tokenId', 'ascending', 1, 2).map((r) => r.tokenId)).toEqual([3]);
	});

	it('clamps an out-of-range page to an empty result instead of throwing', () => {
		expect(paginateSorted(rows, 'tokenId', 'ascending', 5, 2)).toEqual([]);
	});

	it('handles an empty list', () => {
		expect(paginateSorted([], 'tokenId', 'ascending', 0, 5)).toEqual([]);
	});

	it('respects sort direction for strings', () => {
		expect(paginateSorted(rows, 'name', 'descending', 0, 3).map((r) => r.name)).toEqual([
			'c.meta',
			'b.meta',
			'a.meta'
		]);
	});
});

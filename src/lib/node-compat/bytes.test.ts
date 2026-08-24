import { describe, expect, it } from 'vitest';
import { toBytes } from './bytes';

/**
 * `toBytes` is the one decoder both sides of the lazy seam share, so a drift here
 * would not fail — it would derive a different key. These pin the three inputs
 * Node's `BinaryLike` allows, including the view case that hands us a window into a
 * larger buffer rather than the whole of it.
 */
describe('toBytes', () => {
	it('decodes a string as utf8 by default', () => {
		expect([...toBytes('hé')]).toEqual([0x68, 0xc3, 0xa9]);
	});

	it('honours an explicit encoding', () => {
		expect([...toBytes('ff00', 'hex')]).toEqual([0xff, 0x00]);
		expect([...toBytes('aGk=', 'base64')]).toEqual([0x68, 0x69]);
	});

	it('passes a Uint8Array straight through without copying', () => {
		const bytes = new Uint8Array([1, 2, 3]);

		expect(toBytes(bytes)).toBe(bytes);
	});

	// The reason this branch exists: partisia hands us Buffer slices and DataViews
	// that share a backing ArrayBuffer with unrelated bytes. `new Uint8Array(buffer)`
	// alone would read the whole buffer and hash the neighbours too.
	it('reads only the window a view covers, not its whole backing buffer', () => {
		const backing = new Uint8Array([1, 2, 3, 4, 5, 6]).buffer;

		expect([...toBytes(new DataView(backing, 2, 3))]).toEqual([3, 4, 5]);
		expect([...toBytes(new Int16Array(backing, 2, 2))]).toEqual([3, 4, 5, 6]);
	});
});

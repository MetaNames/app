import { describe, it, expect } from 'vitest';

import { buildProfileChips, buildSocialChips } from './chips';
import { profileRecords, socialRecords } from './sdk';

// Characterization tests: these pin the exact rendering semantics the nested
// conditionals in Domain.svelte used to encode, before they were collapsed into
// buildProfileChips/buildSocialChips.

const RECORDS = {
	Bio: 'hello world',
	Email: 'me@example.com',
	Uri: 'https://example.com/page',
	Wallet: '00aabbcc00112233445566778899aabbccddeeff00',
	Price: '42',
	Twitter: '@metanames',
	Discord: 'https://discord.gg/xyz'
};

describe('buildProfileChips', () => {
	it('always leads with the short-link chip (stripped value, raw href, ellipsis)', () => {
		const [link] = buildProfileChips('foo', {}, profileRecords);

		expect(link).toEqual({
			label: 'link',
			value: 'metanam.es/foo',
			href: 'https://metanam.es/foo',
			ellipsis: true,
			type: 'text'
		});
	});

	it('renders every existing profile record in profileRecords order', () => {
		const chips = buildProfileChips('foo', RECORDS, profileRecords);

		expect(chips.map((c) => c.label)).toEqual(['link', 'Bio', 'Email', 'Uri', 'Wallet', 'Price']);
	});

	it('skips profile records the domain does not have', () => {
		const chips = buildProfileChips('foo', { Uri: 'https://example.com' }, profileRecords);

		expect(chips.map((c) => c.label)).toEqual(['link', 'Uri']);
	});

	it('turns a valid http(s) Uri into a link chip with its scheme stripped from the label value', () => {
		const uri = buildProfileChips('foo', { Uri: 'https://example.com/page' }, profileRecords)[1];

		expect(uri).toEqual({
			label: 'Uri',
			value: 'example.com/page',
			href: 'https://example.com/page'
		});
	});

	it('falls an invalid Uri through as a plain text chip keeping the full raw value', () => {
		const uri = buildProfileChips('foo', { Uri: 'javascript:alert(1)' }, profileRecords)[1];

		expect(uri).toEqual({ label: 'Uri', value: 'javascript:alert(1)' });
		expect(uri.href).toBeUndefined();
	});

	it('appends $ to Price values only', () => {
		const price = buildProfileChips('foo', { Price: '42' }, profileRecords)[1];
		const bio = buildProfileChips('foo', { Bio: 'hi' }, profileRecords)[1];

		expect(price.value).toBe('42$');
		expect(bio.value).toBe('hi');
	});
});

describe('buildSocialChips', () => {
	it('renders one plain text chip per existing social record, in socialRecords order', () => {
		const chips = buildSocialChips(RECORDS, socialRecords);

		expect(chips).toEqual([
			{ label: 'Twitter', value: '@metanames' },
			{ label: 'Discord', value: 'https://discord.gg/xyz' }
		]);
	});

	it('renders nothing when no social records exist', () => {
		expect(buildSocialChips({ Bio: 'x' }, socialRecords)).toEqual([]);
	});
});

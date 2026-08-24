import { describe, it, expect } from 'vitest';
import { Domain } from '@metanames/sdk';

import { reviveDomain, type DomainDto } from './domain-dto';

const dto = (overrides: Partial<DomainDto> = {}): DomainDto => ({
	name: 'alice.meta',
	tld: 'meta',
	createdAt: '2024-03-01T10:00:00.000Z',
	owner: '00d1f3d2b0e0c3a4b5c6d7e8f900112233445566',
	tokenId: 42,
	records: { Bio: 'hello' },
	...overrides
});

describe('reviveDomain', () => {
	it('returns null when the payload holds no domain', () => {
		expect(reviveDomain(null)).toBeNull();
	});

	it('returns a Domain instance, so the model methods are available', () => {
		const domain = reviveDomain(dto());

		expect(domain).toBeInstanceOf(Domain);
		expect(domain?.nameWithoutTLD).toBe('alice');
	});

	it('carries the plain fields across untouched', () => {
		const domain = reviveDomain(dto());

		expect(domain?.name).toBe('alice.meta');
		expect(domain?.tld).toBe('meta');
		expect(domain?.owner).toBe('00d1f3d2b0e0c3a4b5c6d7e8f900112233445566');
		expect(domain?.tokenId).toBe(42);
		expect(domain?.records).toEqual({ Bio: 'hello' });
	});

	it('parses the serialized dates back into Date objects', () => {
		const domain = reviveDomain(dto({ expiresAt: '2025-03-01T10:00:00.000Z' }));

		expect(domain?.createdAt).toBeInstanceOf(Date);
		expect(domain?.createdAt.toISOString()).toBe('2024-03-01T10:00:00.000Z');
		expect(domain?.expiresAt).toBeInstanceOf(Date);
		expect(domain?.expiresAt?.toISOString()).toBe('2025-03-01T10:00:00.000Z');
	});

	// `expiresAt` is optional on IDomain and the UI prints "Never" for a missing one, so an
	// absent key must stay absent rather than become an Invalid Date.
	it('leaves expiresAt undefined when the payload omits it', () => {
		const domain = reviveDomain(dto());

		expect(domain?.expiresAt).toBeUndefined();
	});

	it('leaves expiresAt undefined when the payload spells it as null', () => {
		const domain = reviveDomain(dto({ expiresAt: null }));

		expect(domain?.expiresAt).toBeUndefined();
	});

	it('keeps parentId undefined when the payload omits it', () => {
		expect(reviveDomain(dto())?.parentId).toBeUndefined();
	});

	// The payload is already-normalized output of `Domain#toJSON`, while the constructor
	// normalizes again — a subdomain has to survive that second pass unchanged.
	it('does not re-reverse the labels of a subdomain', () => {
		const domain = reviveDomain(dto({ name: 'sub.alice.meta', parentId: 'alice.meta' }));

		expect(domain?.name).toBe('sub.alice.meta');
		expect(domain?.parentId).toBe('alice.meta');
		expect(domain?.nameWithoutTLD).toBe('sub.alice');
	});

	// `toJSON` always appends the TLD, but the wire format is not ours to enforce — a name that
	// arrives without it must not lose its last label to the suffix strip.
	it('handles a name that does not carry the TLD', () => {
		const domain = reviveDomain(dto({ name: 'alice' }));

		expect(domain?.name).toBe('alice.meta');
	});

	it('round-trips a domain through toJSON', () => {
		const original = new Domain({
			name: 'alice.sub',
			tld: 'meta',
			createdAt: new Date('2024-03-01T10:00:00.000Z'),
			expiresAt: new Date('2025-03-01T10:00:00.000Z'),
			owner: 'abc',
			tokenId: 7,
			parentId: 'alice',
			records: { Bio: 'hi' }
		});

		const revived = reviveDomain(JSON.parse(JSON.stringify(original.toJSON())));

		expect(revived?.toJSON()).toEqual(original.toJSON());
	});
});

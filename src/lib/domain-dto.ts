import { Domain } from '@metanames/sdk';

/**
 * A `Domain` as it survives a trip through `JSON`.
 *
 * `/api/domains/[name]` answers with `Domain#toJSON()`, so the two `Date` fields arrive as ISO
 * strings and the optional ones may be missing outright. Record values are typed as strings
 * rather than the SDK's `string | Buffer`: the SDK builds them with `data.toString()`, so a
 * Buffer never reaches the wire.
 */
export interface DomainDto {
	name: string;
	tld: string;
	createdAt: string;
	expiresAt?: string | null;
	owner: string;
	tokenId: number;
	parentId?: string | null;
	records: Record<string, string>;
}

/**
 * Undo the name normalization the `Domain` constructor applies.
 *
 * The constructor strips the TLD, reverses the labels and re-appends the TLD, and `toJSON()`
 * hands back that finished name. Feeding it straight back in would reverse a second time, so
 * `sub.alice.meta` would come out as `alice.sub.meta`. Pre-reversing makes the constructor's
 * pass a no-op instead. Single-label names are unaffected either way.
 */
function denormalize(name: string, tld: string): string {
	const suffix = `.${tld}`;
	const withoutTld = name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;

	return withoutTld.split('.').reverse().join('.');
}

/**
 * Rebuild a `Domain` model from an API payload.
 *
 * `null` is passed through untouched: the endpoint returns it for a domain that does not exist,
 * which is a real answer and must stay distinguishable from a failed read.
 */
export function reviveDomain(dto: DomainDto | null): Domain | null {
	if (!dto) return null;

	return new Domain({
		...dto,
		name: denormalize(dto.name, dto.tld),
		// Absent and `null` both mean "no expiry"; `new Date(null)` would be the epoch and
		// `new Date(undefined)` an Invalid Date, so neither can go through the parse.
		createdAt: new Date(dto.createdAt),
		expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
		parentId: dto.parentId ? denormalize(dto.parentId, dto.tld) : undefined
	});
}

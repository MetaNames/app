import type { Records } from '@metanames/sdk';

import { shortLinkUrl } from './url';
import { isValidURL, removeHTTPIfPresent } from './utils';

// Mirrors the props of src/components/Chip.svelte so Domain.svelte can render one
// {#each} over these specs without re-deriving anything per chip. `type` is only ever
// set to 'text': the short-link chip carries an href but must keep the copy icon (and
// copy-to-clipboard behavior) instead of the open-in-new one that an href normally
// selects.
export interface ChipSpec {
	label: string;
	value: string;
	href?: string;
	ellipsis?: boolean;
	type?: 'text';
}

const recordToString = (record: string | Buffer) => String(record);

/**
 * The Profile section's chips, in render order: the always-present short link, then
 * every profile-class record the domain actually has.
 *
 * Semantics preserved verbatim from the previous nested template conditionals:
 * - `Uri` becomes a link chip only when `isValidURL` passes; otherwise it falls
 *   through as a plain text chip showing the raw, un-stripped value.
 * - `Price` appends a trailing `$`.
 * - Everything else renders as a plain text chip.
 */
export const buildProfileChips = (
	nameWithoutTLD: string,
	records: Records,
	klasses: readonly string[]
): ChipSpec[] => [
	{
		label: 'link',
		value: removeHTTPIfPresent(shortLinkUrl(nameWithoutTLD)),
		href: shortLinkUrl(nameWithoutTLD),
		ellipsis: true,
		type: 'text'
	},
	...klasses
		.filter((klass) => records[klass])
		.map((klass): ChipSpec => {
			const value = recordToString(records[klass]);
			if (klass === 'Uri') {
				return isValidURL(value)
					? { label: klass, value: removeHTTPIfPresent(value), href: value }
					: // Not a scheme-checked URL: no href, and unlike the link variant the
						// value keeps its scheme prefix.
						{ label: klass, value };
			}
			if (klass === 'Price') return { label: klass, value: `${value}$` };
			return { label: klass, value };
		})
];

/** The Social section's chips: one plain text chip per existing social record. */
export const buildSocialChips = (records: Records, klasses: readonly string[]): ChipSpec[] =>
	klasses
		.filter((klass) => records[klass])
		.map((klass) => ({ label: klass, value: recordToString(records[klass]) }));

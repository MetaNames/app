import { describe, it, expect, vi } from 'vitest';
import { analyzeDomain } from './loaders';

vi.mock('./sdk', () => ({
	metaNamesSdkFactory: () => ({
		domainRepository: {
			analyze: (name: string) => {
				if (name === 'bad name') throw new Error('Invalid domain name');
				if (name === 'not an error') throw 'a bare string, as a minified SDK can throw';

				return { name, tld: 'meta', parentId: undefined };
			}
		}
	})
}));

describe('analyzeDomain', () => {
	it('returns the analyzed domain', () => {
		expect(analyzeDomain('alice')).toEqual({
			analyzed: { name: 'alice', tld: 'meta', parentId: undefined }
		});
	});

	it('returns the error message when analysis throws', () => {
		expect(analyzeDomain('bad name')).toEqual({ error: 'Invalid domain name' });
	});

	// A rejection that is not an Error has no `.message`, so reading one would put
	// `undefined` on the page instead of a message.
	it('falls back to a generic message when the rejection is not an Error', () => {
		expect(analyzeDomain('not an error')).toEqual({ error: 'Something went wrong' });
	});
});

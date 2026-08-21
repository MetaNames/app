import { describe, it, expect, vi } from 'vitest';
import { analyzeDomain } from './loaders';

vi.mock('./sdk', () => ({
	metaNamesSdkFactory: () => ({
		domainRepository: {
			analyze: (name: string) => {
				if (name === 'bad name') throw new Error('Invalid domain name');

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
});

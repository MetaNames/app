import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @sentry/sveltekit
vi.mock('@sentry/sveltekit', () => ({
	captureException: vi.fn(),
	init: vi.fn()
}));

// Mock the SDK
vi.mock('@metanames/sdk', () => {
	const mockAnalyze = vi.fn((name: string) => ({
		parentId: name.includes('.') ? name.split('.')[1] : name + '.mns',
		tld: 'mns'
	}));

	const mockFind = vi.fn();
	const mockDomainValidator = {
		validate: vi.fn((name: string) => name.length >= 3),
		normalize: vi.fn((name: string) => name.toLowerCase()),
		getErrors: vi.fn(() => [])
	};

	const mockCalculateMintFees = vi.fn(() => ({
		fees: { gas: '100000', storage: '50000' },
		gas: '100000',
		storage: '50000'
	}));

	const mockDomainRepository = {
		analyze: mockAnalyze,
		find: mockFind,
		domainValidator: mockDomainValidator,
		calculateMintFees: mockCalculateMintFees,
		getAll: vi.fn().mockResolvedValue([]),
		count: vi.fn().mockResolvedValue(100),
		getOwners: vi.fn().mockResolvedValue(['0xabc', '0xdef'])
	};

	const mockConfig = {
		byoc: [{ symbol: 'BTC' }, { symbol: 'ETH' }, { symbol: 'USDT' }],
		tld: 'mns'
	};

	return {
		MetaNamesSdk: vi.fn().mockImplementation(() => ({
			domainRepository: mockDomainRepository,
			config: mockConfig
		})),
		metaNamesSdkFactory: vi.fn(() => ({
			domainRepository: mockDomainRepository,
			config: mockConfig
		})),
		DomainValidator: vi.fn().mockImplementation(() => mockDomainValidator),
		Enviroment: { testnet: 'testnet', mainnet: 'mainnet' },
		RecordClassEnum: { Twitter: 0, Discord: 1, Github: 2, Telegram: 3, Website: 4 },
		BYOCSymbol: ['BTC', 'ETH', 'USDT']
	};
});

// Import after mocking
import { handleError } from '$lib/server';

describe('server handleError', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the handler response untouched on success', async () => {
		const fn = vi.fn().mockResolvedValue({ status: 200, json: async () => ({ data: 'test' }) });

		const result = await handleError(fn);

		expect(result.status).toBe(200);
	});

	it('answers an unexpected Error with a generic 500 and hides the message', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fn = vi.fn().mockRejectedValue(new Error('secret internal detail'));

		const result = await handleError(fn);
		const resultJson = await result.json();

		expect(result.status).toBe(500);
		expect(resultJson).toEqual({ error: 'Internal Server Error' });
		expect(JSON.stringify(resultJson)).not.toContain('secret internal detail');
		// The detail must still reach the server-side log for diagnosis.
		expect(consoleError).toHaveBeenCalled();

		consoleError.mockRestore();
	});

	it('answers a non-Error rejection with the same generic 500', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fn = vi.fn().mockRejectedValue('String error');

		const result = await handleError(fn);

		expect(result.status).toBe(500);
		expect(await result.json()).toEqual({ error: 'Internal Server Error' });

		consoleError.mockRestore();
	});

	it('passes through the status and client-safe message of an HttpError-shaped rejection', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fn = vi.fn().mockRejectedValue(
			Object.assign(new Error('Domain not found'), {
				status: 404,
				body: { message: 'Domain not found' }
			})
		);

		const result = await handleError(fn);

		expect(result.status).toBe(404);
		expect(await result.json()).toEqual({ error: 'Domain not found' });

		consoleError.mockRestore();
	});
});

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
import { handleError, getStats } from '$lib/server';

// The mocked domain repository shared by every MetaNamesSdk instance this module creates.
// The factory is mocked, so its return type has to be asserted to reach the shared mock.
async function mockedDomainRepository(): Promise<Record<string, unknown>> {
	const mod = (await import('@metanames/sdk')) as unknown as {
		metaNamesSdkFactory: () => { domainRepository: Record<string, unknown> };
	};
	return mod.metaNamesSdkFactory().domainRepository;
}

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

describe('getStats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns domain count, owner count, and recent domains', async () => {
		const mockDomains = [
			{ name: 'domain1', createdAt: new Date('2026-01-01') },
			{ name: 'domain2', createdAt: new Date('2026-01-02') }
		];
		const domainRepository = await mockedDomainRepository();

		domainRepository.getAll = vi.fn().mockResolvedValue(mockDomains);
		domainRepository.count = vi.fn().mockResolvedValue(42);
		domainRepository.getOwners = vi.fn().mockResolvedValue(['0x1', '0x2', '0x3']);

		const stats = await getStats();

		expect(stats.domainCount).toBe(42);
		expect(stats.ownerCount).toBe(3);
		expect(stats.recentDomains).toHaveLength(2);
	});

	it('handles getAll errors gracefully as an empty recent list', async () => {
		const domainRepository = await mockedDomainRepository();

		// Only getAll has a catch handler, so it should degrade to an empty array.
		domainRepository.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

		const stats = await getStats();

		expect(stats.recentDomains).toEqual([]);
	});

	it('sorts recent domains by creation date descending', async () => {
		const domainRepository = await mockedDomainRepository();

		const mockDomains = [
			{ name: 'old', createdAt: new Date('2026-01-01') },
			{ name: 'new', createdAt: new Date('2026-03-01') },
			{ name: 'middle', createdAt: new Date('2026-02-01') }
		];

		domainRepository.getAll = vi.fn().mockResolvedValue(mockDomains);
		domainRepository.count = vi.fn().mockResolvedValue(3);
		domainRepository.getOwners = vi.fn().mockResolvedValue(['0x1']);

		const stats = await getStats();

		expect(stats.recentDomains[0].name).toBe('new');
		expect(stats.recentDomains[1].name).toBe('middle');
		expect(stats.recentDomains[2].name).toBe('old');
	});

	it('issues the three lookups concurrently', async () => {
		const domainRepository = await mockedDomainRepository();

		// Sequential awaits interleave as start/end/start/end...; running them together
		// starts all three before the first one settles.
		const events: string[] = [];
		const defer = <T>(name: string, value: T) => {
			events.push(`start:${name}`);
			return new Promise<T>((resolve) =>
				setTimeout(() => {
					events.push(`end:${name}`);
					resolve(value);
				}, 0)
			);
		};

		domainRepository.count = vi.fn(() => defer('count', 7));
		domainRepository.getOwners = vi.fn(() => defer('getOwners', ['0x1']));
		domainRepository.getAll = vi.fn(() => defer('getAll', []));

		const stats = await getStats();

		expect(events.slice(0, 3)).toEqual(['start:count', 'start:getOwners', 'start:getAll']);
		expect(stats).toEqual({ domainCount: 7, ownerCount: 1, recentDomains: [] });
	});
});

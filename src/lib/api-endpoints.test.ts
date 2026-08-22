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
import { handleError, apiError, getStats } from '$lib/server';

const mockedDomainRepository = async () => {
	const { metaNamesSdkFactory } = await import('./sdk');

	return metaNamesSdkFactory({ cache_ttl: 0 }).domainRepository as unknown as Record<
		string,
		ReturnType<typeof vi.fn>
	>;
};

// Re-import with mocks applied
describe('API Endpoints', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('handleError', () => {
		it('should return successful response', async () => {
			const mockResponse = { data: 'test' };
			const fn = vi.fn().mockResolvedValue({
				status: 200,
				json: async () => mockResponse
			});

			const result = await handleError(fn);
			expect(result).toBeDefined();
		});

		it('should catch and handle errors', async () => {
			const error = new Error('Test error');
			const fn = vi.fn().mockRejectedValue(error);

			const result = await handleError(fn);

			const resultJson = await result.json();
			expect(resultJson).toHaveProperty('error');
			expect(result.status).toBe(400);
		});

		it('should return custom error message for Error instances', async () => {
			const customMessage = 'Custom error message';
			const fn = vi.fn().mockRejectedValue(new Error(customMessage));

			const result = await handleError(fn);
			const resultJson = await result.json();

			expect(resultJson.error).toBe(customMessage);
		});

		it('should return generic message for non-Error rejections', async () => {
			const fn = vi.fn().mockRejectedValue('String error');

			const result = await handleError(fn);
			const resultJson = await result.json();

			expect(resultJson.error).toBe(
				'Cannot handle your request at the moment. Please try again later.'
			);
		});
	});

	describe('apiError', () => {
		it('should return error response with custom status', () => {
			const message = 'Invalid request';
			const status = 422;

			const result = apiError(message, status);

			expect(result.status).toBe(status);
		});

		it('should return error response with default status 400', () => {
			const result = apiError('Bad request');

			expect(result.status).toBe(400);
		});

		it('should include error message in response body', async () => {
			const message = 'Test error';
			const result = apiError(message);
			const body = await result.json();

			expect(body.error).toBe(message);
		});
	});

	describe('getStats', () => {
		it('should return domain count, owner count, and recent domains', async () => {
			const mockDomains = [
				{ name: 'domain1', createdAt: new Date('2026-01-01') },
				{ name: 'domain2', createdAt: new Date('2026-01-02') }
			];

			// Get the mocked SDK
			const domainRepository = await mockedDomainRepository();

			// Override the mocks for this test
			domainRepository.getAll = vi.fn().mockResolvedValue(mockDomains);
			domainRepository.count = vi.fn().mockResolvedValue(42);
			domainRepository.getOwners = vi.fn().mockResolvedValue(['0x1', '0x2', '0x3']);

			const stats = await getStats();

			expect(stats.domainCount).toBe(42);
			expect(stats.ownerCount).toBe(3);
			expect(stats.recentDomains).toHaveLength(2);
		});

		it('should handle getAll errors gracefully', async () => {
			const domainRepository = await mockedDomainRepository();

			// Only getAll has catch handler, so it should return empty array
			domainRepository.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

			const stats = await getStats();

			// getAll error should be caught and return empty array
			expect(stats.recentDomains).toEqual([]);
		});

		it('should sort recent domains by creation date descending', async () => {
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

		it('should issue the three lookups concurrently', async () => {
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
});

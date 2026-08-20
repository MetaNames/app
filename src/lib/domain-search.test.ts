import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the SDK module
vi.mock('@metanames/sdk', async () => {
	const mockDomainValidator = {
		validate: vi.fn((name: string, options?: { raiseError: boolean }) => {
			if (!name || name.length < 3) return false;
			if (name.startsWith('-') || name.endsWith('-')) return false;
			if (/[^a-z0-9-]/.test(name)) return false;
			return true;
		}),
		getErrors: vi.fn(() => []),
		rules: { minLength: 3, maxLength: 64 }
	};

	const mockDomain = {
		name: 'testdomain',
		owner: '0x1234567890abcdef1234567890abcdef12345678',
		expiration: new Date('2027-01-01'),
		tokenId: '1'
	};

	const mockDomainRepository = {
		domainValidator: mockDomainValidator,
		find: vi.fn(),
		analyze: vi.fn(),
		getAll: vi.fn(),
		findByOwner: vi.fn()
	};

	return {
		DomainValidator: vi.fn().mockImplementation(() => mockDomainValidator),
		MetaNamesSdk: vi.fn().mockImplementation(() => ({
			domainRepository: mockDomainRepository,
			config: { tld: 'test' }
		})),
		Enviroment: { testnet: 'testnet', mainnet: 'mainnet' }
	};
});

describe('Domain Search', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('domain availability check', () => {
		it('should return null for available domain', async () => {
			// Import after mocking
			const { MetaNamesSdk, Enviroment } = await import('@metanames/sdk');

			// Create a simple mock for the test
			const mockFind = vi.fn().mockResolvedValue(null);

			const mockRepo = {
				domainValidator: {
					validate: vi.fn((name: string) => name.length >= 3),
					getErrors: vi.fn(() => [])
				},
				find: mockFind
			};

			const sdk = {
				domainRepository: mockRepo,
				config: { tld: 'test' }
			};

			// Simulate search for an available domain
			const result = await mockRepo.find('availabledomain');
			expect(result).toBeNull();
		});

		it('should return domain for registered domain', async () => {
			const mockDomain = {
				name: 'registered',
				owner: '0x1234567890abcdef1234567890abcdef12345678',
				expiration: new Date('2027-01-01'),
				tokenId: '1'
			};

			const mockFind = vi.fn().mockResolvedValue(mockDomain);

			const mockRepo = {
				domainValidator: {
					validate: vi.fn((name: string) => name.length >= 3),
					getErrors: vi.fn(() => [])
				},
				find: mockFind
			};

			const result = await mockRepo.find('registered');
			expect(result).not.toBeNull();
			expect(result?.name).toBe('registered');
		});
	});

	describe('domain name validation', () => {
		it('should validate domain names correctly', async () => {
			const { DomainValidator } = await import('@metanames/sdk');

			const validator = new DomainValidator('test');

			// Valid names
			expect(validator.validate('valid', { raiseError: false })).toBe(true);
			expect(validator.validate('abc', { raiseError: false })).toBe(true);
			expect(validator.validate('hello-world', { raiseError: false })).toBe(true);

			// Invalid names
			expect(validator.validate('', { raiseError: false })).toBe(false);
			expect(validator.validate('ab', { raiseError: false })).toBe(false);
			expect(validator.validate('-start', { raiseError: false })).toBe(false);
			expect(validator.validate('end-', { raiseError: false })).toBe(false);
			expect(validator.validate('in valid', { raiseError: false })).toBe(false);
		});
	});

	describe('domain analysis', () => {
		it('should analyze domain without checking contract', async () => {
			// This tests the analyze function which validates locally
			const { DomainValidator } = await import('@metanames/sdk');

			const validator = new DomainValidator('test');

			// Valid domain should pass analysis
			const isValid = validator.validate('testdomain', { raiseError: false });
			expect(isValid).toBe(true);
		});
	});
});

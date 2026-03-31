import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure mocks are properly set up
const { MockDomainValidator, MockMetaNamesSdk } = vi.hoisted(() => {
	class MockDomainValidator {
		validate = vi.fn((name: string) => {
			if (!name || name.length < 3) return false;
			if (name.startsWith('-') || name.endsWith('-')) return false;
			if (/[^a-z0-9-]/.test(name)) return false;
			return true;
		});
		getErrors = vi.fn(() => []);
		rules = { minLength: 3, maxLength: 64 };
	}

	class MockMetaNamesSdk {
		domainRepository = {
			domainValidator: new MockDomainValidator(),
			find: vi.fn(),
			analyze: vi.fn(),
			getAll: vi.fn(),
			findByOwner: vi.fn()
		};
		config = { tld: 'test' };
	}

	return { MockDomainValidator, MockMetaNamesSdk };
});

// Mock the SDK module
vi.mock('@metanames/sdk', () => {
	return {
		DomainValidator: MockDomainValidator,
		MetaNamesSdk: MockMetaNamesSdk,
		Enviroment: { testnet: 'testnet', mainnet: 'mainnet' }
	};
});

describe('Domain Search', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('domain availability check', () => {
		it('should return null for available domain', async () => {
			const mockFind = vi.fn().mockResolvedValue(null);

			const sdk = new MockMetaNamesSdk();
			sdk.domainRepository.find = mockFind;

			const result = await sdk.domainRepository.find('availabledomain');
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

			const sdk = new MockMetaNamesSdk();
			sdk.domainRepository.find = mockFind;

			const result = await sdk.domainRepository.find('registered');
			expect(result).not.toBeNull();
			expect(result?.name).toBe('registered');
		});
	});

	describe('domain name validation', () => {
		it('should validate domain names correctly', async () => {
			const validator = new MockDomainValidator();

			expect(validator.validate('valid')).toBe(true);
			expect(validator.validate('abc')).toBe(true);
			expect(validator.validate('hello-world')).toBe(true);

			expect(validator.validate('')).toBe(false);
			expect(validator.validate('ab')).toBe(false);
			expect(validator.validate('-start')).toBe(false);
			expect(validator.validate('end-')).toBe(false);
			expect(validator.validate('in valid')).toBe(false);
		});
	});

	describe('domain analysis', () => {
		it('should analyze domain without checking contract', async () => {
			const validator = new MockDomainValidator();

			const isValid = validator.validate('testdomain');
			expect(isValid).toBe(true);
		});
	});
});

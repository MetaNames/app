import { describe, it, expect, vi } from 'vitest';
import {
	getRecordClassFrom,
	metaNamesSdkFactory,
	socialRecords,
	profileRecords,
	getValidator
} from './sdk';

// Mock the @metanames/sdk module
vi.mock('@metanames/sdk', () => {
	const RecordClassEnum = {
		Twitter: 'Twitter',
		Discord: 'Discord',
		Bio: 'Bio',
		Email: 'Email',
		Uri: 'Uri',
		Wallet: 'Wallet',
		Price: 'Price'
	};

	const mockConfig = {
		byoc: [{ symbol: 'PARTI' }],
		accountAbi: {},
		domainAbi: {}
	};

	class MockMetaNamesSdk {
		config: typeof mockConfig;

		constructor() {
			this.config = mockConfig;
		}
	}

	return {
		RecordClassEnum,
		MetaNamesSdk: MockMetaNamesSdk,
		getRecordValidator: vi.fn(() => ({
			validate: (value: unknown) => value !== null
		})),
		Enviroment: {
			testnet: 'testnet',
			mainnet: 'mainnet'
		}
	};
});

describe('SDK - getRecordClassFrom', () => {
	it('should return Twitter for Twitter record class', () => {
		const result = getRecordClassFrom('Twitter');
		expect(result).toBe('Twitter');
	});

	it('should return Discord for Discord record class', () => {
		const result = getRecordClassFrom('Discord');
		expect(result).toBe('Discord');
	});

	it('should return Bio for Bio record class', () => {
		const result = getRecordClassFrom('Bio');
		expect(result).toBe('Bio');
	});

	it('should handle Email record class', () => {
		const result = getRecordClassFrom('Email');
		expect(result).toBe('Email');
	});

	it('should handle Uri record class', () => {
		const result = getRecordClassFrom('Uri');
		expect(result).toBe('Uri');
	});

	it('should handle Wallet record class', () => {
		const result = getRecordClassFrom('Wallet');
		expect(result).toBe('Wallet');
	});

	it('should handle Price record class', () => {
		const result = getRecordClassFrom('Price');
		expect(result).toBe('Price');
	});

	it('should return undefined for unknown record class string', () => {
		const result = getRecordClassFrom('UnknownClass' as keyof typeof RecordClassEnum);
		expect(result).toBeUndefined();
	});
});

describe('SDK - metaNamesSdkFactory', () => {
	it('should create a MetaNamesSdk instance without override', () => {
		const sdk = metaNamesSdkFactory();
		expect(sdk).toBeDefined();
		expect(sdk.config).toBeDefined();
	});

	it('should create a MetaNamesSdk instance with override', () => {
		const sdk = metaNamesSdkFactory({});
		expect(sdk).toBeDefined();
		expect(sdk.config).toBeDefined();
	});

	it('should have byoc configuration', () => {
		const sdk = metaNamesSdkFactory();
		expect(sdk.config.byoc).toBeDefined();
		expect(Array.isArray(sdk.config.byoc)).toBe(true);
	});
});

describe('SDK - socialRecords', () => {
	it('should contain Twitter record', () => {
		expect(socialRecords).toContain('Twitter');
	});

	it('should contain Discord record', () => {
		expect(socialRecords).toContain('Discord');
	});

	it('should have exactly 2 social records', () => {
		expect(socialRecords.length).toBe(2);
	});
});

describe('SDK - profileRecords', () => {
	it('should contain Bio record', () => {
		expect(profileRecords).toContain('Bio');
	});

	it('should contain Email record', () => {
		expect(profileRecords).toContain('Email');
	});

	it('should contain Uri record', () => {
		expect(profileRecords).toContain('Uri');
	});

	it('should contain Wallet record', () => {
		expect(profileRecords).toContain('Wallet');
	});

	it('should contain Price record', () => {
		expect(profileRecords).toContain('Price');
	});

	it('should have exactly 5 profile records', () => {
		expect(profileRecords.length).toBe(5);
	});
});

describe('SDK - getValidator', () => {
	it('should return a validator for Twitter', () => {
		const validator = getValidator('Twitter');
		expect(validator).toBeDefined();
		expect(typeof validator.validate).toBe('function');
	});

	it('should return a validator for Discord', () => {
		const validator = getValidator('Discord');
		expect(validator).toBeDefined();
	});

	it('should return a validator for Bio', () => {
		const validator = getValidator('Bio');
		expect(validator).toBeDefined();
	});

	it('should return a validator that can validate values', () => {
		const validator = getValidator('Twitter');
		expect(validator.validate('someValue')).toBe(true);
		expect(validator.validate(null)).toBe(false);
	});
});

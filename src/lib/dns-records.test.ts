import { describe, it, expect, vi } from 'vitest';
import { Enviroment, RecordClassEnum } from '@metanames/sdk';

// Mock config - use proper Enviroment value
vi.mock('./config', () => ({
	config: {
		sdkEnvironment: Enviroment.testnet,
		browserUrl: 'https://browser.testnet.partisiablockchain.com',
		environment: 'test',
		chainId: 'Partisia Blockchain Testnet',
		contractDisabled: false,
		dAppName: 'Meta Names',
		permissions: ['sign'],
		landingUrl: 'https://metanames.io',
		tldMigrationProposalContractAddress: '021e68773e9bd5fc28381802c4b24899499f039ea9',
		websiteUrl: 'https://metanames.io'
	}
}));

// Mock Sentry
vi.mock('@sentry/sveltekit', () => ({
	captureException: vi.fn()
}));

import {
	getRecordClassFrom,
	metaNamesSdkFactory,
	socialRecords,
	profileRecords,
	getValidator
} from './sdk';

describe('SDK - DNS Records', () => {
	describe('getRecordClassFrom', () => {
		it('should convert string to RecordClassEnum for Bio', () => {
			expect(getRecordClassFrom('Bio')).toBe(RecordClassEnum.Bio);
		});

		it('should convert string to RecordClassEnum for Discord', () => {
			expect(getRecordClassFrom('Discord')).toBe(RecordClassEnum.Discord);
		});

		it('should convert string to RecordClassEnum for Twitter', () => {
			expect(getRecordClassFrom('Twitter')).toBe(RecordClassEnum.Twitter);
		});

		it('should convert string to RecordClassEnum for Uri', () => {
			expect(getRecordClassFrom('Uri')).toBe(RecordClassEnum.Uri);
		});

		it('should convert string to RecordClassEnum for Wallet', () => {
			expect(getRecordClassFrom('Wallet')).toBe(RecordClassEnum.Wallet);
		});

		it('should convert string to RecordClassEnum for Avatar', () => {
			expect(getRecordClassFrom('Avatar')).toBe(RecordClassEnum.Avatar);
		});

		it('should convert string to RecordClassEnum for Email', () => {
			expect(getRecordClassFrom('Email')).toBe(RecordClassEnum.Email);
		});

		it('should convert string to RecordClassEnum for Price', () => {
			expect(getRecordClassFrom('Price')).toBe(RecordClassEnum.Price);
		});

		it('should convert string to RecordClassEnum for Main', () => {
			expect(getRecordClassFrom('Main')).toBe(RecordClassEnum.Main);
		});

		it('should return undefined for invalid class name', () => {
			expect(getRecordClassFrom('Invalid')).toBe(undefined);
		});

		it('should return undefined for empty string', () => {
			expect(getRecordClassFrom('')).toBe(undefined);
		});
	});

	describe('metaNamesSdkFactory', () => {
		it('should create SDK instance with default config', () => {
			const sdk = metaNamesSdkFactory();
			expect(sdk).toBeDefined();
		});

		it('should create SDK instance with config overrides', () => {
			const sdk = metaNamesSdkFactory({ cache_ttl: 100 });
			expect(sdk).toBeDefined();
		});

		it('should create SDK with cache disabled when cache_ttl is 0', () => {
			const sdk = metaNamesSdkFactory({ cache_ttl: 0 });
			expect(sdk).toBeDefined();
		});

		it('should create SDK with custom timeout', () => {
			const sdk = metaNamesSdkFactory({ timeout: 30000 });
			expect(sdk).toBeDefined();
		});
	});

	describe('socialRecords', () => {
		it('should be an array of 2 elements', () => {
			expect(socialRecords).toHaveLength(2);
		});

		it('should contain Twitter and Discord as strings', () => {
			expect(socialRecords).toContain('Twitter');
			expect(socialRecords).toContain('Discord');
		});

		it('should contain valid RecordClassEnum values when mapped', () => {
			const enumValues = socialRecords.map(
				(r) => RecordClassEnum[r as keyof typeof RecordClassEnum]
			);
			expect(enumValues).toContain(RecordClassEnum.Twitter);
			expect(enumValues).toContain(RecordClassEnum.Discord);
		});
	});

	describe('profileRecords', () => {
		it('should be an array of 5 elements', () => {
			expect(profileRecords).toHaveLength(5);
		});

		it('should contain Bio, Email, Uri, Wallet, and Price as strings', () => {
			expect(profileRecords).toContain('Bio');
			expect(profileRecords).toContain('Email');
			expect(profileRecords).toContain('Uri');
			expect(profileRecords).toContain('Wallet');
			expect(profileRecords).toContain('Price');
		});

		it('should contain valid RecordClassEnum values when mapped', () => {
			const enumValues = profileRecords.map(
				(r) => RecordClassEnum[r as keyof typeof RecordClassEnum]
			);
			expect(enumValues).toContain(RecordClassEnum.Bio);
			expect(enumValues).toContain(RecordClassEnum.Email);
			expect(enumValues).toContain(RecordClassEnum.Uri);
			expect(enumValues).toContain(RecordClassEnum.Wallet);
			expect(enumValues).toContain(RecordClassEnum.Price);
		});
	});

	describe('getValidator', () => {
		it('should return validator for Bio class', () => {
			const validator = getValidator('Bio');
			expect(validator).toBeDefined();
			expect(validator.validate).toBeDefined();
		});

		it('should return validator for Discord class', () => {
			const validator = getValidator('Discord');
			expect(validator).toBeDefined();
		});

		it('should return validator for Twitter class', () => {
			const validator = getValidator('Twitter');
			expect(validator).toBeDefined();
		});

		it('should return validator for Email class', () => {
			const validator = getValidator('Email');
			expect(validator).toBeDefined();
		});

		it('should return validator for Wallet class', () => {
			const validator = getValidator('Wallet');
			expect(validator).toBeDefined();
		});

		it('should return validator for Main class', () => {
			const validator = getValidator('Main');
			expect(validator).toBeDefined();
		});

		it('should throw error for invalid class', () => {
			expect(() => getValidator('InvalidClass')).toThrow('Record class is invalid');
		});

		it('should throw error for empty string', () => {
			expect(() => getValidator('')).toThrow('Record class is invalid');
		});
	});
});

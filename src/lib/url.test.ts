import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	explorerTransactionUrl,
	explorerAddressUrl,
	bridgeUrl,
	backendBrowserUrl,
	shortLinkUrl
} from './url';

// We need to mock the config that url.ts depends on
vi.mock('./config', () => ({
	config: {
		browserUrl: 'https://browser.testnet.partisiablockchain.com',
		environment: 'test'
	}
}));

vi.mock('./sdk', () => ({
	config: {
		browserUrl: 'https://browser.testnet.partisiablockchain.com',
		environment: 'test'
	},
	metaNamesSdkFactory: vi.fn(() => ({
		config: {
			browserUrl: 'https://browser.testnet.partisiablockchain.com',
			environment: 'test',
			byoc: [{ symbol: 'PARTI' }]
		}
	}))
}));

describe('URL Helpers', () => {
	describe('explorerTransactionUrl', () => {
		it('should generate correct transaction URL', () => {
			const transactionId = '0x1234567890abcdef1234567890abcdef12345678';
			const url = explorerTransactionUrl(transactionId);

			expect(url).toBe(
				`https://browser.testnet.partisiablockchain.com/transactions/${transactionId}`
			);
		});

		it('should handle different transaction IDs', () => {
			const txId = '0xabcd';
			const url = explorerTransactionUrl(txId);

			expect(url).toContain(txId);
			expect(url).toContain('transactions/');
		});
	});

	describe('explorerAddressUrl', () => {
		it('should generate account URL for addresses starting with 00', () => {
			const address = '00' + 'b'.repeat(62);
			const url = explorerAddressUrl(address);

			expect(url).toContain('/accounts/');
			expect(url).toContain('/assets');
			expect(url).toBe(`https://browser.testnet.partisiablockchain.com/accounts/${address}/assets`);
		});

		it('should generate contract URL for addresses not starting with 00', () => {
			const address = '01' + 'c'.repeat(62);
			const url = explorerAddressUrl(address);

			expect(url).toContain('/contracts/');
			expect(url).toBe(`https://browser.testnet.partisiablockchain.com/contracts/${address}`);
		});

		it('should handle 01 prefix contract addresses', () => {
			const address = '01abc123';
			const url = explorerAddressUrl(address);

			expect(url).toContain('/contracts/');
			expect(url).not.toContain('/accounts/');
		});

		it('should handle 02 prefix as contract', () => {
			const address = '02xyz789';
			const url = explorerAddressUrl(address);

			expect(url).toContain('/contracts/');
		});

		it('should handle 00 prefix as account', () => {
			const address = '00account123';
			const url = explorerAddressUrl(address);

			expect(url).toContain('/accounts/');
			expect(url).toContain('/assets');
		});
	});

	describe('bridgeUrl', () => {
		it('should generate bridge URL', () => {
			const url = bridgeUrl;

			expect(url).toBe('https://browser.testnet.partisiablockchain.com/bridge');
			expect(url).toContain('bridge');
		});
	});

	describe('backendBrowserUrl', () => {
		it('should generate backend GraphQL URL for testnet', () => {
			const url = backendBrowserUrl;

			expect(url).toContain('backend.browser.testnet.partisiablockchain.com');
			expect(url).toContain('/graphql/query');
		});
	});

	describe('shortLinkUrl', () => {
		it('should generate metanam.es short link', () => {
			const domain = 'marcotest';
			const url = shortLinkUrl(domain);

			expect(url).toBe('https://metanam.es/marcotest');
		});

		it('should handle domains with dots', () => {
			const domain = 'marcotest.partisia';
			const url = shortLinkUrl(domain);

			expect(url).toBe('https://metanam.es/marcotest.partisia');
		});

		it('should handle short domains', () => {
			const domain = 'abc';
			const url = shortLinkUrl(domain);

			expect(url).toBe('https://metanam.es/abc');
		});

		it('should handle empty string domain', () => {
			const domain = '';
			const url = shortLinkUrl(domain);

			expect(url).toBe('https://metanam.es/');
		});

		it('should handle long domain names', () => {
			const domain = 'verylongdomainname.partisia.blockchain.test';
			const url = shortLinkUrl(domain);

			expect(url).toContain(domain);
			expect(url).toContain('https://metanam.es/');
		});
	});
});

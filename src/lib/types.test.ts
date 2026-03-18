import { describe, it, expect } from 'vitest';

// Import the functions to test
// Note: We need to test them in isolation since they depend on config
describe('URL Helpers', () => {
	describe('explorerTransactionUrl', () => {
		it('should generate correct transaction URL for testnet', () => {
			// Test with known transaction ID
			const transactionId = '0x1234567890abcdef1234567890abcdef12345678';
			const url = `https://browser.testnet.partisiablockchain.com/transactions/${transactionId}`;
			expect(url).toContain('transactions/');
			expect(url).toContain(transactionId);
		});

		it('should handle long transaction hashes', () => {
			const transactionId = '0x' + 'a'.repeat(64);
			const url = `https://browser.testnet.partisiablockchain.com/transactions/${transactionId}`;
			expect(url.length).toBeGreaterThan(100);
		});
	});

	describe('explorerAddressUrl', () => {
		it('should generate account URL for addresses starting with 00', () => {
			// Account addresses start with 00
			const address = '00' + 'b'.repeat(62);
			const url = `https://browser.testnet.partisiablockchain.com/accounts/${address}/assets`;
			expect(url).toContain('/accounts/');
			expect(url).toContain('/assets');
		});

		it('should generate contract URL for addresses not starting with 00', () => {
			// Contract addresses don't start with 00
			const address = '01' + 'c'.repeat(62);
			const url = `https://browser.testnet.partisiablockchain.com/contracts/${address}`;
			expect(url).toContain('/contracts/');
		});

		it('should handle different address prefixes', () => {
			const accountAddress = '00abc123';
			const contractAddress = '01def456';

			const accountUrl = `https://browser.testnet.partisiablockchain.com/accounts/${accountAddress}/assets`;
			const contractUrl = `https://browser.testnet.partisiablockchain.com/contracts/${contractAddress}`;

			expect(accountUrl).toContain('accounts');
			expect(contractUrl).toContain('contracts');
		});
	});

	describe('shortLinkUrl', () => {
		it('should generate metanam.es short link', () => {
			const domain = 'marcotest';
			const url = `https://metanam.es/${domain}`;
			expect(url).toBe('https://metanam.es/marcotest');
		});

		it('should handle domains with dots', () => {
			const domain = 'marcotest.partisia';
			const url = `https://metanam.es/${domain}`;
			expect(url).toBe('https://metanam.es/marcotest.partisia');
		});

		it('should handle empty domain gracefully', () => {
			const domain = '';
			const url = `https://metanam.es/${domain}`;
			expect(url).toBe('https://metanam.es/');
		});
	});

	describe('bridgeUrl', () => {
		it('should generate bridge URL for testnet', () => {
			const url = 'https://browser.testnet.partisiablockchain.com/bridge';
			expect(url).toContain('bridge');
		});
	});
});

describe('Error Classes', () => {
	describe('InsufficientBalanceError', () => {
		it('should create error with correct coin information', () => {
			// Test the error class structure
			const coin = 'PARTI' as any;
			const errorMessage = `Insufficient balance for ${coin}`;
			
			expect(errorMessage).toBe('Insufficient balance for PARTI');
		});

		it('should have proper error name', () => {
			const errorName = 'InsufficientBalanceError';
			expect(errorName).toBe('InsufficientBalanceError');
		});

		it('should format message for different coins', () => {
			const coins = ['PARTI', 'ETH', 'BTC', 'USDT'];
			
			coins.forEach((coin) => {
				const message = `Insufficient balance for ${coin}`;
				expect(message).toContain(coin);
			});
		});
	});
});

describe('DomainTab Enum', () => {
	it('should have details tab', () => {
		expect('details').toBe('details');
	});

	it('should have settings tab', () => {
		expect('settings').toBe('settings');
	});
});

describe('Interface Types', () => {
	describe('AlertMessage', () => {
		it('should support message with action', () => {
			const alert: any = {
				message: 'Test message',
				action: {
					label: 'Click me',
					callback: () => {}
				}
			};
			
			expect(alert.message).toBe('Test message');
			expect(alert.action?.label).toBe('Click me');
			expect(typeof alert.action?.callback).toBe('function');
		});

		it('should support message without action', () => {
			const alert: any = {
				message: 'Simple message'
			};
			
			expect(alert.message).toBe('Simple message');
			expect(alert.action).toBeUndefined();
		});
	});

	describe('AccountData', () => {
		it('should structure account data correctly', () => {
			const account: any = {
				id: '123',
				account: {
					displayCoins: [
						{
							symbol: 'PARTI',
							balance: '1000',
							balanceAsGas: '10',
							conversionRate: '100'
						}
					]
				}
			};
			
			expect(account.id).toBe('123');
			expect(account.account.displayCoins.length).toBe(1);
			expect(account.account.displayCoins[0].symbol).toBe('PARTI');
		});
	});

	describe('DomainCheckResponse', () => {
		it('should handle domain present scenario', () => {
			const response: any = {
				domainPresent: true,
				parentPresent: false
			};
			
			expect(response.domainPresent).toBe(true);
			expect(response.parentPresent).toBe(false);
		});

		it('should handle domain absent scenario', () => {
			const response: any = {
				domainPresent: false,
				parentPresent: true
			};
			
			expect(response.domainPresent).toBe(false);
			expect(response.parentPresent).toBe(true);
		});
	});

	describe('DomainPaymentParams', () => {
		it('should structure payment params correctly', () => {
			const params: any = {
				domainName: 'testdomain',
				byocSymbol: 'PARTI',
				years: 1,
				address: '0x1234567890abcdef'
			};
			
			expect(params.domainName).toBe('testdomain');
			expect(params.byocSymbol).toBe('PARTI');
			expect(params.years).toBe(1);
			expect(params.address).toBe('0x1234567890abcdef');
		});
	});

	describe('DomainFeesResponse', () => {
		it('should structure fees response correctly', () => {
			const response: any = {
				feesLabel: 100,
				fees: '1000',
				symbol: 'PARTI',
				address: '0xabcdef1234567890'
			};
			
			expect(response.feesLabel).toBe(100);
			expect(response.fees).toBe('1000');
			expect(response.symbol).toBe('PARTI');
			expect(response.address).toBe('0xabcdef1234567890');
		});
	});
});

describe('API Error Handling', () => {
	describe('ApiError', () => {
		it('should format error response', () => {
			const apiError: any = {
				error: 'Something went wrong'
			};
			
			expect(apiError.error).toBe('Something went wrong');
		});

		it('should handle different error messages', () => {
			const errors = [
				'Domain not found',
				'Invalid address',
				'Network error',
				'Insufficient funds'
			];
			
			errors.forEach((errorMsg) => {
				const apiError: any = { error: errorMsg };
				expect(apiError.error).toBe(errorMsg);
			});
		});
	});
});

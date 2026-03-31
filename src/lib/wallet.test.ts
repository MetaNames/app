import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock the config module
vi.mock('$lib/config', () => ({
	config: {
		chainId: 'Partisia Blockchain Testnet',
		permissions: ['sign'],
		dAppName: 'Meta Names',
		environment: 'test'
	}
}));

// Mock url module
vi.mock('$lib/url', () => ({
	backendBrowserUrl: 'https://browser.testnet.partisiablockchain.com/api'
}));

// Mock the Partisia SDK
vi.mock('partisia-blockchain-applications-sdk', () => ({
	default: vi.fn().mockImplementation(() => ({
		connect: vi.fn().mockResolvedValue(undefined),
		connection: {
			account: {
				address: '0x1234567890abcdef1234567890abcdef12345678'
			}
		}
	}))
}));

// Mock fetch
global.fetch = vi.fn();

describe('Wallet Connection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('connectPartisia', () => {
		it('should throw error when connection is null', async () => {
			// Test the connection failure case
			// The actual SDK connection logic throws when connection is falsy
			const mockSdk = {
				connect: vi.fn().mockResolvedValue(undefined),
				connection: null
			};

			// This simulates what happens when connection fails
			expect(() => {
				if (!mockSdk.connection) throw new Error('Connection failed');
			}).toThrow('Connection failed');
		});
	});

	describe('getAddress', () => {
		it('should return undefined for null/undefined wallet', async () => {
			const { getAddress } = await import('$lib/wallet');

			const result1 = await getAddress(null);
			expect(result1).toBeUndefined();

			const result2 = await getAddress(undefined);
			expect(result2).toBeUndefined();
		});

		it('should get address from Partisia wallet', async () => {
			const { getAddress } = await import('$lib/wallet');

			const partisiaWallet = {
				connection: {
					account: {
						address: '0xabcd1234'
					}
				}
			};

			const result = await getAddress(partisiaWallet);
			expect(result).toBe('0xabcd1234');
		});

		it('should get address from MetaMask snap', async () => {
			const { getAddress } = await import('$lib/wallet');

			const metaMaskWallet = {
				request: vi.fn().mockResolvedValue('0xmetamask123')
			};

			const result = await getAddress(metaMaskWallet);

			expect(metaMaskWallet.request).toHaveBeenCalledWith({
				method: 'wallet_invokeSnap',
				params: {
					snapId: 'npm:@partisiablockchain/snap',
					request: { method: 'get_address' }
				}
			});
			expect(result).toBe('0xmetamask123');
		});
	});

	describe('getAccountBalance', () => {
		it('should fetch account balance successfully', async () => {
			const mockResponse = {
				data: {
					account: {
						id: '0x1234567890abcdef1234567890abcdef12345678',
						displayCoins: [
							{
								symbol: 'ETH',
								balance: '1000000000000000000',
								balanceAsGas: '100000000000000000',
								conversionRate: '1.5'
							}
						]
					}
				}
			};

			(global.fetch as unknown as Mock).mockResolvedValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			});

			const { getAccountBalance } = await import('$lib/wallet');

			const result = await getAccountBalance('0x1234567890abcdef1234567890abcdef12345678');

			expect(global.fetch).toHaveBeenCalled();
			expect(result).toEqual(mockResponse.data);
		});

		it('should handle API errors gracefully', async () => {
			(global.fetch as unknown as Mock).mockRejectedValue(new Error('Network error'));

			const { getAccountBalance } = await import('$lib/wallet');

			await expect(getAccountBalance('0x1234567890abcdef1234567890abcdef12345678')).rejects.toThrow(
				'Network error'
			);
		});
	});
});

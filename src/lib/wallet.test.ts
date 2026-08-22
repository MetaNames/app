import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
		it('connects with the configured chain and returns the client', async () => {
			const connect = vi.fn().mockResolvedValue(undefined);
			vi.resetModules();
			vi.doMock('partisia-blockchain-applications-sdk', () => ({
				default: vi.fn().mockImplementation(() => ({
					connect,
					connection: { account: { address: '0xabcd1234' } }
				}))
			}));

			const { connectPartisia } = await import('$lib/wallet');
			const client = await connectPartisia();

			expect(connect).toHaveBeenCalledWith({
				chainId: 'Partisia Blockchain Testnet',
				permissions: ['sign'],
				dappName: 'Meta Names'
			});
			expect(client.connection).toEqual({ account: { address: '0xabcd1234' } });
		});

		it('throws when the wallet hands back no connection', async () => {
			vi.resetModules();
			vi.doMock('partisia-blockchain-applications-sdk', () => ({
				default: vi.fn().mockImplementation(() => ({
					connect: vi.fn().mockResolvedValue(undefined),
					connection: null
				}))
			}));

			const { connectPartisia } = await import('$lib/wallet');

			await expect(connectPartisia()).rejects.toThrow('Connection failed');
		});
	});

	describe('connectMetaMask', () => {
		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('throws when MetaMask is not installed', async () => {
			vi.stubGlobal('window', {});
			const { connectMetaMask } = await import('$lib/wallet');

			await expect(connectMetaMask()).rejects.toThrow('MetaMask is not installed');
		});

		it('requests the Partisia snap and returns the provider', async () => {
			const request = vi.fn().mockResolvedValue(undefined);
			vi.stubGlobal('window', { ethereum: { request } });
			const { connectMetaMask } = await import('$lib/wallet');

			await expect(connectMetaMask()).resolves.toEqual({ request });
			expect(request).toHaveBeenCalledWith({
				method: 'wallet_requestSnaps',
				params: { 'npm:@partisiablockchain/snap': {} }
			});
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

			global.fetch = vi.fn().mockResolvedValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			});

			const { getAccountBalance } = await import('$lib/wallet');

			const result = await getAccountBalance('0x1234567890abcdef1234567890abcdef12345678');

			expect(global.fetch).toHaveBeenCalled();
			expect(result).toEqual(mockResponse.data);
		});

		it('should handle API errors gracefully', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

			const { getAccountBalance } = await import('$lib/wallet');

			await expect(getAccountBalance('0x1234567890abcdef1234567890abcdef12345678')).rejects.toThrow(
				'Network error'
			);
		});
	});
});

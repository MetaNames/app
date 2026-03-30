import { config } from './config';
import type { MetaMaskSdk } from '@metanames/sdk';
import type { AccountData } from './types';
import { backendBrowserUrl } from './url';

export type OptionalWalletClient = any | undefined | null;

const metaMaskSnapId = 'npm:@partisiablockchain/snap';

export const connectPartisia = async () => {
	const { default: PartisiaSdk } = await import('partisia-blockchain-applications-sdk');
	const sdk = new PartisiaSdk();

	await sdk.connect({
		chainId: config.chainId,
		permissions: config.permissions as any,
		dappName: config.dAppName
	});

	if (sdk.connection) return sdk;
	else throw new Error('Connection failed');
};

export const getAccountBalance = async (address: string) => {
	const body = {
		query:
			'query AccountSingleQuery(\n		$address: BLOCKCHAIN_ADDRESS!\n	) {\n		account(address: $address) {\n			...Coins_Account\n		}\n	}\n\n	fragment Byoc_Account on Account {\n		displayCoins {\n			symbol\n			balance\n			conversionRate\n			balanceAsGas\n		}\n		id\n	}\n\n	fragment Coins_Account on Account {\n		...Byoc_Account\n		...NonBridgeableCoins_Account\n	}\n\n	fragment NonBridgeableCoins_Account on Account {\n		mpc20Balances {\n			contract\n			symbol\n			balance\n		}\n	}',
		variables: { address }
	};

	const headers = { 'Content-Type': 'application/json' };
	const response = await fetch(backendBrowserUrl, {
		method: 'POST',
		body: JSON.stringify(body),
		headers
	});

	const data = await response.json();
	return data.data as AccountData;
};

export const connectMetaMask = async () => {
	if (!('ethereum' in window)) {
		throw new Error('MetaMask is not installed');
	}

	const metamask = window.ethereum as MetaMaskSdk;

	await metamask.request({
		method: 'wallet_requestSnaps',
		params: {
			[metaMaskSnapId]: {}
		}
	});

	return metamask;
};

export const getAddress = async (wallet: OptionalWalletClient): Promise<string | undefined> => {
	if (!wallet) return;

	if ('connection' in wallet) return wallet.connection?.account.address;
	else if ('request' in wallet) {
		return await wallet.request({
			method: 'wallet_invokeSnap',
			params: {
				snapId: metaMaskSnapId,
				request: { method: 'get_address' }
			}
		});
	} else return;
};

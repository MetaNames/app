import { config } from './config';
import type { MetaMaskSdk } from '@metanames/sdk';
import type { AccountData } from './types';
import { accountCoinsQuery } from './queries';
import { loadWalletCrypto } from './node-compat/lazy-crypto';
import { backendBrowserUrl } from './url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- widening to `object` breaks the `wallet.connection` / `wallet.request` probes in getAddress; typing both wallet clients honestly is its own task
export type OptionalWalletClient = any | undefined | null;

const metaMaskSnapId = 'npm:@partisiablockchain/snap';

export const connectPartisia = async () => {
	// The Partisia Wallet is the only path in the app that runs HD derivation and AES:
	// `sdk.connect()` derives a BIP32 session keypair from its own seed and then
	// ecies-decrypts the extension's reply, and `signMessage` does both again. Both
	// primitives live behind `loadWalletCrypto()` so that bip39's wordlist,
	// @scure/bip32 and @noble/ciphers stay out of the chunk every route loads — see
	// src/lib/node-compat/lazy-crypto.ts. It has to resolve *before* connect() runs,
	// because the Node APIs partisia calls into are synchronous.
	const [{ default: PartisiaSdk }] = await Promise.all([
		import('partisia-blockchain-applications-sdk'),
		loadWalletCrypto()
	]);
	const sdk = new PartisiaSdk();

	await sdk.connect({
		chainId: config.chainId,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- connect() wants PartisiaSdk's internal PermissionTypes enum, which the package does not export
		permissions: config.permissions as any,
		dappName: config.dAppName
	});

	if (sdk.connection) return sdk;
	else throw new Error('Connection failed');
};

export const getAccountBalance = async (address: string) => {
	const body = { query: accountCoinsQuery, variables: { address } };

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

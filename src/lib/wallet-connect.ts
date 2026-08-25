import type { SigningStrategyType, SigningClassType } from '@metanames/sdk';
import { alertMessage, walletAddress } from './stores/main';
import { reportError } from './sentry';

/**
 * What a connector hands back once its wallet-specific work is done.
 *
 * `strategy` is the SDK's `SigningStrategyType` name; `value` is whatever that
 * strategy expects (the MetaMask provider, the Partisia client, the Ledger
 * transport or the raw dev private key); `address` is what gets published to the
 * `walletAddress` store.
 */
export interface ConnectResult {
	strategy: SigningStrategyType;
	value: SigningClassType;
	address: string | undefined;
}

export interface WalletConnector {
	/** Human-readable wallet name, used verbatim in error alerts. */
	kind: string;
	/**
	 * Do the wallet-specific connect work and hand back the pieces the shared
	 * orchestrator needs. Throwing routes into the failure path of `connectWallet`.
	 */
	connect(): Promise<ConnectResult>;
}

/** Deliberately not reported to Sentry — see `createPrivateKeyConnector`. */
export type PrivateKeyConnector = WalletConnector & {
	kind: 'privateKey';
	onSuccess?: () => void;
};

async function setSdkStrategy(strategy: SigningStrategyType, value: SigningClassType) {
	const { metaNamesSdk } = await import('./stores/sdk');
	metaNamesSdk.update((sdk) => {
		sdk.setSigningStrategy(strategy, value);
		return sdk;
	});
}

/**
 * Run one wallet's connect flow end-to-end:
 * connect → set signing strategy → resolve address → publish to the store.
 *
 * Any failure alerts the user and reports to Sentry. Resolves `true` on success so
 * callers can react (close the menu, clear state) without re-deriving success from
 * the store.
 *
 * `opts.silent` skips the Sentry report while still alerting. The dev private-key
 * flow sets it: a failure's error context would carry the dev key, and the key must
 * never leave the device.
 */
export async function connectWallet(
	connector: WalletConnector,
	{ silent = false }: { silent?: boolean } = {}
): Promise<boolean> {
	try {
		const { strategy, value, address } = await connector.connect();
		if (!address) {
			alertMessage.set(`Couldn't connect to ${connector.kind} wallet`);
			return false;
		}

		await setSdkStrategy(strategy, value);
		walletAddress.set(address);

		if (connector.kind === 'privateKey') (connector as PrivateKeyConnector).onSuccess?.();

		return true;
	} catch (e) {
		console.error(`Failed to connect the ${connector.kind} wallet`, e);
		// Deliberately not sent to Sentry for private keys: the failure context would carry the dev key.
		if (!silent) void reportError(e, { extra: { wallet: connector.kind } });
		alertMessage.set(`Couldn't connect to ${connector.kind} wallet`);
		return false;
	}
}

const metaMaskConnector: WalletConnector = {
	kind: 'MetaMask',
	async connect() {
		const { connectMetaMask, getAddress } = await import('./wallet');

		const metamask = await connectMetaMask();

		return {
			strategy: 'MetaMask',
			value: metamask,
			address: await getAddress(metamask)
		};
	}
};

const partisiaConnector: WalletConnector = {
	kind: 'Partisia',
	async connect() {
		const { connectPartisia, getAddress } = await import('./wallet');

		const client = await connectPartisia();
		if (!client.connection) throw new Error('Connection failed');

		return {
			strategy: 'partisiaSdk',
			value: client,
			address: await getAddress(client)
		};
	}
};

const ledgerConnector: WalletConnector = {
	kind: 'Ledger',
	async connect() {
		// Loaded on demand: the Ledger transport and its `@ledgerhq/errors` dependency are
		// browser-only WebUSB code, and a static import pulls them into the root layout
		// chunk — and into the SSR module graph — for every visitor who never uses Ledger.
		const [{ default: TransportWebUSB }, { PartisiaLedgerClient }] = await Promise.all([
			import('@ledgerhq/hw-transport-webusb'),
			import('@metanames/sdk/dist/transactions/ledger')
		]);

		const transport = await TransportWebUSB.create();
		const address = await new PartisiaLedgerClient(transport).getAddress();

		return { strategy: 'Ledger', value: transport, address };
	}
};

/**
 * Dev/testnet-only connector that signs with a raw hex private key.
 *
 * The key lives only in this closure and is handed to two consumers: the SDK's
 * signing-strategy slot and the one-shot address lookup. Nothing else ever sees it —
 * which is exactly why failures on this path are reported with `{ silent: true }`
 * by the component instead of through the generic Sentry reporter.
 *
 * `onSuccess` lets the caller close the menu / clear the input only when the connect
 * actually succeeded, matching the old inline flow.
 */
export function createPrivateKeyConnector(
	privateKey: string,
	onSuccess?: () => void
): PrivateKeyConnector {
	return {
		kind: 'privateKey',
		async connect() {
			const { privateKeyToAccountAddress } =
				await import('partisia-blockchain-applications-crypto/lib/main/wallet');

			const address = await privateKeyToAccountAddress(privateKey);
			if (!address) throw new Error('Invalid private key');

			return { strategy: 'privateKey', value: privateKey, address };
		},
		onSuccess
	};
}

export const WALLET_CONNECTORS: Record<'metaMask' | 'partisia' | 'ledger', WalletConnector> = {
	metaMask: metaMaskConnector,
	partisia: partisiaConnector,
	ledger: ledgerConnector
};

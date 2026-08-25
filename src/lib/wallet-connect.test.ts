import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// All mock handles live in one hoisted object so top-level vi.mock factories can
// close over them while individual tests retarget them. Crucially, everything
// (orchestrator, stores, sentry, wallet helpers) is mocked at the TOP level and
// imported once: using vi.doMock + vi.resetModules here would give the freshly
// re-imported wallet-connect its own copy of ./stores/main, and its store writes
// would land on a different store instance than the one these tests assert on.
const mocks = vi.hoisted(() => ({
	setSigningStrategy: vi.fn(),
	reportError: vi.fn(),
	connectMetaMask: vi.fn(),
	getAddress: vi.fn(),
	connectPartisia: vi.fn(),
	usbCreate: vi.fn(),
	ledgerClientCtor: vi.fn(),
	ledgerAddress: undefined as string | undefined,
	privateKeyToAccountAddress: vi.fn()
}));

// The SDK store is a dynamic import inside the orchestrator; mock it so no real
// MetaNamesSdk instance is ever constructed.
vi.mock('./stores/sdk', () => ({
	metaNamesSdk: {
		update: vi.fn((updater: (sdk: unknown) => unknown) =>
			updater({ setSigningStrategy: mocks.setSigningStrategy })
		)
	}
}));

vi.mock('./sentry', () => ({ reportError: mocks.reportError }));

vi.mock('./wallet', () => ({
	connectMetaMask: mocks.connectMetaMask,
	getAddress: mocks.getAddress,
	connectPartisia: mocks.connectPartisia
}));

vi.mock('@ledgerhq/hw-transport-webusb', () => ({
	default: { create: mocks.usbCreate }
}));

vi.mock('@metanames/sdk/dist/transactions/ledger', () => ({
	PartisiaLedgerClient: class {
		constructor(transport: unknown) {
			mocks.ledgerClientCtor(transport);
		}
		getAddress() {
			return Promise.resolve(mocks.ledgerAddress);
		}
	}
}));

vi.mock('partisia-blockchain-applications-crypto/lib/main/wallet', () => ({
	privateKeyToAccountAddress: mocks.privateKeyToAccountAddress
}));

// Wallet stores are plain writables in the real module — use them directly.
import { alertMessage, walletAddress } from './stores/main';
import { connectWallet, WALLET_CONNECTORS, createPrivateKeyConnector } from './wallet-connect';

const ADDRESS = '00d1c0ffee00000000000000000000000000000001';

interface ConnectorOverrides {
	address?: string;
	fail?: Error;
}

function connectorWith(overrides: ConnectorOverrides = {}) {
	return {
		kind: 'Test',
		connect: overrides.fail
			? vi.fn().mockRejectedValue(overrides.fail)
			: // Explicit `in` check: `overrides.address ?? ADDRESS` would silently turn an
				// intentional `undefined` (the missing-address outcome) into ADDRESS.
				vi.fn().mockResolvedValue({
					strategy: 'MetaMask' as const,
					value: { mockClient: true },
					address: 'address' in overrides ? overrides.address : ADDRESS
				})
	};
}

describe('connectWallet', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		alertMessage.set(undefined);
		walletAddress.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('sets the signing strategy and publishes the address on success', async () => {
		const connector = connectorWith();

		await expect(connectWallet(connector)).resolves.toBe(true);

		expect(setSigningStrategyCalls()).toEqual([['MetaMask', { mockClient: true }]]);
		expect(get(walletAddress)).toBe(ADDRESS);
		expect(get(alertMessage)).toBeUndefined();
		expect(mocks.reportError).not.toHaveBeenCalled();
	});

	it('alerts without reporting when the wallet returns no address', async () => {
		const connector = connectorWith({ address: undefined });

		await expect(connectWallet(connector)).resolves.toBe(false);

		expect(get(walletAddress)).toBeUndefined();
		expect(get(alertMessage)).toBe("Couldn't connect to Test wallet");
		expect(mocks.reportError).not.toHaveBeenCalled();
	});

	it('alerts, reports to Sentry and leaves the address unset on failure', async () => {
		const boom = new Error('user rejected');
		const connector = connectorWith({ fail: boom });

		await expect(connectWallet(connector)).resolves.toBe(false);

		expect(get(walletAddress)).toBeUndefined();
		expect(setSigningStrategyCalls()).toEqual([]);
		expect(console.error).toHaveBeenCalled();
		expect(mocks.reportError).toHaveBeenCalledWith(boom, { extra: { wallet: 'Test' } });
		expect(get(alertMessage)).toBe("Couldn't connect to Test wallet");
	});
});

function setSigningStrategyCalls(): unknown[] {
	return mocks.setSigningStrategy.mock.calls;
}

describe.each(['metaMask', 'partisia', 'ledger'] as const)('%s connector', (kind) => {
	beforeEach(() => {
		vi.clearAllMocks();
		alertMessage.set(undefined);
		walletAddress.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it(`exposes a ${kind} entry with the right alert name`, async () => {
		// Drive the shared orchestrator over each table entry with its wallet-specific
		// dynamic imports mocked out — proving the wiring (strategy name → value →
		// address) for every flow without touching real wallet code.
		if (kind === 'metaMask') {
			mocks.connectMetaMask.mockResolvedValue({ request: vi.fn() });
			mocks.getAddress.mockResolvedValue(ADDRESS);

			await expect(connectWallet(WALLET_CONNECTORS.metaMask)).resolves.toBe(true);
			expect(get(walletAddress)).toBe(ADDRESS);
			expect(setSigningStrategyCalls()).toEqual([['MetaMask', { request: expect.any(Function) }]]);
		} else if (kind === 'partisia') {
			mocks.connectPartisia.mockResolvedValue({
				connection: { account: { address: ADDRESS } }
			});
			mocks.getAddress.mockResolvedValue(ADDRESS);

			await expect(connectWallet(WALLET_CONNECTORS.partisia)).resolves.toBe(true);
			expect(get(walletAddress)).toBe(ADDRESS);
			expect(setSigningStrategyCalls()).toEqual([
				['partisiaSdk', expect.objectContaining({ connection: expect.anything() })]
			]);
		} else {
			mocks.usbCreate.mockResolvedValue({ mockTransport: true });
			mocks.ledgerAddress = ADDRESS;

			await expect(connectWallet(WALLET_CONNECTORS.ledger)).resolves.toBe(true);
			expect(get(walletAddress)).toBe(ADDRESS);
			expect(setSigningStrategyCalls()).toEqual([['Ledger', { mockTransport: true }]]);
			expect(mocks.ledgerClientCtor).toHaveBeenCalledWith({ mockTransport: true });
		}

		expect(get(alertMessage)).toBeUndefined();
		expect(mocks.reportError).not.toHaveBeenCalled();
	});
});

describe('private key connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		alertMessage.set(undefined);
		walletAddress.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('publishes the derived address and fires onSuccess', async () => {
		mocks.privateKeyToAccountAddress.mockResolvedValue(ADDRESS);
		const onSuccess = vi.fn();

		await expect(
			connectWallet(createPrivateKeyConnector('a'.repeat(64), onSuccess), { silent: true })
		).resolves.toBe(true);

		expect(onSuccess).toHaveBeenCalledTimes(1);
		expect(get(walletAddress)).toBe(ADDRESS);
		expect(setSigningStrategyCalls()).toEqual([['privateKey', 'a'.repeat(64)]]);
		expect(mocks.reportError).not.toHaveBeenCalled();
	});

	it('MUST NOT report private-key failures to Sentry — the context would carry the key', async () => {
		mocks.privateKeyToAccountAddress.mockRejectedValue(new Error('bad hex'));
		const onSuccess = vi.fn();

		await expect(
			connectWallet(createPrivateKeyConnector('zz'.repeat(32), onSuccess), { silent: true })
		).resolves.toBe(false);

		expect(mocks.reportError).not.toHaveBeenCalled();
		expect(onSuccess).not.toHaveBeenCalled();
		expect(get(walletAddress)).toBeUndefined();
		expect(get(alertMessage)).toBe("Couldn't connect to privateKey wallet");
	});

	it('alerts "Invalid private key" path via a null address lookup without reporting', async () => {
		mocks.privateKeyToAccountAddress.mockResolvedValue(undefined);

		await expect(
			connectWallet(createPrivateKeyConnector('b'.repeat(64)), { silent: true })
		).resolves.toBe(false);

		expect(mocks.reportError).not.toHaveBeenCalled();
		expect(get(alertMessage)).toBe("Couldn't connect to privateKey wallet");
	});
});

describe('WALLET_CONNECTORS table', () => {
	it('covers the three interactive wallets', () => {
		expect(Object.keys(WALLET_CONNECTORS).sort()).toEqual(['ledger', 'metaMask', 'partisia']);
		for (const connector of Object.values(WALLET_CONNECTORS)) {
			expect(typeof connector.connect).toBe('function');
		}
	});
});

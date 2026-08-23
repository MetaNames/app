import { requireWalletCrypto, type Bip32Node } from './lazy-crypto';

/**
 * bip32, forwarded to a lazily-loaded backend.
 *
 * Same seam and same reason as [bip39]: partisia's HD helpers (`getWalletExtended`,
 * `walletFromXPrv`, `walletFromXPub`) run on the Partisia Wallet connect and sign
 * paths, so they have to work — but bip32 is what drags in `tiny-secp256k1`, `wif` and
 * `bs58check`, and it is imported at module scope from a module the shared chunk
 * already contains. The implementation is @scure/bip32, installed by the dynamic
 * import behind `loadWalletCrypto()`; see lazy-crypto.ts.
 *
 * `fromSeed` and `fromBase58` are the two entry points partisia uses. `fromPrivateKey`
 * and `fromPublicKey` construct a node from a raw key plus chain code, which nothing
 * in this app's graph reaches; they throw naming themselves rather than ship an
 * adapter no test exercises.
 */
export type { Bip32Node };

function impl(member: string) {
	return requireWalletCrypto(`bip32.${member}`).bip32;
}

function notReachable(member: string): never {
	throw new Error(
		`bip32.${member} is not implemented in app scope. It constructs an HD node from a raw ` +
			`key and chain code, which no path in this app reaches; add it to ` +
			`src/lib/node-compat/wallet-crypto.ts, with vectors, if that changes.`
	);
}

export function fromSeed(seed: Uint8Array): Bip32Node {
	return impl('fromSeed').fromSeed(seed);
}

export function fromBase58(extendedKey: string): Bip32Node {
	return impl('fromBase58').fromBase58(extendedKey);
}

export function fromPrivateKey(): never {
	notReachable('fromPrivateKey');
}

export function fromPublicKey(): never {
	notReachable('fromPublicKey');
}

export default { fromBase58, fromPrivateKey, fromPublicKey, fromSeed };

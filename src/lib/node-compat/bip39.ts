import { requireWalletCrypto } from './lazy-crypto';

/**
 * bip39, forwarded to a lazily-loaded backend.
 *
 * The real package is ~255 KB rendered, almost all of it the eight language wordlists,
 * and it lands in the chunk every route loads: partisia's `wallet.ts` does
 * `import * as bip39` at module scope, and @metanames/sdk pulls that module into the
 * shared graph for every visitor.
 *
 * It is not dead weight there, though. `entropyToMnemonic` and `getKeyPairHD` are on
 * the live Partisia Wallet connect *and* sign paths — `sdk.connect()` derives its
 * session keypair from a mnemonic over the SDK's own seed — so these functions have to
 * work. They forward to @scure/bip39 with the English wordlist, installed by the
 * dynamic import behind `loadWalletCrypto()`, which keeps the weight in an async
 * chunk. See lazy-crypto.ts for the seam and wallet-crypto.ts for the implementation.
 *
 * This module still resolves and imports cleanly with nothing loaded, which is
 * load-bearing: `wallet.ts` imports it at module scope, so a missing module would
 * break importing `privateKeyToAccountAddress` — the private-key login path, which
 * needs no HD derivation at all.
 */
function impl(member: string) {
	return requireWalletCrypto(`bip39.${member}`).bip39;
}

export function generateMnemonic(strength?: number): string {
	return impl('generateMnemonic').generateMnemonic(strength);
}

export function validateMnemonic(mnemonic: string): boolean {
	return impl('validateMnemonic').validateMnemonic(mnemonic);
}

export function mnemonicToSeedSync(mnemonic: string, passphrase?: string | null): Buffer {
	return impl('mnemonicToSeedSync').mnemonicToSeedSync(mnemonic, passphrase);
}

/**
 * Async seed derivation, kept for API parity with bip39 itself.
 *
 * No caller in this codebase uses it today — partisia's wallet path only needs
 * the sync variant — but dropping it would break the module's promise of being
 * a drop-in bip39 surface. Kept deliberately; do not remove without widening
 * that contract decision.
 */
export function mnemonicToSeed(mnemonic: string, passphrase?: string | null): Promise<Buffer> {
	return impl('mnemonicToSeed').mnemonicToSeed(mnemonic, passphrase);
}

/** Hex, as bip39 v3 returns it — not bytes. */
export function mnemonicToEntropy(mnemonic: string): string {
	return impl('mnemonicToEntropy').mnemonicToEntropy(mnemonic);
}

export function entropyToMnemonic(entropy: Uint8Array | string): string {
	return impl('entropyToMnemonic').entropyToMnemonic(entropy);
}

export function getDefaultWordlist(): string {
	return impl('getDefaultWordlist').getDefaultWordlist();
}

export function setDefaultWordlist(language: string): void {
	impl('setDefaultWordlist').setDefaultWordlist(language);
}

/**
 * `wallet.ts` reads `bip39.wordlists[bip39.getDefaultWordlist()]`, an index rather
 * than a call, so the forwarding has to happen in a property getter.
 */
export const wordlists: Record<string, string[]> = new Proxy(
	{},
	{
		get: (_target, property) => {
			const language = String(property);

			return impl(`wordlists.${language}`).wordlist(language);
		}
	}
);

export default {
	entropyToMnemonic,
	generateMnemonic,
	getDefaultWordlist,
	mnemonicToEntropy,
	mnemonicToSeed,
	mnemonicToSeedSync,
	setDefaultWordlist,
	validateMnemonic,
	wordlists
};

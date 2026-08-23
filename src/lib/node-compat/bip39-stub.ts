/**
 * bip39, stubbed: every export throws, naming itself.
 *
 * The real package is ~255 KB rendered, almost all of it the eight language
 * wordlists, and it sits in the chunk every route loads. It is reached only
 * through the mnemonic/HD helpers in partisia-blockchain-applications-crypto —
 * `generateMnemonic`, `getWalletExtended`, `getKeyPairHD`, `getKeyPairLegacy`
 * and friends — none of which this app calls. Meta Names connects a wallet
 * (MetaMask, Partisia, Ledger) or takes a raw private key; it never derives a
 * seed from a mnemonic.
 *
 * Stubbed rather than deleted on purpose. The module still resolves and still
 * imports cleanly — `wallet.ts` does `import * as bip39` at module scope, so a
 * missing module would break importing `privateKeyToAccountAddress` itself.
 * Only *calling* an unused function fails, and it fails with the function's
 * name in the message instead of a swallowed Proxy error 20 seconds later.
 */
function notBundled(name: string): never {
	throw new Error(
		`bip39.${name} is not polyfilled — mnemonic/keystore ops are not used in this app. ` +
			`Restore the real dependency (and its ~255 KB of wordlists) if that changes.`
	);
}

export function generateMnemonic(): never {
	notBundled('generateMnemonic');
}

export function validateMnemonic(): never {
	notBundled('validateMnemonic');
}

export function mnemonicToSeedSync(): never {
	notBundled('mnemonicToSeedSync');
}

export function mnemonicToSeed(): never {
	notBundled('mnemonicToSeed');
}

export function mnemonicToEntropy(): never {
	notBundled('mnemonicToEntropy');
}

export function entropyToMnemonic(): never {
	notBundled('entropyToMnemonic');
}

export function getDefaultWordlist(): never {
	notBundled('getDefaultWordlist');
}

export function setDefaultWordlist(): never {
	notBundled('setDefaultWordlist');
}

/**
 * `wallet.ts` reads `bip39.wordlists[bip39.getDefaultWordlist()]`. The getter
 * throws before the index happens, so this only has to exist to be indexed.
 */
export const wordlists: Record<string, string[]> = new Proxy(
	{},
	{
		get: (_target, property) => notBundled(`wordlists.${String(property)}`)
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

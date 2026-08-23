/**
 * bip32, stubbed: every export throws, naming itself.
 *
 * Same reasoning as [bip39-stub]: reached only from the HD-wallet helpers
 * (`walletFromXPub`, `walletFromXPrv`, `getWalletExtended`, `getKeyPairHD`) that
 * this app never calls. Smaller than bip39 on its own (~12 KB), but it is what
 * pulls in `tiny-secp256k1`, `wif` and `bs58check`, and it is imported at module
 * scope by `wallet.ts` — so it has to resolve, and only calling it may fail.
 */
function notBundled(name: string): never {
	throw new Error(
		`bip32.${name} is not polyfilled — HD wallet derivation is not used in this app. ` +
			`Restore the real dependency if that changes.`
	);
}

export function fromSeed(): never {
	notBundled('fromSeed');
}

export function fromBase58(): never {
	notBundled('fromBase58');
}

export function fromPrivateKey(): never {
	notBundled('fromPrivateKey');
}

export function fromPublicKey(): never {
	notBundled('fromPublicKey');
}

export default { fromBase58, fromPrivateKey, fromPublicKey, fromSeed };

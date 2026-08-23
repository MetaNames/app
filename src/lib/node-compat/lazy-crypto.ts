/**
 * The seam that keeps HD derivation and AES out of the chunk every route loads.
 *
 * `crypto`, `bip39` and `bip32` are aliased to modules in this directory, and
 * partisia-blockchain-applications-crypto imports all three at module scope — from a
 * module @metanames/sdk pulls into the shared chunk. So anything those shims import
 * statically ships to every visitor, whether or not they ever open a wallet. bip39's
 * wordlist, @scure/bip32 and @noble/ciphers are reachable from exactly one feature:
 * the Partisia Wallet connect/sign path (src/lib/wallet.ts `connectPartisia`).
 *
 * Hence this indirection. The shims hold no implementation; they forward to a backend
 * that a single dynamic `import()` installs, so the weight lands in an async chunk
 * that only the Partisia path fetches. The Node cipher and bip32 APIs are
 * synchronous, so the load has to happen *before* the call rather than inside it —
 * which is why this is `loadWalletCrypto()` and not a lazy getter.
 *
 * Calling a forwarded function before the backend loads throws, naming the function.
 * That is deliberately the same contract as a genuinely unimplemented API: loud and
 * immediate, never a Vite-externalized Proxy that fails on property access 20 seconds
 * later inside somebody's `catch`.
 */

type BinaryLike = Uint8Array | ArrayBufferView | string;

/**
 * The slice of Node's Cipher/Decipher that partisia's ecies and keystore use. See
 * `wallet-crypto.ts` for the one behavioural difference from Node's own streaming
 * cipher, which both callers are insensitive to.
 */
export interface NodeCipher {
	update(data: BinaryLike, inputEncoding?: BufferEncoding): Buffer;
	final(): Buffer;
	setAutoPadding(autoPadding?: boolean): NodeCipher;
}

/** bip39 v3's surface, as partisia's `wallet.ts` consumes it. */
export interface Bip39Backend {
	entropyToMnemonic(entropy: Uint8Array | string): string;
	generateMnemonic(strength?: number): string;
	getDefaultWordlist(): string;
	mnemonicToEntropy(mnemonic: string): string;
	mnemonicToSeed(mnemonic: string, passphrase?: string | null): Promise<Buffer>;
	mnemonicToSeedSync(mnemonic: string, passphrase?: string | null): Buffer;
	setDefaultWordlist(language: string): void;
	validateMnemonic(mnemonic: string): boolean;
	/** Backs `bip39.wordlists[language]`, which is an index rather than a call. */
	wordlist(language: string): string[];
}

/** bip32 v2's BIP32Interface, narrowed to the members partisia's HD helpers touch. */
export interface Bip32Node {
	readonly depth: number;
	readonly privateKey: Buffer | undefined;
	readonly publicKey: Buffer;
	derive(index: number): Bip32Node;
	deriveHardened(index: number): Bip32Node;
	derivePath(path: string): Bip32Node;
	neutered(): Bip32Node;
	toBase58(): string;
}

export interface Bip32Backend {
	fromBase58(extendedKey: string): Bip32Node;
	fromSeed(seed: Uint8Array): Bip32Node;
}

export interface CipherBackend {
	createCipheriv(algorithm: string, key: BinaryLike, iv: BinaryLike | null): NodeCipher;
	createDecipheriv(algorithm: string, key: BinaryLike, iv: BinaryLike | null): NodeCipher;
	pbkdf2Sync(
		password: BinaryLike,
		salt: BinaryLike,
		iterations: number,
		keylen: number,
		digest: string
	): Buffer;
}

export interface WalletCryptoBackend {
	bip32: Bip32Backend;
	bip39: Bip39Backend;
	ciphers: CipherBackend;
}

interface Registry {
	backend?: WalletCryptoBackend;
	loading?: Promise<void>;
}

/**
 * The registry hangs off `globalThis`, not a module-level `let`, and that is not
 * defensiveness — a module-level `let` is provably wrong in `vite dev`.
 *
 * Vite pre-bundles dependencies with esbuild, which honours `resolve.alias` and so
 * *inlines* this file into the optimized chunk for
 * partisia-blockchain-applications-crypto. App source under src/ gets the file served
 * as source instead. Two copies, two sets of module state: `connectPartisia()` would
 * install the backend into the copy it imported while the dependency kept reading the
 * empty registry in its own copy, and the Partisia wallet would fail in dev only —
 * with the very "not loaded" error this seam raises to prevent silent breakage.
 * Measured: without this, tests/e2e/crypto-shim.spec.ts fails against the dev server
 * and passes against the production bundle, where Rollup resolves both to one module.
 *
 * One global slot collapses the copies back into one installation point, which is what
 * a polyfill registry is.
 */
interface RegistryHost {
	__metanamesWalletCrypto?: Registry;
}

function registry(): Registry {
	const host = globalThis as unknown as RegistryHost;

	return (host.__metanamesWalletCrypto ??= {});
}

/** Called for its side effect by `wallet-crypto.ts` as that module evaluates. */
export function registerWalletCrypto(implementation: WalletCryptoBackend): void {
	registry().backend = implementation;
}

/**
 * Fetch and install the backend. Idempotent, and safe to call concurrently: the
 * promise is memoised, so a second caller awaits the first import rather than
 * starting another.
 */
export function loadWalletCrypto(): Promise<void> {
	const slot = registry();
	slot.loading ??= import('./wallet-crypto').then(() => undefined);

	return slot.loading;
}

/** True once `loadWalletCrypto()` has resolved. Exposed for tests and diagnostics. */
export function isWalletCryptoLoaded(): boolean {
	return registry().backend !== undefined;
}

export function requireWalletCrypto(callee: string): WalletCryptoBackend {
	const { backend } = registry();

	if (!backend)
		throw new Error(
			`${callee} needs the Partisia wallet crypto backend, which is not loaded. ` +
				`Await loadWalletCrypto() from src/lib/node-compat/lazy-crypto.ts before entering a ` +
				`path that derives HD keys or runs AES — connectPartisia() in src/lib/wallet.ts is ` +
				`the only caller today.`
		);

	return backend;
}

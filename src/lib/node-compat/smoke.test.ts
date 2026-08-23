import { describe, expect, it } from 'vitest';

/**
 * Smoke test for the browser node-compat layer.
 *
 * These import the *bare* specifiers, so they exercise the same mapping the client
 * build uses (via `test.alias` in vite.config.ts). The point is not coverage of the
 * shims' internals — it is to prove the wiring holds: that `crypto` resolves to our
 * module and hashes correctly, and that the unimplemented surface fails with its own
 * name in the message rather than as a Proxy access error swallowed upstream.
 *
 * The casts are load-bearing rather than cosmetic. `svelte-check` resolves a bare
 * `'crypto'` against @types/node, so without them it typechecks these calls against
 * Node's signatures — which is exactly the module we are asserting we do *not* get.
 * Naming our own module's type is the assertion.
 *
 * Golden crypto output for the real SDK call paths lives in crypto-vectors.test.ts,
 * and the HD/AES backend's own vectors in wallet-crypto.test.ts. This file
 * deliberately never calls `loadWalletCrypto()`: what it asserts about `bip39`,
 * `bip32` and the ciphers is how they fail *before* that happens, and the registry is
 * module state that Vitest only isolates per file.
 */
type CompatCrypto = typeof import('./crypto');
type CompatAssert = { default: typeof import('./assert.cjs') };
type CompatBip39 = typeof import('./bip39');
type CompatBip32 = typeof import('./bip32');

const importCrypto = async () => (await import('crypto')) as unknown as CompatCrypto;
const importAssert = async () => (await import('assert')) as unknown as CompatAssert;
describe('node-compat crypto', () => {
	it('hashes with sha256, matching the known digest of "hello"', async () => {
		const crypto = await importCrypto();
		const hash = crypto.createHash('sha256');
		hash.update('hello');

		expect(hash.digest('hex')).toBe(
			'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
		);
	});

	it('accumulates across several update calls', async () => {
		const crypto = await importCrypto();
		const split = crypto.createHash('sha256');
		split.update('hel');
		split.update('lo');

		expect(split.digest('hex')).toBe(
			'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
		);
	});

	it('returns a Buffer from digest() with no encoding', async () => {
		const crypto = await importCrypto();
		const digest = crypto.createHash('sha256').update('hello').digest();

		expect(digest).toBeInstanceOf(Uint8Array);
		expect(digest.length).toBe(32);
	});

	it('produces randomBytes of the requested length', async () => {
		const crypto = await importCrypto();

		expect(crypto.randomBytes(16).length).toBe(16);
		expect(crypto.randomBytes(32).length).toBe(32);
	});

	it('derives a matching ECDH shared secret in both directions', async () => {
		const crypto = await importCrypto();
		const alice = crypto.createECDH('secp256k1');
		const bob = crypto.createECDH('secp256k1');
		const alicePublic = alice.generateKeys();
		const bobPublic = bob.generateKeys();

		expect(alice.computeSecret(bobPublic).toString('hex')).toBe(
			bob.computeSecret(alicePublic).toString('hex')
		);
	});

	it('names the algorithm when a hash is not implemented', async () => {
		const crypto = await importCrypto();

		expect(() => crypto.createHash('md5')).toThrow(/crypto\.createHash\('md5'\)/);
	});

	it('names the function when a cipher is called before its backend loads', async () => {
		const crypto = await importCrypto();

		expect(() =>
			crypto.createCipheriv('aes-128-ecb', new Uint8Array(16), new Uint8Array(0))
		).toThrow(/crypto\.createCipheriv\('aes-128-ecb'\) needs the Partisia wallet crypto backend/);
		expect(() =>
			crypto.createDecipheriv('aes-128-ecb', new Uint8Array(16), new Uint8Array(0))
		).toThrow(/crypto\.createDecipheriv\('aes-128-ecb'\) needs the Partisia wallet crypto backend/);
		expect(() => crypto.pbkdf2Sync(new Uint8Array(8), new Uint8Array(8), 1, 32, 'sha256')).toThrow(
			/crypto\.pbkdf2Sync needs the Partisia wallet crypto backend/
		);
	});
});

describe('node-compat assert', () => {
	it('passes a truthy value and throws the given message on a falsy one', async () => {
		const { default: assert } = await importAssert();

		expect(() => assert(true)).not.toThrow();
		expect(() => assert(false, 'must be sha256 hash')).toThrow('must be sha256 hash');
		expect(() => assert(0)).toThrow('assertion failed');
	});

	it('supports the equality helpers', async () => {
		const { default: assert } = await importAssert();

		expect(() => assert.strictEqual(1, 1)).not.toThrow();
		expect(() => assert.strictEqual(1, 2)).toThrow();
		expect(() => assert.deepEqual({ a: [1, 2] }, { a: [1, 2] })).not.toThrow();
		expect(() => assert.deepEqual({ a: [1, 2] }, { a: [1, 3] })).toThrow();
	});
});

describe('node-compat HD shims before the backend loads', () => {
	it('reports no backend installed', async () => {
		const { isWalletCryptoLoaded } = await import('./lazy-crypto');

		expect(isWalletCryptoLoaded()).toBe(false);
	});

	it('imports bip39 cleanly but names the function when called', async () => {
		const bip39 = (await import('bip39')) as unknown as CompatBip39;

		// Importing has to stay side-effect free: partisia's wallet.ts imports bip39 at
		// module scope, and the private-key login path goes through that same module
		// without ever deriving an HD key.
		expect(typeof bip39.entropyToMnemonic).toBe('function');
		expect(() => bip39.generateMnemonic()).toThrow(
			/bip39\.generateMnemonic needs the Partisia wallet crypto backend/
		);
		expect(() => bip39.mnemonicToSeedSync('whatever')).toThrow(
			/bip39\.mnemonicToSeedSync needs the Partisia wallet crypto backend/
		);
		expect(() => bip39.wordlists.english).toThrow(
			/bip39\.wordlists\.english needs the Partisia wallet crypto backend/
		);
	});

	it('imports bip32 cleanly but names the function when called', async () => {
		const bip32 = (await import('bip32')) as unknown as CompatBip32;

		expect(() => bip32.fromSeed(new Uint8Array(64))).toThrow(
			/bip32\.fromSeed needs the Partisia wallet crypto backend/
		);
		expect(() => bip32.fromBase58('xprv')).toThrow(
			/bip32\.fromBase58 needs the Partisia wallet crypto backend/
		);
	});
});

describe('node-compat Buffer global', () => {
	it('is bound without an explicit import', () => {
		expect(typeof globalThis.Buffer).not.toBe('undefined');
		expect(Buffer.from([1, 2, 3]).length).toBe(3);
	});
});

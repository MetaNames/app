import {
	createCipheriv as nodeCreateCipheriv,
	createDecipheriv as nodeCreateDecipheriv,
	pbkdf2Sync as nodePbkdf2Sync
} from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { isWalletCryptoLoaded, loadWalletCrypto } from './lazy-crypto';

/**
 * Pins the lazily-loaded HD/AES backend against the implementations it replaces.
 *
 * These import the *bare* specifiers, so the call goes through the same chain the
 * browser uses: `resolve.alias` (here, `test.alias`) -> the shim -> the registry ->
 * the backend that `loadWalletCrypto()` installs. Only the last hop is new code; the
 * rest is the wiring a regression would break.
 *
 * The expectations are not invented. Every bip39/bip32 vector below was produced by
 * running the real `bip39@3.1.0` and `bip32@2.0.6` — still in node_modules as
 * partisia-blockchain-applications-crypto's own dependencies — over the same inputs,
 * and every AES and PBKDF2 vector is checked against `node:crypto` in the same
 * assertion rather than only against a stored constant. `node:crypto` is deliberately
 * spelled with the prefix: bare `crypto` is aliased to the shim under test.
 *
 * `smoke.test.ts` is the other half of this: it asserts the same surface fails loudly
 * *before* the backend loads. The two must stay in separate files — the registry lives
 * on `globalThis`, and a test file is the smallest unit Vitest gives a fresh one to.
 */

/** partisia-blockchain-applications-crypto/lib/main/wallet.js `PathHD`. */
const PATH_HD = "m/44'/3757'/0'/0";

const ENTROPY = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

const GOLDEN = {
	mnemonic:
		'abandon amount liar amount expire adjust cage candy arch gather drum bullet ' +
		'absurd math era live bid rhythm alien crouch range attend journey unaware',
	seed:
		'0a6d060f6242aece4b074e48e7d8166f792a9b2bb7b295fa5ac289eda7647290' +
		'c3d80e7436d6e9e34e72769c06f6582192d0b57ae4a97e9e24c8972a770a57d9',
	seedWithPassphrase:
		'f685258da40acad9b6b8f92a869cd8c15339fcd67977f5ef8499fc869d2f65e9' +
		'ed5363f85273c119f44327938997d0936346c022a897a944422f663a739c0f88',
	xprv:
		'xprv9ypR4c41kAMrmSUnPqxRP167BiJAoFKHXtESBKLiACaMKB8Z3BSa15FX7wnQ6' +
		'Wbry72MVrER1SrNb6QEsoqX8r1Qs1zq9FKqatqGXcsVrL5',
	xpub:
		'xpub6ComU7auaXv9yvZFVsVRk92qjk8fCi38u7A2yhkKiY7LByThaikpYsZzyEVVG' +
		'g2wfVg5FM1T2eQYuVXtv1VXpcXFNj9TPrxUbi83Mi92pVk',
	privateKey: 'eb6b2ab8b2f991591a538224c014aa5cbc1edfa0a8ad990be14b9533818c0a73',
	publicKey: '03edb7eff085db5272b455d3541303931dc3fc4d337c63091e04f23fce40f8971e'
};

const AES = {
	ecbKey: '0f1e2d3c4b5a69788796a5b4c3d2e1f0',
	ctrKey: '00'.repeat(16) + 'ff'.repeat(16),
	ctrIv: '0102030405060708090a0b0c0d0e0f10',
	plaintext: 'partisia ecies envelope, 45 bytes of plaintext',
	/** 46 bytes of plaintext padded to 48 — PKCS#7 is what Node applies for ECB. */
	ecbCipher:
		'a779fc13494698ae050a7788a2a93ebf55ce640c58e4b34e1a646c408128e233905df78991dd53e89d3631673afc1df8',
	ctrCipher:
		'41f622ac32e052a54cb1100f7919f7990ffd4736421dcebc30b0bb90cd04de3e7e98ba18358998e355a529bcc2f3'
};

type CompatCrypto = typeof import('./crypto');
type CompatBip39 = typeof import('./bip39');
type CompatBip32 = typeof import('./bip32');

let crypto: CompatCrypto;
let bip39: CompatBip39;
let bip32: CompatBip32;

beforeAll(async () => {
	await loadWalletCrypto();

	crypto = (await import('crypto')) as unknown as CompatCrypto;
	bip39 = (await import('bip39')) as unknown as CompatBip39;
	bip32 = (await import('bip32')) as unknown as CompatBip32;
});

/**
 * A faithful re-enactment of `getKeyPairHD` — the function `PartisiaSdk.connect()`
 * and `signMessage()` both call first — rather than a mock of it.
 *
 * The awkward parts are the point. `getWalletExtended` derives from the path with its
 * last two segments dropped, and `walletFromXPrv` re-parses the xprv and then walks
 * the remaining segments *one relative segment at a time*, driven by the node's own
 * `depth`. @scure/bip32's `derive()` rejects a path that does not start with `m`, so
 * that loop is exactly what the adapter has to absorb; testing only `derivePath('m/…')`
 * would miss it.
 */
function getKeyPairHD(mnemonic: string, index = 0) {
	const seed = bip39.mnemonicToSeedSync(mnemonic, null);
	expect(seed.length).toBe(64);

	const master = bip32.fromSeed(seed);
	const extended = master.derivePath(PATH_HD.split('/').slice(0, -2).join('/')).deriveHardened(0);
	const xprv = extended.toBase58();
	const xpub = extended.neutered().toBase58();

	const segments = `${PATH_HD}/${index}`.split('/');
	let child = bip32.fromBase58(xprv);
	while (child.depth < segments.length - 1) child = child.derivePath(segments[child.depth + 1]);

	const { privateKey } = child;
	if (!privateKey) throw new Error('expected a private child node');

	return {
		xprv,
		xpub,
		privateKey: privateKey.toString('hex'),
		publicKey: child.publicKey.toString('hex')
	};
}

describe('the lazy seam', () => {
	it('installs a backend that a second load call does not reinstall', async () => {
		expect(isWalletCryptoLoaded()).toBe(true);
		await expect(loadWalletCrypto()).resolves.toBeUndefined();
		expect(isWalletCryptoLoaded()).toBe(true);
	});
});

describe('bip39 through the lazy backend', () => {
	it('converts entropy to the mnemonic the real bip39 produces', () => {
		expect(bip39.entropyToMnemonic(ENTROPY)).toBe(GOLDEN.mnemonic);
		expect(bip39.entropyToMnemonic(Buffer.from(ENTROPY, 'hex'))).toBe(GOLDEN.mnemonic);
	});

	it('converts a mnemonic back to hex entropy, not bytes', () => {
		expect(bip39.mnemonicToEntropy(GOLDEN.mnemonic)).toBe(ENTROPY);
	});

	it('derives the golden seed, synchronously and asynchronously', async () => {
		expect(bip39.mnemonicToSeedSync(GOLDEN.mnemonic, '').toString('hex')).toBe(GOLDEN.seed);
		expect((await bip39.mnemonicToSeed(GOLDEN.mnemonic, '')).toString('hex')).toBe(GOLDEN.seed);
	});

	// partisia's `mnemonicToSeed` defaults its passphrase to `null` and passes it on.
	// @scure/bip39 interpolates the argument into the PBKDF2 salt, so an unnormalised
	// `null` would silently salt with "mnemonicnull" and derive a different wallet.
	it('treats a null or missing passphrase as the empty string, as bip39 did', () => {
		expect(bip39.mnemonicToSeedSync(GOLDEN.mnemonic, null).toString('hex')).toBe(GOLDEN.seed);
		expect(bip39.mnemonicToSeedSync(GOLDEN.mnemonic).toString('hex')).toBe(GOLDEN.seed);
	});

	it('still honours a real passphrase', () => {
		expect(bip39.mnemonicToSeedSync(GOLDEN.mnemonic, 'sekret').toString('hex')).toBe(
			GOLDEN.seedWithPassphrase
		);
	});

	it('validates mnemonics by wordlist and checksum', () => {
		expect(bip39.validateMnemonic(GOLDEN.mnemonic)).toBe(true);
		expect(bip39.validateMnemonic('abandon '.repeat(11) + 'abandon')).toBe(false);
		expect(bip39.validateMnemonic('not actually a mnemonic at all')).toBe(false);
	});

	it('generates a valid 12-word mnemonic by default', () => {
		const generated = bip39.generateMnemonic();

		expect(generated.split(' ')).toHaveLength(12);
		expect(bip39.validateMnemonic(generated)).toBe(true);
	});

	it('exposes the English wordlist the way wallet.ts indexes it', () => {
		expect(bip39.getDefaultWordlist()).toBe('english');
		expect(bip39.wordlists[bip39.getDefaultWordlist()]).toHaveLength(2048);
	});

	it('names the language when another wordlist is asked for', () => {
		expect(() => bip39.wordlists.french).toThrow(/bip39\.wordlists\.french is not supported/);
		expect(() => bip39.setDefaultWordlist('french')).toThrow(
			/bip39\.setDefaultWordlist\('french'\) is not supported/
		);
		expect(() => bip39.setDefaultWordlist('english')).not.toThrow();
	});
});

describe('bip32 through the lazy backend', () => {
	it('reproduces getKeyPairHD exactly as bip32 2.0.6 did', () => {
		const hd = getKeyPairHD(GOLDEN.mnemonic, 0);

		expect(hd.xprv).toBe(GOLDEN.xprv);
		expect(hd.xpub).toBe(GOLDEN.xpub);
		expect(hd.privateKey).toBe(GOLDEN.privateKey);
		expect(hd.publicKey).toBe(GOLDEN.publicKey);
	});

	it('neuters to the same xpub without exposing a private key', () => {
		const node = bip32.fromBase58(GOLDEN.xprv);

		expect(node.depth).toBe(3);
		expect(node.privateKey).toBeDefined();
		expect(node.neutered().toBase58()).toBe(GOLDEN.xpub);
		expect(node.neutered().privateKey).toBeUndefined();
		expect(bip32.fromBase58(GOLDEN.xpub).publicKey.toString('hex')).toBe(
			node.publicKey.toString('hex')
		);
	});

	it('rejects a path segment it cannot parse instead of deriving something else', () => {
		const master = bip32.fromSeed(Buffer.from(GOLDEN.seed, 'hex'));

		expect(() => master.derivePath("m/44'/x")).toThrow(/invalid segment "x"/);
		expect(() => master.derivePath("m/44'/")).toThrow(/invalid segment ""/);
		expect(() => bip32.fromBase58(GOLDEN.xprv).derivePath('m/0')).toThrow(
			/only valid on a master node/
		);
	});

	it('names the entry points it does not implement', () => {
		expect(() => bip32.fromPrivateKey()).toThrow(/bip32\.fromPrivateKey is not implemented/);
		expect(() => bip32.fromPublicKey()).toThrow(/bip32\.fromPublicKey is not implemented/);
	});
});

describe('AES through the lazy backend', () => {
	const plaintext = Buffer.from(AES.plaintext, 'utf8');
	const ecbKey = Buffer.from(AES.ecbKey, 'hex');
	const ctrKey = Buffer.from(AES.ctrKey, 'hex');
	const ctrIv = Buffer.from(AES.ctrIv, 'hex');

	it('encrypts aes-128-ecb byte-for-byte like Node, padding included', () => {
		const shim = crypto.createCipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0));
		const node = nodeCreateCipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0));

		const fromShim = Buffer.concat([shim.update(plaintext), shim.final()]);
		const fromNode = Buffer.concat([node.update(plaintext), node.final()]);

		expect(fromShim.toString('hex')).toBe(AES.ecbCipher);
		expect(fromShim.toString('hex')).toBe(fromNode.toString('hex'));
	});

	it('decrypts aes-128-ecb ciphertext Node produced', () => {
		const shim = crypto.createDecipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0));
		const decrypted = Buffer.concat([shim.update(Buffer.from(AES.ecbCipher, 'hex')), shim.final()]);

		expect(decrypted.toString('utf8')).toBe(AES.plaintext);
	});

	it('accumulates across several update calls, as ecies-sized payloads may arrive', () => {
		const shim = crypto.createCipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0));
		const chunks = [shim.update(plaintext.subarray(0, 5)), shim.update(plaintext.subarray(5))];

		expect(Buffer.concat([...chunks, shim.final()]).toString('hex')).toBe(AES.ecbCipher);
	});

	it('round-trips aes-256-ctr against Node in both directions', () => {
		const shim = crypto.createCipheriv('aes-256-ctr', ctrKey, ctrIv);
		const encrypted = Buffer.concat([shim.update(plaintext), shim.final()]);

		expect(encrypted.toString('hex')).toBe(AES.ctrCipher);

		const node = nodeCreateDecipheriv('aes-256-ctr', ctrKey, ctrIv);
		expect(Buffer.concat([node.update(encrypted), node.final()]).toString('utf8')).toBe(
			AES.plaintext
		);

		const back = crypto.createDecipheriv('aes-256-ctr', ctrKey, ctrIv);
		expect(Buffer.concat([back.update(encrypted), back.final()]).toString('utf8')).toBe(
			AES.plaintext
		);
	});

	it('rejects a wrong key or iv length rather than deriving a different key', () => {
		expect(() => crypto.createCipheriv('aes-128-ecb', ctrKey, Buffer.alloc(0))).toThrow(
			/key must be 16 bytes, got 32/
		);
		expect(() => crypto.createCipheriv('aes-128-ecb', ecbKey, ctrIv)).toThrow(
			/iv must be 0 bytes, got 16/
		);
		expect(() => crypto.createCipheriv('aes-256-ctr', ctrKey, Buffer.alloc(12))).toThrow(
			/iv must be 16 bytes, got 12/
		);
	});

	it('names an algorithm it does not implement instead of picking a neighbour', () => {
		expect(() => crypto.createCipheriv('aes-192-cbc', ctrKey, ctrIv)).toThrow(
			/crypto\.createCipheriv\('aes-192-cbc'\) is not supported/
		);
		expect(() => crypto.createDecipheriv('aes-128-cbc', ecbKey, ctrIv)).toThrow(
			/crypto\.createDecipheriv\('aes-128-cbc'\) is not supported/
		);
	});

	it('refuses to be reused or to have padding turned off', () => {
		const shim = crypto.createCipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0));
		shim.final();

		expect(() => shim.update(plaintext)).toThrow(/update\(\) called after final\(\)/);
		expect(() => shim.final()).toThrow(/final\(\) called twice/);
		expect(() =>
			crypto.createCipheriv('aes-128-ecb', ecbKey, Buffer.alloc(0)).setAutoPadding(false)
		).toThrow(/setAutoPadding\(false\) is not supported/);
	});
});

describe('pbkdf2Sync through the lazy backend', () => {
	const password = Buffer.from('correct horse', 'utf8');
	const salt = Buffer.from('salty', 'utf8');

	it('matches Node for the sha256 derivation keystore.ts asks for', () => {
		expect(crypto.pbkdf2Sync(password, salt, 4096, 32, 'sha256').toString('hex')).toBe(
			nodePbkdf2Sync(password, salt, 4096, 32, 'sha256').toString('hex')
		);
	});

	it('names the digest when it is not sha256', () => {
		expect(() => crypto.pbkdf2Sync(password, salt, 4096, 32, 'sha512')).toThrow(
			/crypto\.pbkdf2Sync\(\.\.\., 'sha512'\) is not supported/
		);
	});
});

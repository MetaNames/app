import {
	createECDH as nodeCreateECDH,
	createHmac as nodeCreateHmac,
	createHash as nodeCreateHash
} from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createECDH, createHash, createHmac } from './crypto';

/**
 * The internals of the always-loaded half of the crypto shim: HMAC and ECDH.
 *
 * `smoke.test.ts` proves the bare-specifier *wiring* resolves here and that the
 * lazy surface fails loudly before its backend loads; this file pins what these two
 * primitives actually compute, and how they refuse the arguments they do not honour.
 * Every value is checked against `node:crypto` in the same assertion — spelled with
 * the prefix, because bare `crypto` is aliased to the module under test — so a
 * silently-wrong implementation cannot agree with a stale constant.
 *
 * ecies.ts is the caller that matters: it takes `createHmac('sha256', …)` over the
 * ECDH shared secret to key the AES envelope on the Partisia connect and sign paths,
 * so a wrong answer from either is an unopenable envelope rather than an exception.
 */

/** HMAC-SHA256, RFC-era canonical vector. */
const HMAC = {
	key: 'key',
	message: 'The quick brown fox jumps over the lazy dog',
	digest: 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'
};

const ALICE_PRIVATE = '01'.repeat(32);
const BOB_PRIVATE = '02'.repeat(32);

/**
 * Node's real ECDH accessors take a string encoding; ours deliberately types the
 * argument as `null` only, and throws on anything else rather than returning a
 * Buffer where a string was asked for. Naming that gap is the assertion, so the
 * cast is what lets the test make the call our types forbid.
 */
type WithEncoding = (encoding?: string, format?: string) => Buffer;

describe('createHmac', () => {
	it('matches the canonical HMAC-SHA256 vector and node:crypto', () => {
		const digest = createHmac('sha256', HMAC.key).update(HMAC.message).digest('hex');

		expect(digest).toBe(HMAC.digest);
		expect(digest).toBe(nodeCreateHmac('sha256', HMAC.key).update(HMAC.message).digest('hex'));
	});

	it('returns a 32-byte Buffer from digest() with no encoding', () => {
		const digest = createHmac('sha256', HMAC.key).update(HMAC.message).digest();

		expect(digest).toBeInstanceOf(Uint8Array);
		expect(digest.toString('hex')).toBe(HMAC.digest);
	});

	it('accumulates across several update calls, and update() chains', () => {
		const mac = createHmac('sha256', HMAC.key);

		expect(mac.update('The quick brown fox ')).toBe(mac);
		expect(mac.update('jumps over the lazy dog').digest('hex')).toBe(HMAC.digest);
	});

	it('keys from bytes as well as from a string, and decodes update encodings', () => {
		const key = Buffer.from(HMAC.key, 'utf8');

		expect(createHmac('sha256', key).update(HMAC.message).digest('hex')).toBe(HMAC.digest);
		expect(
			createHmac('sha256', new Uint8Array(key))
				.update(Buffer.from(HMAC.message, 'utf8').toString('hex'), 'hex')
				.digest('hex')
		).toBe(HMAC.digest);
	});

	it('names the algorithm when an HMAC digest is not implemented', () => {
		expect(() => createHmac('sha512', HMAC.key)).toThrow(
			/crypto\.createHmac\('sha512'\) is not polyfilled in app scope/
		);
		expect(() => createHmac('md5', HMAC.key)).toThrow(/crypto\.createHmac\('md5'\)/);
	});

	// Node accepts all three spellings for the same digest, and the SDK's own call
	// sites are not consistent about it.
	it('accepts the spellings Node accepts for sha256', () => {
		for (const algorithm of ['sha256', 'SHA256', 'sha-256', 'SHA-256']) {
			expect(createHmac(algorithm, HMAC.key).update(HMAC.message).digest('hex')).toBe(HMAC.digest);
			expect(createHash(algorithm).update('hello').digest('hex')).toBe(
				nodeCreateHash('sha256').update('hello').digest('hex')
			);
		}
	});
});

describe('createECDH', () => {
	it('derives the public key node:crypto derives, in both formats', () => {
		const shim = createECDH('secp256k1');
		shim.setPrivateKey(Buffer.from(ALICE_PRIVATE, 'hex'));

		const node = nodeCreateECDH('secp256k1');
		node.setPrivateKey(Buffer.from(ALICE_PRIVATE, 'hex'));

		expect(shim.getPublicKey().toString('hex')).toBe(
			node.getPublicKey(null, 'uncompressed').toString('hex')
		);
		expect(shim.getPublicKey(null, 'compressed').toString('hex')).toBe(
			node.getPublicKey(null, 'compressed').toString('hex')
		);
	});

	// `setPrivateKey` takes no encoding argument, so a string goes through `toBytes`
	// and is decoded as utf8 — a hex string would be its 64 characters, not its 32
	// bytes. Partisia passes Buffers; this pins which reading a string gets, since the
	// two disagree silently.
	it('decodes a string private key as utf8, like every other BinaryLike here', () => {
		const passphrase = 'a thirty-two byte utf8 secret!!!';
		expect(Buffer.from(passphrase, 'utf8').length).toBe(32);

		const fromString = createECDH('secp256k1');
		fromString.setPrivateKey(passphrase);
		const fromBytes = createECDH('secp256k1');
		fromBytes.setPrivateKey(Buffer.from(passphrase, 'utf8'));

		expect(fromString.getPrivateKey().toString('hex')).toBe(
			Buffer.from(passphrase, 'utf8').toString('hex')
		);
		expect(fromString.getPublicKey().toString('hex')).toBe(
			fromBytes.getPublicKey().toString('hex')
		);
	});

	// Trimming a leading zero byte would hand ecies a 31-byte key and shift every
	// byte of the derived AES key.
	it('left-pads the private key to 32 bytes rather than trimming leading zeros', () => {
		const leadingZero = `00${'11'.repeat(31)}`;
		const ecdh = createECDH('secp256k1');
		ecdh.setPrivateKey(Buffer.from(leadingZero, 'hex'));

		const privateKey = ecdh.getPrivateKey();

		expect(privateKey.length).toBe(32);
		expect(privateKey.toString('hex')).toBe(leadingZero);
	});

	it('agrees with node:crypto on the shared secret', () => {
		const alice = createECDH('secp256k1');
		alice.setPrivateKey(Buffer.from(ALICE_PRIVATE, 'hex'));
		const bob = nodeCreateECDH('secp256k1');
		bob.setPrivateKey(Buffer.from(BOB_PRIVATE, 'hex'));

		const secret = alice.computeSecret(bob.getPublicKey()).toString('hex');

		expect(secret).toBe(bob.computeSecret(alice.getPublicKey()).toString('hex'));
		expect(secret.length).toBe(64);
	});

	it('round-trips a generated key pair through the accessors', () => {
		const ecdh = createECDH('secp256k1');
		const generated = ecdh.generateKeys();

		expect(generated.toString('hex')).toBe(ecdh.getPublicKey().toString('hex'));
		expect(ecdh.getPrivateKey().length).toBe(32);
		expect(ecdh.generateKeys(null, 'compressed').length).toBe(33);
	});

	it('says which call is missing a key instead of deriving from undefined', () => {
		const peer = createECDH('secp256k1');
		const peerPublic = peer.generateKeys();
		const empty = () => createECDH('secp256k1');
		const noKey = /crypto ECDH: no key set — call generateKeys or setPrivateKey/;

		expect(() => empty().getPublicKey()).toThrow(noKey);
		expect(() => empty().getPrivateKey()).toThrow(noKey);
		expect(() => empty().computeSecret(peerPublic)).toThrow(noKey);
	});

	it('refuses a string encoding rather than returning a Buffer for it', () => {
		const ecdh = createECDH('secp256k1');
		ecdh.generateKeys();

		expect(() => (ecdh.getPrivateKey as WithEncoding)('hex')).toThrow(
			/ECDH\.getPrivateKey\('hex'\) is not polyfilled in app scope/
		);
		expect(() => (ecdh.getPublicKey as WithEncoding)('hex')).toThrow(
			/ECDH\.getPublicKey\('hex'\) is not polyfilled in app scope/
		);
		expect(() => (ecdh.generateKeys as WithEncoding)('base64', 'compressed')).toThrow(
			/ECDH\.getPublicKey\('base64'\)/
		);
	});

	it('names the curve when it is not secp256k1', () => {
		expect(() => createECDH('prime256v1')).toThrow(
			/crypto\.createECDH\('prime256v1'\) is not polyfilled in app scope/
		);
	});
});

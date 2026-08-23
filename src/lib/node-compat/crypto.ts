import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { Buffer } from 'buffer';
import { ec as EC } from 'elliptic';
import { toBytes, type BinaryLike } from './bytes';
import { requireWalletCrypto, type NodeCipher } from './lazy-crypto';

/**
 * The slice of Node's `crypto` this app actually reaches, and nothing else.
 *
 * `vite-plugin-node-polyfills` used to satisfy these imports with
 * `crypto-browserify`, which drags in scrypt, pbkdf2, browserify-aes, des.js,
 * asn1.js, public-encrypt, diffie-hellman and a `stream` shim — ~480 KB rendered
 * into the chunk every route loads — to serve the seven calls enumerated below.
 *
 * Anything not implemented here throws *naming itself*. That is the whole point:
 * the previous attempt at this let Vite externalize `crypto` instead, which
 * yields a Proxy that throws on property access, gets swallowed by a `try/catch`
 * on a wallet path, and shows up only as 27 Playwright tests timing out. A
 * `throw` that names the missing function turns that silent 20-second hang into
 * a one-line stack trace. Replace implementations; never just remove them.
 *
 * Call surface, measured from partisia-blockchain-applications-crypto/src:
 *   randomBytes   utils-buffer.ts  — implemented (Web Crypto)
 *   createHash    utils-buffer.ts, ecies.ts — implemented, sha256 only
 *   createHmac    ecies.ts         — implemented, sha256 only
 *   createECDH    wallet.ts, ecies.ts — implemented (elliptic, secp256k1 only)
 *   createCipheriv / createDecipheriv  ecies.ts, keystore.ts — forwarded (AES)
 *   pbkdf2Sync    keystore.ts      — forwarded (sha256 only)
 *
 * The last three are the ecies envelope and the keystore. ecies is on the live
 * Partisia Wallet connect and sign paths — `sdk.connect()` decrypts the extension's
 * reply with `aes-128-ecb` — so they are implemented, but by @noble/ciphers behind
 * the lazy seam in lazy-crypto.ts rather than here: @noble/ciphers is ~35 KB of the
 * 228 KB that path needs (HD derivation is the rest), and this module is in the chunk
 * every route loads.
 */
function notPolyfilled(name: string): never {
	throw new Error(
		`crypto.${name} is not polyfilled in app scope. ` +
			`Implement it in src/lib/node-compat/crypto.ts, or in wallet-crypto.ts if it ` +
			`belongs behind the lazy Partisia wallet seam.`
	);
}

/** Node returns a Buffer from `digest()` and a string from `digest(encoding)`. */
function digestAs(bytes: Uint8Array, encoding?: BufferEncoding) {
	const buffer = Buffer.from(bytes);

	return encoding ? buffer.toString(encoding) : buffer;
}

class Sha256Hash {
	#hash = sha256.create();

	update(data: BinaryLike, encoding?: BufferEncoding): this {
		this.#hash.update(toBytes(data, encoding));

		return this;
	}

	digest(): Buffer;
	digest(encoding: BufferEncoding): string;
	digest(encoding?: BufferEncoding): Buffer | string {
		return digestAs(this.#hash.digest(), encoding);
	}
}

class Sha256Hmac {
	#hmac: ReturnType<typeof hmac.create>;

	constructor(key: BinaryLike) {
		this.#hmac = hmac.create(sha256, toBytes(key));
	}

	update(data: BinaryLike, encoding?: BufferEncoding): this {
		this.#hmac.update(toBytes(data, encoding));

		return this;
	}

	digest(): Buffer;
	digest(encoding: BufferEncoding): string;
	digest(encoding?: BufferEncoding): Buffer | string {
		return digestAs(this.#hmac.digest(), encoding);
	}
}

export function randomBytes(size: number): Buffer {
	const bytes = new Uint8Array(size);

	// getRandomValues rejects requests over 65536 bytes, where Node's randomBytes
	// has no such limit. Filling in chunks keeps the two interchangeable instead of
	// throwing a QuotaExceededError on a large draw.
	const maxPerCall = 65536;
	for (let offset = 0; offset < size; offset += maxPerCall)
		globalThis.crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + maxPerCall, size)));

	return Buffer.from(bytes);
}

export function createHash(algorithm: string): Sha256Hash {
	// Normalised because Node accepts 'SHA256' and 'sha-256' as well.
	if (algorithm.toLowerCase().replace(/-/g, '') !== 'sha256')
		notPolyfilled(`createHash('${algorithm}')`);

	return new Sha256Hash();
}

export function createHmac(algorithm: string, key: BinaryLike): Sha256Hmac {
	if (algorithm.toLowerCase().replace(/-/g, '') !== 'sha256')
		notPolyfilled(`createHmac('${algorithm}')`);

	return new Sha256Hmac(key);
}

/**
 * Node's ECDH over elliptic, which is already in the bundle for signing.
 *
 * `getPublicKey`/`generateKeys` take Node's `(encoding, format)` pair. Only the
 * `null` encoding (meaning "give me a Buffer") is honoured, since that is how
 * ecies calls it; a real string encoding would be a silent wrong answer, so it
 * throws instead.
 */
class Secp256k1ECDH {
	#curve = new EC('secp256k1');
	#key: EC.KeyPair | undefined;

	#require(): EC.KeyPair {
		if (!this.#key) throw new Error('crypto ECDH: no key set — call generateKeys or setPrivateKey');

		return this.#key;
	}

	generateKeys(encoding?: null, format?: string): Buffer {
		this.#key = this.#curve.genKeyPair();

		return this.getPublicKey(encoding, format);
	}

	setPrivateKey(privateKey: BinaryLike): void {
		this.#key = this.#curve.keyFromPrivate(Buffer.from(toBytes(privateKey)));
	}

	getPrivateKey(encoding?: null): Buffer {
		if (encoding) notPolyfilled(`ECDH.getPrivateKey('${encoding}')`);

		return Buffer.from(this.#require().getPrivate().toArray('be', 32));
	}

	getPublicKey(encoding?: null, format?: string): Buffer {
		if (encoding) notPolyfilled(`ECDH.getPublicKey('${encoding}')`);

		const compress = format === 'compressed';

		return Buffer.from(this.#require().getPublic(compress, 'array'));
	}

	computeSecret(otherPublicKey: BinaryLike): Buffer {
		const other = this.#curve.keyFromPublic(Buffer.from(toBytes(otherPublicKey)));
		const shared = this.#require().derive(other.getPublic());

		// Node left-pads the shared secret to the curve's field size; `toArray`
		// with an explicit length does the same. Trimming would silently change
		// every derived key.
		return Buffer.from(shared.toArray('be', 32));
	}
}

export function createECDH(curveName: string): Secp256k1ECDH {
	if (curveName !== 'secp256k1') notPolyfilled(`createECDH('${curveName}')`);

	return new Secp256k1ECDH();
}

/**
 * AES, forwarded to the lazily-loaded backend. `loadWalletCrypto()` has to have
 * resolved first — Node's cipher API is synchronous, so there is nowhere to await —
 * and calling before it does throws naming the function. See lazy-crypto.ts.
 */
export function createCipheriv(
	algorithm: string,
	key: BinaryLike,
	iv: BinaryLike | null
): NodeCipher {
	return requireWalletCrypto(`crypto.createCipheriv('${algorithm}')`).ciphers.createCipheriv(
		algorithm,
		key,
		iv
	);
}

export function createDecipheriv(
	algorithm: string,
	key: BinaryLike,
	iv: BinaryLike | null
): NodeCipher {
	return requireWalletCrypto(`crypto.createDecipheriv('${algorithm}')`).ciphers.createDecipheriv(
		algorithm,
		key,
		iv
	);
}

export function pbkdf2Sync(
	password: BinaryLike,
	salt: BinaryLike,
	iterations: number,
	keylen: number,
	digest: string
): Buffer {
	return requireWalletCrypto('crypto.pbkdf2Sync').ciphers.pbkdf2Sync(
		password,
		salt,
		iterations,
		keylen,
		digest
	);
}

// The consumers are CJS compiled with esModuleInterop (`crypto_1.default.createHash`),
// so the default export is the one that actually gets used; the named exports are
// here for anything importing this the ESM way.
export default {
	createCipheriv,
	createDecipheriv,
	createECDH,
	createHash,
	createHmac,
	pbkdf2Sync,
	randomBytes
};

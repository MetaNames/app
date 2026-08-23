import { ctr, ecb } from '@noble/ciphers/aes.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { HDKey } from '@scure/bip32';
import * as scureBip39 from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { Buffer } from 'buffer';
import { toBytes, type BinaryLike } from './bytes';
import {
	registerWalletCrypto,
	type Bip32Backend,
	type Bip32Node,
	type Bip39Backend,
	type CipherBackend,
	type NodeCipher
} from './lazy-crypto';

/**
 * HD derivation and AES for the Partisia Wallet path, loaded on demand.
 *
 * Importing this module registers it as the backend the `bip39`, `bip32` and `crypto`
 * shims forward to — see lazy-crypto.ts for why the indirection exists and
 * src/lib/wallet.ts for the one caller that triggers the load.
 *
 * Nothing here is hand-rolled cryptography. The primitives come from @scure/bip39,
 * @scure/bip32 and @noble/ciphers, which are the audited successors to the bip39,
 * bip32 and browserify-aes packages this replaces; what this module adds is the
 * adapter from their APIs to the ones partisia-blockchain-applications-crypto calls.
 * The adapters are pinned against golden vectors produced by the packages they
 * replace, and the ciphers against Node's own AES, in wallet-crypto.test.ts.
 *
 * Weight, measured: 228 KB rendered / 92 KB minified, all of it in the async chunk
 * Rollup cuts for this module — which no route's initial payload imports, so none of
 * it is in SHARED. The English wordlist is only 13 KB of that. The bulk is
 * @noble/curves, which @scure/bip32 needs for secp256k1 — a curve implementation beside
 * the `elliptic` already in the shared chunk. Reusing `elliptic` would mean
 * reimplementing BIP32 on top of it, the exact hand-rolled-crypto trade this module
 * exists to avoid. A further ~60 KB is three nested copies of @noble/hashes 1.4.0;
 * see the `resolve.dedupe` comment in vite.config.ts for why they stay.
 */

const HARDENED_OFFSET = 0x80000000;

/** Only the English wordlist is bundled; the other seven are 200+ KB of dead weight. */
const DEFAULT_WORDLIST = 'english';

function notSupported(callee: string, reason: string): never {
	throw new Error(`${callee} is not supported by the app's node-compat layer: ${reason}`);
}

/**
 * bip39 v3 coerced a missing passphrase to `''` (`(str || '').normalize('NFKD')`), and
 * partisia's `mnemonicToSeed` passes `null` explicitly. @scure/bip39 interpolates the
 * argument straight into the PBKDF2 salt (`mnemonic${passphrase}`), so forwarding
 * `null` would salt with the literal string `"mnemonicnull"` and derive a different
 * seed — a wrong wallet, not an error.
 */
function normalizePassphrase(passphrase?: string | null): string {
	return passphrase ?? '';
}

const bip39: Bip39Backend = {
	entropyToMnemonic: (entropy) =>
		scureBip39.entropyToMnemonic(
			typeof entropy === 'string' ? toBytes(entropy, 'hex') : entropy,
			englishWordlist
		),

	// bip39's own default. @scure requires the strength explicitly.
	generateMnemonic: (strength = 128) => scureBip39.generateMnemonic(englishWordlist, strength),

	getDefaultWordlist: () => DEFAULT_WORDLIST,

	// bip39 returns hex here, not bytes, and partisia passes the result straight back
	// into `entropyToMnemonic`.
	mnemonicToEntropy: (mnemonic) =>
		Buffer.from(scureBip39.mnemonicToEntropy(mnemonic, englishWordlist)).toString('hex'),

	mnemonicToSeed: async (mnemonic, passphrase) =>
		Buffer.from(await scureBip39.mnemonicToSeed(mnemonic, normalizePassphrase(passphrase))),

	mnemonicToSeedSync: (mnemonic, passphrase) =>
		Buffer.from(scureBip39.mnemonicToSeedSync(mnemonic, normalizePassphrase(passphrase))),

	setDefaultWordlist: (language) => {
		if (language !== DEFAULT_WORDLIST)
			notSupported(
				`bip39.setDefaultWordlist('${language}')`,
				`only the ${DEFAULT_WORDLIST} wordlist is bundled`
			);
	},

	validateMnemonic: (mnemonic) => scureBip39.validateMnemonic(mnemonic, englishWordlist),

	wordlist: (language) => {
		if (language !== DEFAULT_WORDLIST)
			notSupported(
				`bip39.wordlists.${language}`,
				`only the ${DEFAULT_WORDLIST} wordlist is bundled`
			);

		return englishWordlist;
	}
};

/** `m`, `44'` or `0` — the segments bip32's `derivePath` accepts. */
const PATH_SEGMENT = /^(\d+)('?)$/;

/**
 * bip32's `derivePath`, which — unlike @scure/bip32's `derive` — accepts a path
 * relative to wherever the node already is. `getChildNodeByPath` in partisia's
 * `wallet.ts` calls it with one bare segment at a time.
 */
function derivePathFrom(start: Bip32Node, path: string): Bip32Node {
	let node = start;

	for (const segment of path.split('/')) {
		if (segment === 'm' || segment === 'M') {
			if (node.depth !== 0)
				throw new Error(`bip32.derivePath('${path}'): "m" is only valid on a master node`);

			continue;
		}

		const parsed = PATH_SEGMENT.exec(segment);
		if (!parsed) throw new Error(`bip32.derivePath('${path}'): invalid segment "${segment}"`);

		const index = Number(parsed[1]);
		if (!Number.isSafeInteger(index) || index >= HARDENED_OFFSET)
			throw new Error(`bip32.derivePath('${path}'): index out of range "${segment}"`);

		node = parsed[2] === "'" ? node.deriveHardened(index) : node.derive(index);
	}

	return node;
}

/**
 * bip32 v2's `BIP32Interface` over @scure/bip32's `HDKey`.
 *
 * The two differ in three ways that matter to the callers in partisia's `wallet.ts`:
 * `HDKey` returns `Uint8Array` where bip32 returned `Buffer` (and partisia calls
 * `.toString('hex')` on the result, which on a bare Uint8Array yields a comma-joined
 * list of decimal numbers rather than hex); `HDKey.derive` rejects a path that does
 * not start with `m`, where partisia feeds it single relative segments one at a time
 * from `getChildNodeByPath`; and `toBase58`/`neutered` have no equivalent.
 */
class HdNode implements Bip32Node {
	readonly #key: HDKey;

	constructor(key: HDKey) {
		this.#key = key;
	}

	get depth(): number {
		return this.#key.depth;
	}

	get privateKey(): Buffer | undefined {
		const key = this.#key.privateKey;

		return key ? Buffer.from(key) : undefined;
	}

	get publicKey(): Buffer {
		const key = this.#key.publicKey;
		if (!key) throw new Error('bip32: node has no public key');

		return Buffer.from(key);
	}

	derive(index: number): Bip32Node {
		return new HdNode(this.#key.deriveChild(index));
	}

	deriveHardened(index: number): Bip32Node {
		return this.derive(index + HARDENED_OFFSET);
	}

	derivePath(path: string): Bip32Node {
		return derivePathFrom(this, path);
	}

	neutered(): Bip32Node {
		// Round-tripping through the serialised form is what drops the private key while
		// keeping depth, index and parent fingerprint — which the xpub encodes, and which
		// `walletFromXPub` relies on to know where in the path it is.
		return new HdNode(HDKey.fromExtendedKey(this.#key.publicExtendedKey));
	}

	toBase58(): string {
		return this.#key.privateKey ? this.#key.privateExtendedKey : this.#key.publicExtendedKey;
	}
}

const bip32: Bip32Backend = {
	fromBase58: (extendedKey) => new HdNode(HDKey.fromExtendedKey(extendedKey)),
	fromSeed: (seed) => new HdNode(HDKey.fromMasterSeed(toBytes(seed)))
};

/**
 * A Node Cipher/Decipher over a one-shot @noble/ciphers transform.
 *
 * One deliberate difference from Node: `update()` buffers and returns no bytes, and
 * `final()` returns the whole result. Node's own cipher streams out whatever full
 * blocks are ready. Both callers — partisia's `ecies.ts` and `keystore.ts` — do
 * `Buffer.concat([cipher.update(data), cipher.final()])`, so the split is invisible to
 * them, and buffering is what lets the audited one-shot primitives do the work
 * (including PKCS#7 padding for ECB) instead of a hand-written block feeder here.
 */
class BufferedCipher implements NodeCipher {
	readonly #transform: (input: Uint8Array) => Uint8Array;
	readonly #callee: string;
	#chunks: Uint8Array[] = [];
	#finalised = false;

	constructor(callee: string, transform: (input: Uint8Array) => Uint8Array) {
		this.#callee = callee;
		this.#transform = transform;
	}

	update(data: BinaryLike, inputEncoding?: BufferEncoding): Buffer {
		if (this.#finalised) throw new Error(`${this.#callee}: update() called after final()`);

		this.#chunks.push(toBytes(data, inputEncoding));

		return Buffer.alloc(0);
	}

	final(): Buffer {
		if (this.#finalised) throw new Error(`${this.#callee}: final() called twice`);
		this.#finalised = true;

		const input = Buffer.concat(this.#chunks.map((chunk) => Buffer.from(chunk)));
		this.#chunks = [];

		return Buffer.from(this.#transform(input));
	}

	setAutoPadding(autoPadding = true): NodeCipher {
		if (!autoPadding)
			notSupported(
				`${this.#callee}.setAutoPadding(false)`,
				`padding is applied by @noble/ciphers and cannot be turned off here`
			);

		return this;
	}
}

/** Node validates key and IV lengths per algorithm; a silent mismatch is a wrong key. */
function checkLengths(callee: string, key: Uint8Array, iv: Uint8Array, lengths: [number, number]) {
	const [keyLength, ivLength] = lengths;

	if (key.length !== keyLength)
		throw new Error(`${callee}: key must be ${keyLength} bytes, got ${key.length}`);
	if (iv.length !== ivLength)
		throw new Error(`${callee}: iv must be ${ivLength} bytes, got ${iv.length}`);
}

/**
 * The two AES modes in the client graph:
 *
 *   aes-128-ecb  ecies.ts, with an empty IV and PKCS#7 padding — the Partisia Wallet
 *                connect/sign payload envelope.
 *   aes-256-ctr  keystore.ts, with a 16-byte counter block.
 *
 * Anything else throws naming the algorithm rather than picking a near-neighbour.
 */
function aesTransform(
	callee: string,
	algorithm: string,
	key: Uint8Array,
	iv: Uint8Array,
	direction: 'encrypt' | 'decrypt'
): (input: Uint8Array) => Uint8Array {
	switch (algorithm.toLowerCase()) {
		case 'aes-128-ecb': {
			checkLengths(callee, key, iv, [16, 0]);
			const cipher = ecb(key);

			return (input) => cipher[direction](input);
		}
		case 'aes-256-ctr': {
			checkLengths(callee, key, iv, [32, 16]);
			const cipher = ctr(key, iv);

			return (input) => cipher[direction](input);
		}
		default:
			return notSupported(
				callee,
				`only aes-128-ecb (ecies) and aes-256-ctr (keystore) are implemented`
			);
	}
}

const ciphers: CipherBackend = {
	createCipheriv: (algorithm, key, iv) => {
		const callee = `crypto.createCipheriv('${algorithm}')`;

		return new BufferedCipher(
			callee,
			aesTransform(callee, algorithm, toBytes(key), iv ? toBytes(iv) : new Uint8Array(0), 'encrypt')
		);
	},

	createDecipheriv: (algorithm, key, iv) => {
		const callee = `crypto.createDecipheriv('${algorithm}')`;

		return new BufferedCipher(
			callee,
			aesTransform(callee, algorithm, toBytes(key), iv ? toBytes(iv) : new Uint8Array(0), 'decrypt')
		);
	},

	pbkdf2Sync: (password, salt, iterations, keylen, digest) => {
		if (digest.toLowerCase().replace(/-/g, '') !== 'sha256')
			notSupported(
				`crypto.pbkdf2Sync(..., '${digest}')`,
				`only sha256 is implemented — keystore.ts is the sole caller and asks for sha256`
			);

		return Buffer.from(
			pbkdf2(sha256, toBytes(password), toBytes(salt), { c: iterations, dkLen: keylen })
		);
	}
};

registerWalletCrypto({ bip32, bip39, ciphers });

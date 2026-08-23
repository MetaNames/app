import { test, expect } from '@playwright/test';

/**
 * Proves the node-compat layer is wired up *in a browser*, against the dev server.
 *
 * The unit suites each cover one half and neither covers the join. `smoke.test.ts`
 * pins the shim's own output but runs under Node. `crypto-vectors.test.ts` pins the
 * SDK's signing output but, because Vitest externalizes dependencies, the SDK there
 * still calls Node's real `crypto`. Only in a browser do the two meet — and a wrong
 * `sha256` would produce a valid-looking signature over the wrong digest, which the
 * feature specs cannot see: they never sign anything.
 *
 * That failure mode is not hypothetical. It looks exactly like a transaction the
 * node accepts (204) and then never includes in a block, which is also what an
 * unrelated testnet stall looks like. These vectors tell the two apart.
 *
 * Vite's dev server serves any resolved module id under `/@id/`, so importing
 * through that prefix goes through the same `resolve.alias` + optimizeDeps pipeline
 * the app itself uses — including the esbuild pre-bundling step that silently
 * skipped a `resolveId` hook in an earlier attempt and externalized `crypto` into a
 * Proxy that throws only when a property is read. The specifiers are passed in as
 * data rather than written as literals so TypeScript does not try to resolve them.
 */
const MODULE_IDS = {
	crypto: '/@id/crypto',
	bip39: '/@id/bip39',
	bson: '/@id/bson',
	// App source, served by Vite at its root-relative path. These two are what make the
	// Partisia specs below an integration test rather than another dependency probe:
	// `connectPartisia` is the function the wallet menu calls.
	lazyCrypto: '/src/lib/node-compat/lazy-crypto.ts',
	appWallet: '/src/lib/wallet.ts',
	wallet: '/@id/partisia-blockchain-applications-crypto/lib/main/wallet',
	transaction: '/@id/partisia-blockchain-applications-crypto/lib/main/transaction'
};

/**
 * The two hooks the Partisia browser extension injects. `PartisiaSdk.connect()` asserts
 * both are functions, then talks to them: the first receives the connection request
 * (carrying the xpub and public key it just derived), the second returns the
 * extension's ecies-encrypted reply.
 *
 * Standing in for the extension is what lets the spec drive the real `connect()` —
 * key derivation, cipher and BSON included — with no wallet installed.
 */
interface PartisiaHookEvent {
	result: unknown;
}

interface PartisiaConfirmPayload {
	msgId: string;
	windowType: string;
	xpub: string;
}

/**
 * A typed view of the two slots rather than a `declare global` augmentation: the SDK's
 * own `sdk.d.ts` already declares both on `Window` as bare `Function`, and a second
 * declaration with real signatures collides with it.
 */
interface PartisiaExtensionWindow {
	__onPartisiaConfirmWin: (payload: PartisiaConfirmPayload, event: PartisiaHookEvent) => void;
	__onPartisiaWalletTabEvent: (tabId: number, event: PartisiaHookEvent) => void;
}

/** Same entropy and expectations as src/lib/node-compat/wallet-crypto.test.ts. */
const HD_ENTROPY = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
const HD_EXPECTED = {
	mnemonic:
		'abandon amount liar amount expire adjust cage candy arch gather drum bullet ' +
		'absurd math era live bid rhythm alien crouch range attend journey unaware',
	xprv:
		'xprv9ypR4c41kAMrmSUnPqxRP167BiJAoFKHXtESBKLiACaMKB8Z3BSa15FX7wnQ6' +
		'Wbry72MVrER1SrNb6QEsoqX8r1Qs1zq9FKqatqGXcsVrL5',
	xpub:
		'xpub6ComU7auaXv9yvZFVsVRk92qjk8fCi38u7A2yhkKiY7LByThaikpYsZzyEVVG' +
		'g2wfVg5FM1T2eQYuVXtv1VXpcXFNj9TPrxUbi83Mi92pVk',
	privateKey: 'eb6b2ab8b2f991591a538224c014aa5cbc1edfa0a8ad990be14b9533818c0a73',
	publicKey: '03edb7eff085db5272b455d3541303931dc3fc4d337c63091e04f23fce40f8971e',
	address: '0017a32d4e2f19912711e8289d596451d294705e20'
};

/** Same key and expectations as src/lib/crypto-vectors.test.ts. Keep them in step. */
const PRIVATE_KEY = 'a'.repeat(63) + '1';
const EXPECTED = {
	publicKey: '03f2dafe376020f5c6d5a6a2429eb0b646e587e7296a8a308e1db9ddfe568a2f8e',
	address: '0012cd1da9f20c1409995544167f1051ee5200be68',
	signature:
		'00da8520d9e0b32938564ace619e34153db1d83e424fedb3d39bedc4e4c9bbd922' +
		'30f1f77009455da91424141a2ffc61603f2768ed73585173179847bfb04e5825',
	digest: 'ad4fe206e7e2f5bf34c98489312e7592f72985da9eead4d9c7b8ffa8ce162661',
	trxHash: '0978816b168e4a80d28a965aa11df643be283626e4d295f1fe288561ae027dae'
};

/** sha256('hello'), the same vector smoke.test.ts pins under Node. */
const SHA256_HELLO = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';

test.describe('node-compat shims in the browser', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
	});

	test('bare "crypto" resolves to the app shim and hashes correctly', async ({ page }) => {
		const result = await page.evaluate(async (ids) => {
			const crypto = await import(ids.crypto);

			return {
				sha256: crypto.createHash('sha256').update('hello').digest('hex'),
				randomBytesLength: crypto.randomBytes(16).length
			};
		}, MODULE_IDS);

		expect(result.sha256).toBe(SHA256_HELLO);
		expect(result.randomBytesLength).toBe(16);
	});

	test('unsupported crypto calls throw naming themselves', async ({ page }) => {
		const messages = await page.evaluate(async (ids) => {
			const [crypto, bip39] = await Promise.all([import(ids.crypto), import(ids.bip39)]);

			const capture = (fn: () => unknown) => {
				try {
					fn();
				} catch (error) {
					return (error as Error).message;
				}

				return 'DID NOT THROW';
			};

			return {
				md5: capture(() => crypto.createHash('md5')),
				// Nothing on this page has loaded the HD/AES backend, so these name the
				// function and say so rather than failing somewhere inside @noble.
				pbkdf2: capture(() =>
					crypto.pbkdf2Sync(new Uint8Array(8), new Uint8Array(8), 1, 32, 'sha256')
				),
				mnemonic: capture(() => bip39.generateMnemonic())
			};
		}, MODULE_IDS);

		// A Proxy from Vite's externalization would say "Module ... has been externalized",
		// and Node's real crypto would not throw at all. Both are ruled out by the name.
		expect(messages.md5).toMatch(/crypto\.createHash\('md5'\) is not polyfilled/);
		expect(messages.pbkdf2).toMatch(/crypto\.pbkdf2Sync needs the Partisia wallet crypto backend/);
		expect(messages.mnemonic).toMatch(
			/bip39\.generateMnemonic needs the Partisia wallet crypto backend/
		);
	});

	/**
	 * The regression this file gained a Partisia section for.
	 *
	 * Stubbing `bip39`/`bip32` and the ciphers broke `PartisiaSdk.connect()` and
	 * `signMessage()` — both run `getKeyPairHD(entropyToMnemonic(seed), 0)` and then an
	 * `aes-128-ecb` ecies operation — and nothing caught it: the wallet unit test mocks
	 * the whole SDK, and `WalletConnectButton` swallows the throw into a toast. So this
	 * asserts the values, not just that a call returned.
	 */
	test('HD derivation and the ecies envelope match the packages they replace', async ({ page }) => {
		const result = await page.evaluate(
			async ({ ids, entropy }) => {
				const load = async (id: string) => {
					const namespace = await import(id);

					return namespace.default ?? namespace;
				};

				const { loadWalletCrypto } = await import(ids.lazyCrypto);
				await loadWalletCrypto();

				const wallet = await load(ids.wallet);
				const { Buffer } = globalThis;

				const mnemonic = wallet.entropyToMnemonic(entropy);
				const hd = wallet.getKeyPairHD(mnemonic, 0);

				// encryptMessage/decryptMessage are createCipheriv and createDecipheriv with
				// an empty IV: the exact pair sdk.signMessage and sdk.connect use.
				const plaintext = 'ecies through the node-compat layer';
				const envelope = wallet.encryptMessage(hd.publicKey, Buffer.from(plaintext, 'utf8'));

				return {
					mnemonic,
					xprv: hd.xprv,
					xpub: hd.xpub,
					privateKey: hd.privateKey,
					publicKey: hd.publicKey,
					address: hd.address,
					plaintext,
					decrypted: wallet.decryptMessage(hd.privateKey, envelope).toString('utf8'),
					// A tampered tag has to fail the MAC check rather than decrypt to garbage.
					tampered: await (async () => {
						const broken = Buffer.from(envelope);
						broken[broken.length - 1] ^= 0xff;

						try {
							wallet.decryptMessage(hd.privateKey, broken);
						} catch (error) {
							return (error as Error).message;
						}

						return 'DID NOT THROW';
					})()
				};
			},
			{ ids: MODULE_IDS, entropy: HD_ENTROPY }
		);

		expect(result.mnemonic).toBe(HD_EXPECTED.mnemonic);
		expect(result.xprv).toBe(HD_EXPECTED.xprv);
		expect(result.xpub).toBe(HD_EXPECTED.xpub);
		expect(result.privateKey).toBe(HD_EXPECTED.privateKey);
		expect(result.publicKey).toBe(HD_EXPECTED.publicKey);
		expect(result.address).toBe(HD_EXPECTED.address);
		expect(result.decrypted).toBe(result.plaintext);
		expect(result.tampered).toBe('Bad MAC');
	});

	test('connectPartisia completes a connect handshake against a stubbed extension', async ({
		page
	}) => {
		const result = await page.evaluate(async (ids) => {
			const load = async (id: string) => {
				const namespace = await import(id);

				return namespace.default ?? namespace;
			};

			const [{ connectPartisia, getAddress }, wallet, bson] = await Promise.all([
				import(ids.appWallet),
				load(ids.wallet),
				load(ids.bson)
			]);
			const { Buffer } = globalThis;

			const account = { address: `00${'ab'.repeat(20)}`, pub: 'stub' };
			let confirmed: PartisiaConfirmPayload | undefined;

			// The SDK polls `event.result` until it stops being `false`, so a hook that
			// throws would hang the handshake for the full test timeout. Reporting the
			// failure as a jsend error instead makes `connect()` reject with the message.
			const respond = (event: PartisiaHookEvent, produce: () => unknown) => {
				try {
					event.result = { status: 'success', data: produce() };
				} catch (error) {
					event.result = {
						status: 'error',
						message: `stub extension failed: ${(error as Error).message}`
					};
				}
			};

			const extension = window as unknown as PartisiaExtensionWindow;

			extension.__onPartisiaConfirmWin = (payload, event) => {
				confirmed = payload;
				respond(event, () => ({ tabId: 7, box: payload.msgId }));
			};

			extension.__onPartisiaWalletTabEvent = (tabId, event) =>
				respond(event, () => {
					if (!confirmed) throw new Error('the confirm hook never ran');

					// What the extension does: ecies-encrypt the account to the public key the
					// SDK just derived. connect() decrypts it with the matching private key.
					const encrypted = wallet.encryptMessage(confirmed.msgId, bson.serialize(account));

					return { tabId, payload: Buffer.from(encrypted).toString('hex') };
				});

			const sdk = await connectPartisia();

			return {
				address: await getAddress(sdk),
				seedLength: sdk.seed.length,
				windowType: confirmed?.windowType,
				xpubPrefix: confirmed?.xpub.slice(0, 4),
				msgIdLength: confirmed?.msgId.length
			};
		}, MODULE_IDS);

		// Getting an address back means connect() derived the HD keypair, ecies-decrypted
		// the reply with aes-128-ecb and passed the MAC check — the whole path the
		// committed stubs broke.
		expect(result.address).toBe(`00${'ab'.repeat(20)}`);
		expect(result.seedLength).toBe(64);
		expect(result.windowType).toBe('connection');
		expect(result.xpubPrefix).toBe('xpub');
		expect(result.msgIdLength).toBe(66);
	});

	test('the SDK produces the golden signing vectors through the shim', async ({ page }) => {
		const vectors = await page.evaluate(
			async ({ ids, privateKey }) => {
				// Both are CommonJS, so Vite's interop puts the exports on `default`
				// and mirrors them onto the namespace only when it can statically
				// detect them. Prefer `default`, fall back to the namespace.
				const load = async (id: string) => {
					const namespace = await import(id);

					return namespace.default ?? namespace;
				};

				const [wallet, transaction] = await Promise.all([load(ids.wallet), load(ids.transaction)]);
				const { Buffer } = globalThis;

				const signingDigest = Buffer.from('9'.repeat(64), 'hex');
				const signature = wallet.signTransaction(signingDigest, privateKey);
				const publicKey = wallet.privateKeyToPublicKey(privateKey);

				return {
					publicKey: publicKey.toString('hex'),
					address: wallet.privateKeyToAccountAddress(privateKey),
					signature: signature.toString('hex'),
					verified: wallet.verifySignature(signingDigest, signature, publicKey),
					digest: transaction
						.deriveDigest('Partisia Blockchain Testnet', Buffer.from('0'.repeat(64), 'hex'))
						.toString('hex'),
					trxHash: transaction.getTrxHash(
						Buffer.from('0'.repeat(64), 'hex'),
						Buffer.from('1'.repeat(130), 'hex')
					)
				};
			},
			{ ids: MODULE_IDS, privateKey: PRIVATE_KEY }
		);

		expect(vectors.publicKey).toBe(EXPECTED.publicKey);
		expect(vectors.address).toBe(EXPECTED.address);
		expect(vectors.signature).toBe(EXPECTED.signature);
		expect(vectors.verified).toBe(true);
		expect(vectors.digest).toBe(EXPECTED.digest);
		expect(vectors.trxHash).toBe(EXPECTED.trxHash);
	});
});

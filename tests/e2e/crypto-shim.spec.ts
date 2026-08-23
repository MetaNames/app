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
	wallet: '/@id/partisia-blockchain-applications-crypto/lib/main/wallet',
	transaction: '/@id/partisia-blockchain-applications-crypto/lib/main/transaction'
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

	test('unsupported crypto and keystore calls throw naming themselves', async ({ page }) => {
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
				pbkdf2: capture(() => crypto.pbkdf2Sync()),
				mnemonic: capture(() => bip39.generateMnemonic())
			};
		}, MODULE_IDS);

		// A Proxy from Vite's externalization would say "Module ... has been externalized",
		// and Node's real crypto would not throw at all. Both are ruled out by the name.
		expect(messages.md5).toMatch(/crypto\.createHash\('md5'\) is not polyfilled/);
		expect(messages.pbkdf2).toMatch(/crypto\.pbkdf2Sync is not polyfilled/);
		expect(messages.mnemonic).toMatch(/bip39\.generateMnemonic is not polyfilled/);
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

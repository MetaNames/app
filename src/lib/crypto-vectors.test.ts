import { describe, expect, it } from 'vitest';

/**
 * Golden-vector guard for the bundle-slimming work (round 3).
 *
 * Deduping `bn.js`, swapping `nodePolyfills` for a hand-rolled alias layer and
 * aliasing `tr46` all change which *implementation* backs the SDK's crypto —
 * without changing any call site. A wrong-but-not-throwing implementation would
 * produce silently invalid signatures, which no e2e spec can catch (the specs
 * never sign with a real key). These vectors pin the observable output of the
 * whole elliptic + bn.js + sha256 stack so any such swap fails loudly here.
 *
 * ECDSA here is RFC-6979 deterministic, so signatures are reproducible.
 */

const PRIVATE_KEY = 'a'.repeat(63) + '1';

async function wallet() {
	return import('partisia-blockchain-applications-crypto/lib/main/wallet');
}

describe('crypto golden vectors', () => {
	it('derives the same public key from a private key', async () => {
		const { privateKeyToPublicKey } = await wallet();

		expect(privateKeyToPublicKey(PRIVATE_KEY).toString('hex')).toBe(
			'03f2dafe376020f5c6d5a6a2429eb0b646e587e7296a8a308e1db9ddfe568a2f8e'
		);
	});

	it('derives the same account address from a private key', async () => {
		const { privateKeyToAccountAddress } = await wallet();

		expect(privateKeyToAccountAddress(PRIVATE_KEY)).toBe(
			'0012cd1da9f20c1409995544167f1051ee5200be68'
		);
	});

	it('produces a deterministic, self-verifying signature', async () => {
		const { signTransaction, verifySignature, privateKeyToPublicKey } = await wallet();
		const digest = Buffer.from('9'.repeat(64), 'hex');

		const signature = signTransaction(digest, PRIVATE_KEY);

		expect(signature.toString('hex')).toBe(
			'00da8520d9e0b32938564ace619e34153db1d83e424fedb3d39bedc4e4c9bbd922' +
				'30f1f77009455da91424141a2ffc61603f2768ed73585173179847bfb04e5825'
		);
		expect(verifySignature(digest, signature, privateKeyToPublicKey(PRIVATE_KEY))).toBe(true);
	});

	it('derives the same transaction digest', async () => {
		const { deriveDigest } =
			await import('partisia-blockchain-applications-crypto/lib/main/transaction');
		const serialized = Buffer.from('0'.repeat(64), 'hex');

		expect(deriveDigest('Partisia Blockchain Testnet', serialized).toString('hex')).toBe(
			'ad4fe206e7e2f5bf34c98489312e7592f72985da9eead4d9c7b8ffa8ce162661'
		);
	});

	it('hashes a digest and signature into the same transaction hash', async () => {
		const { getTrxHash } =
			await import('partisia-blockchain-applications-crypto/lib/main/transaction');

		expect(
			getTrxHash(Buffer.from('0'.repeat(64), 'hex'), Buffer.from('1'.repeat(130), 'hex'))
		).toBe('0978816b168e4a80d28a965aa11df643be283626e4d295f1fe288561ae027dae');
	});
});

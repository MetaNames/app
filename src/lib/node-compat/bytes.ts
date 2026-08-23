import { Buffer } from 'buffer';

/** What Node's crypto calls a `BinaryLike`. */
export type BinaryLike = Uint8Array | ArrayBufferView | string;

/**
 * Normalise a Node `BinaryLike` to bytes without copying when it already is bytes.
 *
 * Shared by `crypto.ts` and `wallet-crypto.ts` so the two sides of the lazy seam
 * cannot drift on string decoding — a mismatch there would silently change every
 * derived key rather than fail.
 */
export function toBytes(data: BinaryLike, encoding?: BufferEncoding): Uint8Array {
	if (typeof data === 'string') return new Uint8Array(Buffer.from(data, encoding ?? 'utf8'));
	if (data instanceof Uint8Array) return data;

	return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

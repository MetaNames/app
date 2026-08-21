import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runTransaction } from './transaction';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('runTransaction', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('resolves with the result when the transaction succeeds', async () => {
		const result = { transactionHash: 'hash-1', hasError: false, eventTrace: [] };
		const intent = { transactionHash: 'hash-1', fetchResult: Promise.resolve(result) };

		await expect(runTransaction(intent as never, 'Failed to register domain.')).resolves.toEqual(
			result
		);
	});

	it('throws the supplied failure message when the transaction errors', async () => {
		const result = { transactionHash: 'hash-2', hasError: true, eventTrace: [] };
		const intent = { transactionHash: 'hash-2', fetchResult: Promise.resolve(result) };

		await expect(runTransaction(intent as never, 'Failed to register domain.')).rejects.toThrow(
			'Failed to register domain.'
		);
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { alertTransactionAndFetchResult, runTransaction } from './transaction';
import { alertMessage, alertTransaction } from './stores/main';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn(), init: vi.fn() }));

describe('alertTransactionAndFetchResult', () => {
	beforeEach(() => {
		alertMessage.set(undefined);
		alertTransaction.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('announces the transaction hash and returns the result', async () => {
		const result = { transactionHash: 'hash-1', hasError: false, eventTrace: [] };
		const intent = { transactionHash: 'hash-1', fetchResult: Promise.resolve(result) };

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toEqual(result);
		expect(get(alertTransaction)).toBe('hash-1');
	});

	it('converts a rejected fetchResult into an errored result and alerts the user', async () => {
		const intent = {
			transactionHash: 'hash-2',
			fetchResult: Promise.reject(new Error('chain rejected'))
		};

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toEqual({
			transactionHash: 'hash-2',
			hasError: true,
			errorMessage: 'chain rejected',
			eventTrace: []
		});
		expect(get(alertMessage)).toBe('chain rejected');
	});

	it('falls back to a generic message when the rejection is not an Error', async () => {
		const intent = { transactionHash: 'hash-3', fetchResult: Promise.reject('nope') };

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toMatchObject({
			hasError: true,
			errorMessage: 'Something went wrong'
		});
		expect(get(alertMessage)).toBe('Something went wrong');
	});
});

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

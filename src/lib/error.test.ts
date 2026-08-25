import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

const { captureExceptionMock } = vi.hoisted(() => ({ captureExceptionMock: vi.fn() }));
vi.mock('@sentry/sveltekit', () => ({ captureException: captureExceptionMock, init: vi.fn() }));

import { InsufficientBalanceError, reportAndAlert } from './error';
import { alertMessage } from './stores/main';

describe('InsufficientBalanceError', () => {
	it('carries the coin that ran out', () => {
		expect(new InsufficientBalanceError('ETH').coin).toBe('ETH');
	});

	it('formats the message from the coin', () => {
		expect(new InsufficientBalanceError('MATIC').message).toBe('Insufficient balance for MATIC');
	});

	it('is named so it can be discriminated in a catch block', () => {
		expect(new InsufficientBalanceError('ETH').name).toBe('InsufficientBalanceError');
	});

	it('is an Error', () => {
		expect(new InsufficientBalanceError('ETH')).toBeInstanceOf(Error);
	});
});

describe('reportAndAlert', () => {
	beforeEach(() => {
		captureExceptionMock.mockClear();
		alertMessage.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('logs, reports and alerts with the given message', async () => {
		const consoleSpy = vi.spyOn(console, 'error');
		const error = new Error('boom');

		await expect(reportAndAlert(error, 'Could not load.')).resolves.toBeUndefined();

		expect(consoleSpy).toHaveBeenCalledWith(error);
		expect(captureExceptionMock).toHaveBeenCalledWith(error, undefined);
		expect(get(alertMessage)).toBe('Could not load.');
	});

	it('accepts non-Error rejections and passes them straight through', async () => {
		// A minified SDK can throw bare strings; the helper must not inspect the value.
		await expect(reportAndAlert('a bare string', 'Something went wrong')).resolves.toBeUndefined();

		expect(captureExceptionMock).toHaveBeenCalledWith('a bare string', undefined);
		expect(get(alertMessage)).toBe('Something went wrong');
	});

	it('leaves the alert untouched until called', () => {
		expect(get(alertMessage)).toBeUndefined();
		expect(captureExceptionMock).not.toHaveBeenCalled();
	});
});

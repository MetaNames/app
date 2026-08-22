import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

const { captureExceptionMock } = vi.hoisted(() => ({ captureExceptionMock: vi.fn() }));
vi.mock('@sentry/sveltekit', () => ({ captureException: captureExceptionMock }));

import { loadOrReport } from './read';
import { alertMessage } from './stores/main';

describe('loadOrReport', () => {
	beforeEach(() => {
		captureExceptionMock.mockClear();
		alertMessage.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns the resolved value and leaves the alert alone', async () => {
		await expect(loadOrReport(Promise.resolve('ok'), 'Could not load.')).resolves.toBe('ok');

		expect(get(alertMessage)).toBeUndefined();
		expect(captureExceptionMock).not.toHaveBeenCalled();
	});

	it('passes null through, because null is a real answer', async () => {
		await expect(loadOrReport(Promise.resolve(null), 'Could not load.')).resolves.toBeNull();

		expect(get(alertMessage)).toBeUndefined();
	});

	it('returns undefined, alerts and reports when the read rejects', async () => {
		const error = new Error('boom');

		await expect(loadOrReport(Promise.reject(error), 'Could not load.')).resolves.toBeUndefined();

		expect(get(alertMessage)).toBe('Could not load.');
		expect(captureExceptionMock).toHaveBeenCalledWith(error);
	});
});

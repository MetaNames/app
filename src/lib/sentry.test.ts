import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureExceptionMock, initMock } = vi.hoisted(() => ({
	captureExceptionMock: vi.fn(),
	initMock: vi.fn()
}));

vi.mock('@sentry/sveltekit', () => ({
	captureException: captureExceptionMock,
	init: initMock
}));

describe('loadSentry', () => {
	beforeEach(() => {
		vi.resetModules();
		captureExceptionMock.mockClear();
		initMock.mockClear();
	});

	it('initialises Sentry with the app config', async () => {
		const { loadSentry } = await import('./sentry');
		const { config } = await import('./config');

		await loadSentry();

		expect(initMock).toHaveBeenCalledWith({
			dsn: config.sentryDsn,
			environment: config.environment,
			tracesSampleRate: config.sentryTracesSampleRate
		});
	});

	it('initialises once even when several callers race', async () => {
		const { loadSentry } = await import('./sentry');

		await Promise.all([loadSentry(), loadSentry(), loadSentry()]);
		await loadSentry();

		expect(initMock).toHaveBeenCalledTimes(1);
	});
});

describe('reportError', () => {
	beforeEach(() => {
		vi.resetModules();
		captureExceptionMock.mockClear();
		initMock.mockClear();
	});

	it('captures the error once Sentry is up', async () => {
		const { reportError } = await import('./sentry');
		const error = new Error('boom');

		await reportError(error);

		expect(initMock).toHaveBeenCalledTimes(1);
		expect(captureExceptionMock).toHaveBeenCalledWith(error, undefined);
	});

	it('forwards the capture context', async () => {
		const { reportError } = await import('./sentry');
		const error = new Error('boom');

		await reportError(error, { extra: { wallet: 'Ledger' } });

		expect(captureExceptionMock).toHaveBeenCalledWith(error, { extra: { wallet: 'Ledger' } });
	});
});

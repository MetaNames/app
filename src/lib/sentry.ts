import { config } from '$lib/config';

// Type-only, so it costs nothing at runtime and nothing in the bundle.
type SentryModule = typeof import('@sentry/sveltekit');
type CaptureContext = Parameters<SentryModule['captureException']>[1];

let pending: Promise<SentryModule> | undefined;

/**
 * Load and initialise `@sentry/sveltekit` on first use.
 *
 * `@sentry/core` + `@sentry/browser` + their utils are ~300 KB rendered, and a static
 * `Sentry.init()` in `hooks.client.ts` pinned all of it into the chunk every route
 * loads — to serve a feature that only matters once something has already gone wrong.
 * Behind a dynamic import it moves to its own chunk instead.
 *
 * The promise is memoised, so `init` runs exactly once no matter how many callers
 * race: the idle-time warm-up in `hooks.client.ts` and a `reportError` from an early
 * failure both land on the same load. That memoisation is what keeps reports from
 * being dropped — an error raised before the idle callback fires pulls Sentry in
 * immediately rather than reporting into an uninitialised client.
 */
export function loadSentry(): Promise<SentryModule> {
	pending ??= import('@sentry/sveltekit').then((Sentry) => {
		Sentry.init({
			dsn: config.sentryDsn,
			environment: config.environment,
			tracesSampleRate: config.sentryTracesSampleRate
		});

		return Sentry;
	});

	return pending;
}

/**
 * Report an error to Sentry, loading it first if it is not up yet.
 *
 * Returns the promise so callers on an already-async error path can await it; the
 * unit tests depend on that to assert the report deterministically rather than
 * racing a floating microtask.
 */
export async function reportError(error: unknown, context?: CaptureContext): Promise<void> {
	const { captureException } = await loadSentry();

	captureException(error, context);
}

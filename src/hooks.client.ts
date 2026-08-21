import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

import { config } from '$lib/config';

Sentry.init({
	dsn: config.sentryDsn,
	environment: config.environment,
	tracesSampleRate: config.sentryTracesSampleRate
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();

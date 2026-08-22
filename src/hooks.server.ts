import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

import { config } from '$lib/config';

Sentry.init({
	dsn: config.sentryDsn,
	environment: config.environment,
	tracesSampleRate: config.sentryTracesSampleRate

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

// The app is never framed and never needs a cross-origin referrer. These three cost nothing and
// close the easiest openings. A full CSP is deliberately not attempted here: SMUI emits inline
// style attributes and Sentry/Vercel add runtime origins, and there is no gate that would catch a
// policy that silently breaks production styling.
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');

	return response;
};

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle(), securityHeaders);

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();

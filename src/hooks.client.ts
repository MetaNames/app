import { handleErrorWithSentry } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://a3030e6b43e234337425afcedb4bc727@o4506739278544896.ingest.us.sentry.io/4506739280183296',
  tracesSampleRate: 1.0,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();

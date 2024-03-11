import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://a3030e6b43e234337425afcedb4bc727@o4506739278544896.ingest.sentry.io/4506739280183296',
  tracesSampleRate: 0,
  profilesSampleRate: 0,
  integrations: [],
});

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
// export const handle = sequence(sentryHandle());

// If you have a custom error handler, pass it to `handleErrorWithSentry`
// export const handleError = handleErrorWithSentry();

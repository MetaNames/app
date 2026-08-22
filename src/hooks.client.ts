import type { HandleClientError } from '@sveltejs/kit';

import { loadSentry } from '$lib/sentry';

// Warm Sentry up once the browser is otherwise idle. Loading it eagerly put
// ~300 KB of @sentry/* on the critical path of every route; loading it never
// would mean `reportError` pays the fetch at the exact moment something is
// already broken. `loadSentry` is memoised, so whichever happens first wins.
if (typeof window !== 'undefined') {
	if (typeof requestIdleCallback === 'function') requestIdleCallback(() => void loadSentry());
	else setTimeout(() => void loadSentry(), 0);
}

export const handleError: HandleClientError = async (input) => {
	const { handleErrorWithSentry } = await loadSentry();

	// The merged entry point types this as `<T extends HandleClientError | HandleServerError>`,
	// and with no argument to infer from T widens to the union — which is not callable with a
	// client `NavigationEvent`. Naming the client half picks the right signature.
	return handleErrorWithSentry<HandleClientError>()(input);
};

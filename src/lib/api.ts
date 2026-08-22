import { reportError } from './sentry';
import type { ApiError } from './types';

export async function fetchApiJson<T>(
	url: string,
	options: RequestInit = {}
): Promise<T | ApiError> {
	let response;

	try {
		response = await fetch(url, options);
		const json = await response.json();
		if (!response.ok) {
			let message = 'Something went wrong';
			if (json && json.error) message = json.error;

			return { error: message };
		}

		return json;
	} catch (error) {
		console.error(error);

		// Only the request shape, never `options` — it can carry an auth header or a body.
		await reportError(error, {
			extra: { url, method: options.method ?? 'GET', status: response?.status }
		});

		return { error: 'Something went wrong' };
	}
}

import { captureException } from '@sentry/sveltekit';
import { alertMessage } from './stores/main';

/**
 * Await a chain read and never let a failure disappear.
 *
 * Writes go through `runTransaction`, whose rejection is surfaced by `LoadingButton`. Reads had no
 * counterpart: a rejected `find()` left the caller's spinner up forever, and — from a `setTimeout`
 * callback or a store subscription — became an unhandled rejection with no user-facing trace.
 *
 * The return type is load-bearing. `null` is a real answer from the SDK ("no such domain");
 * `undefined` means the read itself failed and the caller knows nothing either way. Callers must
 * not collapse the two — offering to register a domain because the network hiccuped is wrong.
 */
export async function loadOrReport<T>(
	read: Promise<T>,
	failureMessage: string
): Promise<T | undefined> {
	try {
		return await read;
	} catch (error) {
		console.error(error);
		captureException(error);
		alertMessage.set(failureMessage);

		return undefined;
	}
}

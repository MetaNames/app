import type { BYOCSymbol } from '@metanames/sdk';
import { alertMessage } from './stores/main';
import { reportError } from './sentry';

export class InsufficientBalanceError extends Error {
	constructor(public coin: BYOCSymbol) {
		super(`Insufficient balance for ${coin}`);
		this.name = 'InsufficientBalanceError';
	}
}

/**
 * One error path: log it, report it, tell the user.
 *
 * The sequence `console.error` → lazy `reportError` → `alertMessage.set` was repeated near-
 * identically at every failure site; this is now the single place it lives. Sentry stays behind
 * its dynamic import (`loadSentry`), so pulling this module in costs nothing up front.
 *
 * Awaits the report so callers on an already-async path can rely on side effects having happened
 * when the promise settles — the same contract `reportError` itself documents for its tests.
 *
 * Not a universal sink: sites that shape their failures differently (e.g. `fetchApiJson`, which
 * reports with request context and returns `{ error }` instead of touching the alert store) keep
 * their own paths.
 */
export async function reportAndAlert(error: unknown, fallbackMessage: string): Promise<void> {
	console.error(error);
	await reportError(error);
	alertMessage.set(fallbackMessage);
}

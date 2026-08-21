import type { ITransactionIntent, ITransactionResult } from '@metanames/sdk';
import { alertTransactionAndFetchResult } from './utils';

export async function runTransaction(
	intent: ITransactionIntent,
	failureMessage: string
): Promise<ITransactionResult> {
	const result = await alertTransactionAndFetchResult(intent);
	if (result.hasError) throw new Error(failureMessage);

	return result;
}

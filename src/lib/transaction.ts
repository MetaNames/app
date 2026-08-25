import type { ITransactionIntent, ITransactionResult } from '@metanames/sdk';
import { alertTransaction } from './stores/main';
import { reportAndAlert } from './error';

export const alertTransactionAndFetchResult = async (
	intent: ITransactionIntent
): Promise<ITransactionResult> => {
	const transactionHash = intent.transactionHash;
	alertTransaction.set(transactionHash);

	return await intent.fetchResult.catch(async (error) => {
		let message = 'Something went wrong';
		if (error && error instanceof Error) message = error.message;

		await reportAndAlert(error, message);

		return { transactionHash, hasError: true, errorMessage: message, eventTrace: [] };
	});
};

export async function runTransaction(
	intent: ITransactionIntent,
	failureMessage: string
): Promise<ITransactionResult> {
	const result = await alertTransactionAndFetchResult(intent);
	if (result.hasError) throw new Error(failureMessage);

	return result;
}

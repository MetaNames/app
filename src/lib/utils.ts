import type { ITransactionIntent, ITransactionResult } from "@metanames/sdk";
import { alertMessage, alertTransaction } from "./stores/main";

export const formatDate = (date: string | Date) => {
	if (typeof date === 'string') date = new Date(date);

	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'long' });
	const year = date.getFullYear();

	return `${day} ${month}, ${year}`;
};

export const alertTransactionAndFetchResult = async (intent: ITransactionIntent): Promise<ITransactionResult> => {
	const transactionHash = intent.transactionHash;
	alertTransaction.set(transactionHash);

	return await intent.fetchResult.catch((error) => {
		let message = 'Something went wrong';
		if (error && error instanceof Error) message = error.message;

		console.error(error);
		alertMessage.set(message);

		return { transactionHash, hasError: true, errorMessage: message, eventTrace: [] };
	})
}

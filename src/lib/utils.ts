import type { ITransactionIntent } from "@metanames/sdk";
import { alertTransaction } from "./stores";

export const formatDate = (date: Date) => {
	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'long' });
	const year = date.getFullYear();

	return `${day} ${month}, ${year}`;
};

export const alertTransactionAndFetchResult = async (intent: ITransactionIntent) => {
	alertTransaction.set(intent.transactionHash);

	return await intent.fetchResult;
}

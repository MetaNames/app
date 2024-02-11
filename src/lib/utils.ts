import type { ITransactionIntent } from "@metanames/sdk";
import { alertTransaction } from "./stores/main";

export const formatDate = (date: string | Date) => {
	if (typeof date === 'string') date = new Date(date);

	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'long' });
	const year = date.getFullYear();

	return `${day} ${month}, ${year}`;
};

export const alertTransactionAndFetchResult = async (intent: ITransactionIntent) => {
	alertTransaction.set(intent.transactionHash);

	return await intent.fetchResult;
}

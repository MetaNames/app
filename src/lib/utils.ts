import type { ITransactionIntent, ITransactionResult } from "@metanames/sdk";
import { alertMessage, alertTransaction } from "./stores/main";
import { captureException } from "@sentry/sveltekit";
import { formatDistanceToNow } from "date-fns";

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

		captureException(error);
		console.error(error);
		alertMessage.set(message);

		return { transactionHash, hasError: true, errorMessage: message, eventTrace: [] };
	})
}

export const isValidURL = (url: string) => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export const validAddress = (address: string) => {
	// Check that address contains only alphanumeric characters and is 42 characters long
	const alphanumeric = /^[a-z0-9]+$/i;
	return address.length === 42 && alphanumeric.test(address);
}

export const removeHTTPIfPresent = (url: string) => {
	if (url.startsWith('https://')) return url.slice(8);
	if (url.startsWith('http://')) return url.slice(7);
	return url;
}

export function formatDateToRelativeDate(date: string | Date) {
	let parsed: Date;
	if (typeof date === 'string') parsed = new Date(date);
	else parsed = date;

	return formatDistanceToNow(parsed, { addSuffix: true });
}

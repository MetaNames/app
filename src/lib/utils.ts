import type { ITransactionIntent, ITransactionResult } from '@metanames/sdk';
import { alertMessage, alertTransaction } from './stores/main';
import { captureException } from '@sentry/sveltekit';
import { formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date) => {
	if (typeof date === 'string') date = new Date(date);

	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'long' });
	const year = date.getFullYear();

	return `${day} ${month}, ${year}`;
};

export const alertTransactionAndFetchResult = async (
	intent: ITransactionIntent
): Promise<ITransactionResult> => {
	const transactionHash = intent.transactionHash;
	alertTransaction.set(transactionHash);

	return await intent.fetchResult.catch((error) => {
		let message = 'Something went wrong';
		if (error && error instanceof Error) message = error.message;

		captureException(error);
		console.error(error);
		alertMessage.set(message);

		return { transactionHash, hasError: true, errorMessage: message, eventTrace: [] };
	});
};

// Domain records are attacker-controlled: anyone who owns a domain can set its `Uri`
// record to whatever they like. `new URL()` happily parses `javascript:` and `data:`,
// so anything we are willing to turn into a clickable link has to be scheme-checked.
const linkableProtocols = ['http:', 'https:'];

export const isValidURL = (url: string) => {
	try {
		return linkableProtocols.includes(new URL(url).protocol);
	} catch {
		return false;
	}
};

export const validAddress = (address: string) => {
	// Check that address contains only alphanumeric characters and is 42 characters long
	const alphanumeric = /^[a-z0-9]+$/i;
	return address.length === 42 && alphanumeric.test(address);
};

export const recipientAddressErrors = (address: string) => {
	const errors: string[] = [];
	if (address.trim() === '') errors.push('Address is required');
	else if (!validAddress(address)) errors.push('Address is invalid');

	return errors;
};

export const removeHTTPIfPresent = (url: string) => {
	if (url.startsWith('https://')) return url.slice(8);
	if (url.startsWith('http://')) return url.slice(7);
	return url;
};

export function formatDateToRelativeDate(date: string | Date) {
	let parsed: Date;
	if (typeof date === 'string') parsed = new Date(date);
	else parsed = date;

	return formatDistanceToNow(parsed, { addSuffix: true });
}

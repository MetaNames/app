import { derived, writable } from 'svelte/store';
import type { AlertMessage } from '../types';

export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(
	walletAddress,
	($walletAddress) => $walletAddress !== undefined
);
export const alertMessage = writable<string | AlertMessage | undefined>();
export const alertTransaction = writable<string | undefined>();

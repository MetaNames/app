import { derived, writable } from 'svelte/store';

export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(walletAddress, ($walletAddress) => $walletAddress !== undefined);

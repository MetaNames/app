import { derived, writable } from 'svelte/store';

export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(
	walletAddress,
	($walletAddress) => $walletAddress !== undefined
);
export const alertMessage = writable<string | undefined>();
export const alertTransaction = writable<string | undefined>();

export type DomainProjection = { name: string, createdAt: string }
export const recentDomains = writable<DomainProjection[]>([])

import { derived, writable } from 'svelte/store';

export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(
	walletAddress,
	($walletAddress) => $walletAddress !== undefined
);
export const alertMessage = writable<string | undefined>();
export const alertTransaction = writable<string | undefined>();

export type DomainProjection = { name: string, createdAt: string }
const firstDomain = { name: 'name', createdAt: '2024-02-01T12:00:00' };
export const recentDomains = writable<DomainProjection[]>([firstDomain])

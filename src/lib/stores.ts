import { metaNamesSdkFactory } from '$lib';
import type { BYOCSymbol } from '@metanames/sdk';
import { derived, get, writable } from 'svelte/store';

export const metaNamesSdk = writable(metaNamesSdkFactory());
export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(
	walletAddress,
	($walletAddress) => $walletAddress !== undefined
);
export const alertMessage = writable<string | undefined>();
export const alertTransaction = writable<string | undefined>();

export const selectedCoin = writable<BYOCSymbol>(get(metaNamesSdk).config.byoc[0].symbol);

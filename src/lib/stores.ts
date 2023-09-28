import { derived, writable } from 'svelte/store';
import type { OptionalWalletClient as OptionalWalletClient } from '$lib/wallet';

import type { MetaNamesSdk } from '@metanames/sdk';

export const metaNamesSdkAuthenticated = writable<MetaNamesSdk | null>(null);
export const walletClient = writable<OptionalWalletClient>(null);
export const walletConnected = derived(walletClient, ($walletClient) => $walletClient?.isConnected ?? false);
export const walletAddress = derived(walletClient, ($walletClient) => $walletClient?.connection?.account.address);

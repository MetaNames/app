import { derived, writable } from 'svelte/store';

import type { MetaNamesSdk } from '@metanames/sdk';

export const metaNamesSdkAuthenticated = writable<MetaNamesSdk | undefined>();
export const walletAddress = writable<string | undefined>();
export const walletConnected = derived(walletAddress, ($walletAddress) => $walletAddress !== undefined);

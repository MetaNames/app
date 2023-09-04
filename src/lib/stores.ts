import { writable } from 'svelte/store';
import type { OptionalWalletClient as OptionalWalletClient } from '$lib/wallet';

export const walletClient = writable<OptionalWalletClient>(null);

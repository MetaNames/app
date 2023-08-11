import { writable } from 'svelte/store';
import type { OptionalWalletConnection } from '$lib/wallet';

export const connection = writable<OptionalWalletConnection>(null);

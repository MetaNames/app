import { config, metaNamesSdkFactory } from '$lib';
import type { BYOCSymbol } from '@metanames/sdk';
import { get, writable } from 'svelte/store';

export const metaNamesSdk = writable(metaNamesSdkFactory());

const byocs = get(metaNamesSdk).config.byoc;
// This runs at module load, and every page imports this store, so an `as BYOC` cast over a
// missing ETH entry would not fail here — it would blow up the whole app on `.symbol`.
const preferredByoc = config.environment === 'test' ? undefined : 'ETH';
const initialByoc = byocs.find((byoc) => byoc.symbol === preferredByoc) ?? byocs[0];
export const selectedCoin = writable<BYOCSymbol>(initialByoc.symbol);

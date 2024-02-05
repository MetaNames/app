import { metaNamesSdkFactory } from '$lib';
import type { BYOCSymbol } from '@metanames/sdk';
import { get, writable } from 'svelte/store';

export const metaNamesSdk = writable(metaNamesSdkFactory());
export const selectedCoin = writable<BYOCSymbol>(get(metaNamesSdk).config.byoc[0].symbol);

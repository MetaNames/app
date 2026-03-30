import { config, metaNamesSdkFactory } from '$lib';
import type { BYOC, BYOCSymbol } from '@metanames/sdk';
import { get, writable } from 'svelte/store';

export const metaNamesSdk = writable(metaNamesSdkFactory());

const byocs = get(metaNamesSdk).config.byoc;
const initialByoc =
	config.environment === 'test'
		? byocs[0].symbol
		: (byocs.find((byoc) => byoc.symbol === 'ETH') as BYOC).symbol;
export const selectedCoin = writable<BYOCSymbol>(initialByoc);

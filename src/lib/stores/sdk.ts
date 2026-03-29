import { config, metaNamesSdkFactory } from '$lib';
import type { BYOC } from '@metanames/sdk';
import { get, writable } from 'svelte/store';

export const metaNamesSdk = writable(metaNamesSdkFactory());

const byocs = get(metaNamesSdk).config.byoc;
export const initialCoin =
	config.environment === 'test'
		? byocs[0].symbol
		: (byocs.find((byoc) => byoc.symbol === 'ETH') as BYOC).symbol;

import { metaNamesSdkFactory } from "$lib/sdk";
import Cache from 'timed-cache';

export const cache = new Cache({ defaultTtl: 10 * 60 * 1000 }); // 10 minutes TTL
export const metaNamesSdk = metaNamesSdkFactory();

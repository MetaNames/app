import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private'
import { metaNamesSdkFactory } from "$lib/sdk";
import { Enviroment } from '@metanames/sdk';
import { json } from "@sveltejs/kit";
import { createClient } from '@vercel/kv';
import { MetaNamesSdk } from 'meta-names-sdk-major';

export const metaNamesSdk = metaNamesSdkFactory({ cache_ttl: 0 });

export const handleError = (fn: () => Promise<Response>) => fn().catch((error) => {
  console.error(error);

  let message = 'Cannot handle your request at the moment. Please try again later.';
  if (error instanceof Error) message = error.message;

  return json({ error: message }, { status: 400 });
})


export const keyValueStore = () => {
  if (KV_REST_API_TOKEN && KV_REST_API_URL)
    return createClient({
      url: KV_REST_API_URL,
      token: KV_REST_API_TOKEN,
    })
}

export interface DomainProjection {
  name: string
  createdAt: Date
}

export const getRecentDomains = async (count = 12): Promise<DomainProjection[]> => {
  const recentDomains = await metaNamesSdk.domainRepository.getAll()
    .then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, count)
      .map((domain) => ({ name: domain.name, createdAt: domain.createdAt })))
    .catch((error) => {
      console.error(error);
      return [];
    });

  return recentDomains
}

export interface DomainStats {
  domainCount: number
  ownerCount: number
  recentDomains: DomainProjection[]
}

export const getStats = async (): Promise<DomainStats> => {
  const domainCount = await metaNamesSdk.domainRepository.count()
  const ownerCount = await metaNamesSdk.domainRepository.getOwners().then(owners => owners.length)
  const recentDomains = await getRecentDomains()

  return {
    domainCount,
    ownerCount,
    recentDomains
  }
}

const majorBumpSdkOverride = {
  cache_ttl: 0,
  hasProxyContract: false,
  contractAddress: '02a62c953d4d6ba7ebd0d4160545373da9d142e51b'
}

export const majorBumpSdk = new MetaNamesSdk(Enviroment.mainnet, majorBumpSdkOverride)

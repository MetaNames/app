import { apiError, handleError, keyValueStore, metaNamesSdk } from '$lib/server';
import type { BYOCSymbol } from '@metanames/sdk';
import { json } from '@sveltejs/kit';
import type { DomainFeesResponse } from 'src/lib/types';

export async function GET({ params: { name, coin } }) {
  return handleError(async () => {
    const validCoins = metaNamesSdk.config.byoc.map(byoc => byoc.symbol.toString())
    if (!(validCoins.includes(coin))) return apiError('Invalid coin');

    const normalizedDomain = metaNamesSdk.domainRepository.domainValidator.normalize(name)
    let domainLength = normalizedDomain.length
    try {
      domainLength = [...new Intl.Segmenter().segment(normalizedDomain)].length
    } catch (e) {
      console.error(e)
    }

    let fees: DomainFeesResponse | null = null;
    const kv = keyValueStore();
    if (kv) fees = await kv.get<DomainFeesResponse>(`fees/${coin}/${domainLength}`);

    if (!fees) {
      const domainFees = await metaNamesSdk.domainRepository.calculateMintFees(normalizedDomain, coin as BYOCSymbol);
      fees = { ...domainFees, fees: domainFees.fees.toString() }

      if (kv) await kv.set(`fees/${coin}/${domainLength}`, fees);
    }
    return json(fees);
  });
}

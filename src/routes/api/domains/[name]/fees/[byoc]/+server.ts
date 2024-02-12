import { metaNamesSdk } from "$lib/server";
import { json } from "@sveltejs/kit";

export async function GET({ params: { name, byoc } }) {
  const byocCoin = metaNamesSdk.config.byoc.find((coin) => coin.symbol === byoc)
  if (!byocCoin)
    return json({ error: { message: 'Invalid BYOC' } }, { status: 422 })

  const fees = await metaNamesSdk.domainRepository.calculateMintFees(name, byocCoin.symbol)

  return json(fees, { headers: { 'Cache-Control': 'max-age=600' } })
}

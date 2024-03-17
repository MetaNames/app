import type { DomainStats } from "$lib/server";
import { getStats, handleError, keyValueStore } from "$lib/server";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  return handleError(async () => {
    const refresh = url.searchParams.get('refresh')

    let stats
    const kv = keyValueStore()
    if (kv && !refresh) stats = await kv.get<DomainStats>('domains/stats')
    else stats = await getStats()

    if (kv && refresh) await kv.set('domains/stats', stats)

    return json(stats, { headers: { 'Cache-Control': 'max-age=600' } });
  })
}

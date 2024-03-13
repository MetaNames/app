import { keyValueStore, type DomainProjection, getRecentDomains } from "$lib/server";

export async function GET() {
	const recentDomains: DomainProjection[] = await getRecentDomains()

	const kv = keyValueStore()
	if (kv) {
		const cachedDomains = await kv.get<DomainProjection[]>('domains/recent')

		if (recentDomains !== cachedDomains) await kv.set('domains/recent', recentDomains)
	}
}

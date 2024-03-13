import { handleError, keyValueStore, metaNamesSdk, type DomainProjection } from "$lib/server";
import { json } from '@sveltejs/kit';

export async function GET() {
	return handleError(async () => {
		const kv = keyValueStore()
		if (kv) {
			const cachedDomains = await kv.get<DomainProjection[]>('domains/recent')
			if (cachedDomains)
				return json(cachedDomains, { headers: { 'Cache-Control': 'max-age=500, public' } });
		}

		const recentDomains: DomainProjection[] = await metaNamesSdk.domainRepository.getAll()
			.then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 12)
				.map((domain) => ({ name: domain.name, createdAt: domain.createdAt })));

		if (kv) await kv.set('domains/recent', recentDomains)

		return json(recentDomains, { headers: { 'Cache-Control': 'max-age=500, public' } });
	})
}

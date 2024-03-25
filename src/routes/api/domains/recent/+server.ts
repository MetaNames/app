import { getRecentDomains, handleError, keyValueStore, type DomainProjection } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	return handleError(async () => {
		const refresh = url.searchParams.get('refresh');

		let recentDomains: DomainProjection[];
		const kv = keyValueStore();
		if (kv && !refresh)
			recentDomains = await kv
				.get<DomainProjection[]>('domains/recent')
				.then((domains) => domains || []);
		else recentDomains = await getRecentDomains();

		if (kv && refresh) await kv.set('domains/recent', recentDomains);

		return json(recentDomains, { headers: { 'Cache-Control': 'max-age=600, public' } });
	});
}

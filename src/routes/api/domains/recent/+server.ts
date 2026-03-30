import { getRecentDomains, handleError, type DomainProjection } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	return handleError(async () => {
		const recentDomains = await getRecentDomains();

		return json(recentDomains, { headers: { 'Cache-Control': 'max-age=600, public' } });
	});
}

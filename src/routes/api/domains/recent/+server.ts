import { getRecentDomains, handleError } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET() {
	return handleError(async () => {
		const recentDomains = await getRecentDomains();

		return json(recentDomains, { headers: { 'Cache-Control': 'max-age=600, public' } });
	});
}

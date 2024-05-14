import { getStats, handleError } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	return handleError(async () => {
		const stats = await getStats();

		return json(stats, { headers: { 'Cache-Control': 'max-age=600' } });
	});
}

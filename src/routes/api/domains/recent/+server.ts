import { handleError, metaNamesSdk } from "$lib/server";
import { json } from '@sveltejs/kit';

export async function GET() {
	return handleError(async () => {
		const recentDomains = await metaNamesSdk.domainRepository.getAll()
			.then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8)
				.map((domain) => ({ name: domain.name, createdAt: domain.createdAt })));

		return json(recentDomains, { headers: { 'Cache-Control': 'max-age=500, public' } });
	})
}

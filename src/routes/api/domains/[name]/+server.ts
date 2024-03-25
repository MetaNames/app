import { handleError, metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ params: { name } }) {
	return handleError(async () => {
		const domain = await metaNamesSdk.domainRepository.find(name);

		return json({ domain: domain?.toJSON() });
	});
}

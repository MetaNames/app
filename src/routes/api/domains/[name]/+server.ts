import { handleError, metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ params }: { params: { name: string } }) {
	const { name } = params;
	return handleError(async () => {
		const domain = await metaNamesSdk.domainRepository.find(name);

		return json({ domain: domain?.toJSON() });
	});
}

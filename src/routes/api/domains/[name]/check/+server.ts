import { handleError, metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function GET({ params: { name } }) {
	return handleError(async () => {
		const analyzedDomain = metaNamesSdk.domainRepository.analyze(name);
		const domain = await metaNamesSdk.domainRepository.find(name);
		const parentDomainName = analyzedDomain.parentId;
		const tld = analyzedDomain.tld;

		let parentDomain = null;
		if (!domain && parentDomainName && parentDomainName !== tld)
			parentDomain = await metaNamesSdk.domainRepository.find(parentDomainName);

		const data = {
			domainPresent: !!domain,
			parentPresent: !!parentDomain
		};

		return json(data);
	});
}

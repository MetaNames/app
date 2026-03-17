import { handleError, metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';
import { config } from 'src/lib';

export async function GET({ params }: { params: { name: string } }) {
	const { name } = params;
	return handleError(async () => {
		console.log('[check] Environment:', config.environment);
		console.log('[check] Looking up domain:', name);
		
		const analyzedDomain = metaNamesSdk.domainRepository.analyze(name);
		console.log('[check] Analyzed:', analyzedDomain);
		
		const domain = await metaNamesSdk.domainRepository.find(name);
		console.log('[check] Found domain:', domain);
		
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

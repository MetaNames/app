import { metaNamesSdk } from "$lib/server";
import { json } from "@sveltejs/kit";

export async function GET({ params: { name } }) {
  const analyzedDomain = metaNamesSdk.domainRepository.analyze(name);
  const domain = await metaNamesSdk.domainRepository.find(name, { cache: false });
  const parentDomainName = analyzedDomain.parentId;
  const tld = analyzedDomain.tld

  let parentDomain = null;
  if (!domain && parentDomainName && parentDomainName !== tld)
    parentDomain = await metaNamesSdk.domainRepository.find(parentDomainName, { cache: false });

  const data = {
    domainPresent: !!domain,
    parentPresent: !!parentDomain
  };

  return json(data);
}

import { metaNamesSdkFactory } from "$lib";

export async function load({ params: { name } }) {
  const metaNamesSdk = metaNamesSdkFactory();

  const analyzedDomain = metaNamesSdk.domainRepository.analyze(name);
  const domain = await metaNamesSdk.domainRepository.find(name);
  const parentDomainName = analyzedDomain.parentId;
  const tld = analyzedDomain.tld

  let parentDomain = null;
  if (!domain && parentDomainName && parentDomainName !== tld)
    parentDomain = await metaNamesSdk.domainRepository.find(parentDomainName);

  const data = {
    domainPresent: !!domain,
    parentPresent: !!parentDomain,
    domainName: analyzedDomain.name,
    parentDomainName,
    tld,
  }

  return data
}

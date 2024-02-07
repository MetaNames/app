import { metaNamesSdkFactory } from "$lib";

export async function load({ params: { name } }) {
  const metaNamesSdk = metaNamesSdkFactory();
  const domain = await metaNamesSdk.domainRepository.find(name);

  return { domain }
}

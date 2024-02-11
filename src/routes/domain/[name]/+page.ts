import { metaNamesSdkFactory } from 'src/lib/sdk.js'

export async function load({ params: { name } }) {
  const metaNamesSdk = metaNamesSdkFactory()
  const domain = await metaNamesSdk.domainRepository.find(name)

  return { domain: domain?.toJSON() }
}

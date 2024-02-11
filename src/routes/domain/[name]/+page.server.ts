import { metaNamesSdk } from 'src/lib/server'

export async function load({ params: { name } }) {
  const domain = await metaNamesSdk.domainRepository.find(name)

  return { domain: domain?.toJSON() }
}

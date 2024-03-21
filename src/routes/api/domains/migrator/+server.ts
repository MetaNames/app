import { json } from "@sveltejs/kit";
import { majorBumpSdk, metaNamesSdk } from "src/lib/server";
import { ADMIN_WALLET_PRIVATE_KEY } from "$env/static/private";
import type { IActionDomainMint } from "@metanames/sdk";
import { config as appConfig } from "src/lib";

export const config = { runtime: 'nodejs20.x' };
export async function GET() {
  if (appConfig.sdkEnvironment !== 'mainnet') return json({ error: 'This endpoint is only available on mainnet' }, { status: 400 });

  const [oldDomains, newDomains] = await Promise.all([
    metaNamesSdk.domainRepository.getAll(),
    majorBumpSdk.domainRepository.getAll()
  ]);

  const domainsToMigrate = oldDomains.filter((oldDomain) => !newDomains.some((newDomain) => newDomain.name === oldDomain.name));

  const slice = domainsToMigrate.slice(0, 50);

  majorBumpSdk.setSigningStrategy('privateKey', ADMIN_WALLET_PRIVATE_KEY)

  const params: IActionDomainMint[] = slice.map((domain) => ({
    byocSymbol: 'ETH',
    domain: domain.name,
    to: domain.owner,
    tokenUri: domain.name,
    parentDomain: domain.parentId,
    subscriptionYears: 1
  }))

  const { transactionHash, fetchResult } = await majorBumpSdk.domainRepository.registerBatch(params)

  majorBumpSdk.resetSigningStrategy()

  return json({
    transactionHash,
    slice
  })
}

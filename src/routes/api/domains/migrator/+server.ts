import { ADMIN_WALLET_PRIVATE_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { RecordClassEnum, RecordRepository } from "meta-names-sdk-major";
import { config as appConfig } from "src/lib";
import { majorBumpSdk, metaNamesSdk } from "src/lib/server";

export const config = { runtime: 'nodejs20.x' };
export async function GET() {
  if (appConfig.sdkEnvironment !== 'mainnet') return json({ error: 'This endpoint is only available on mainnet' }, { status: 400 });

  const [oldDomains, newDomains] = await Promise.all([
    metaNamesSdk.domainRepository.getAll(),
    majorBumpSdk.domainRepository.getAll()
  ]);

  const recordsToMigrate = oldDomains.flatMap((oldDomain) => {
    const newDomain = newDomains.find((newDomain) => newDomain.nameWithoutTLD === oldDomain.nameWithoutTLD);

    if (!newDomain) return

    const res = Object.entries(oldDomain.records).filter(([key, value]) => {
      const buffer = Buffer.from(value)
      if (buffer.length > 63 || buffer.length === 0) return

      return !Object.keys(newDomain.records).includes(key)
    }).map(([key, value]) => {
      return {
        class: RecordClassEnum[key as keyof typeof RecordClassEnum],
        domain: oldDomain.nameWithoutTLD,
        data: value
      }
    }).filter((record) => record);

    return res
  }).filter((record) => record) as ({
    class: RecordClassEnum;
    domain: string;
    data: string | Buffer;
  })[]

  majorBumpSdk.setSigningStrategy('privateKey', ADMIN_WALLET_PRIVATE_KEY)

  let index = 0
  const chunk = 40
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  while (index < recordsToMigrate.length) {
    const [start, end] = [index, index + chunk];

    const slice = recordsToMigrate.slice(start, end);

    const recordRepository = new RecordRepository(majorBumpSdk.contract, oldDomains[0]);

    try {
      const { transactionHash, fetchResult } = await recordRepository.createBatch(slice);
      await fetchResult
      console.log(`Minting records for hash ${transactionHash}`);
    } catch (e) {
      console.error(e)
    }

    index += chunk
  }

  majorBumpSdk.resetSigningStrategy()

  return json({})
}

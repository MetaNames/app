import { metaNamesSdk } from "$lib/server";
import { json } from "@sveltejs/kit";

export async function GET({ params: { name } }) {
  const domain = await metaNamesSdk.domainRepository.find(name)

  return json({ domain: domain?.toJSON() })
}

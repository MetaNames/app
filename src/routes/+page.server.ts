import { metaNamesSdk } from "$lib/server";

export async function load() {
  const recentDomains = await metaNamesSdk.domainRepository.getAll()
    .then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8)
      .map((domain) => ({ name: domain.name, createdAt: domain.createdAt })));

  return {
    stats: {
      recentDomains
    }
  };
}

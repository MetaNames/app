import { cache, metaNamesSdk } from "$lib/server";

export async function load() {
  let stats = cache.get("stats");
  if (stats) return stats;

  const recentDomains = await metaNamesSdk.domainRepository.getAll()
    .then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8)
      .map((domain) => ({ name: domain.name, createdAt: domain.createdAt })));

  stats = {
    stats: {
      recentDomains
    }
  };
  cache.put("stats", stats);

  return stats;
}

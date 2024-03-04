import { getRecentDomains } from "src/lib";

export async function load() {
  return {
    domains: {
      recent: getRecentDomains(10).catch(() => [])
    }
  }
}

import { buildCatalog } from "@penta/catalog";
import { flywheelCounts, SITES, winnerSignal, type SiteId } from "@penta/monetization";
import { contractManifest, ENGINE_ROUTES } from "@penta/platform-api";
import { readStore } from "@/lib/platform-store";

export function monetizationReadiness() {
  const catalog = buildCatalog();
  const store = readStore();
  const winners = SITES.map((site) => {
    const pages = [...catalog.pages.values()].filter((page) => page.site === site);
    const indexable = pages.filter((page) => page.index_state === "INDEXABLE").length;
    const verified = pages.reduce((sum, page) => sum + (Number(page.structured_payload.verified_fact_count) || 0), 0);
    return winnerSignal({
      site,
      indexablePages: indexable,
      engineApis: 1,
      verifiedFacts: verified,
      localEvents: store.events.filter((row) => row.site === site).length,
      localLeads: store.leads.filter((row) => row.site === site).length,
    });
  }).sort((a, b) => b.score - a.score);

  return {
    publicSiteLive: process.env.PUBLIC_SITE_LIVE === "true",
    hosted: "local_only",
    billing: null,
    partners: [],
    rateCard: null,
    contract: contractManifest(),
    engines: ENGINE_ROUTES,
    flywheel: SITES.map((site: SiteId) => flywheelCounts(site, store.events, store.leads, store.observations)),
    winners,
    winnerClaim: "internal_opportunity_only" as const,
    note: "Winner ranking uses in-repo catalog counts plus locally stored events. It is not revenue, market share, or an indexation input.",
  };
}

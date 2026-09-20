import { buildCatalog } from "@penta/catalog";
import { flywheelCounts, SITES, winnerSignal, type SiteId } from "@penta/monetization";
import { contractManifest, ENGINE_ROUTES } from "@penta/platform-api";
import { postgresReady } from "@penta/platform-data";
import { repo } from "@/lib/platform-store";

export async function monetizationReadiness() {
  const catalog = buildCatalog();
  const store = repo();
  await store.bootstrapLocalDev();
  const events = await store.listEvents();
  const leads = await store.listLeads();
  const observations = await store.listObservations();
  const winners = SITES.map((site) => {
    const pages = [...catalog.pages.values()].filter((page) => page.site === site);
    const indexable = pages.filter((page) => page.index_state === "INDEXABLE").length;
    const verified = pages.reduce((sum, page) => sum + (Number(page.structured_payload.verified_fact_count) || 0), 0);
    return winnerSignal({
      site,
      indexablePages: indexable,
      engineApis: 1,
      verifiedFacts: verified,
      localEvents: events.filter((row) => row.site === site).length,
      localLeads: leads.filter((row) => row.site === site).length,
    });
  }).sort((a, b) => b.score - a.score);

  return {
    publicSiteLive: process.env.PUBLIC_SITE_LIVE === "true",
    hosted: postgresReady() ? "postgres" : "dev_fallback",
    billing: null,
    partners: await store.listPartners(),
    rateCard: null,
    contract: contractManifest(),
    engines: ENGINE_ROUTES,
    flywheel: SITES.map((site: SiteId) =>
      flywheelCounts(
        site,
        events.map((row) => ({
          id: row.id,
          name: row.name as never,
          site: row.site as SiteId,
          properties: {},
          at: row.at,
        })),
        leads.map((row) => ({
          id: row.id,
          site: row.site,
          kind: row.kind as never,
          state: "STORED_LOCAL" as const,
          message: row.message,
          contact: row.contact,
          assignedPartnerId: null,
          createdAt: row.createdAt,
        })),
        observations.map((row) => ({
          id: row.id,
          site: row.site,
          kind: row.kind as never,
          value: row.value,
          sourceType: row.sourceType as never,
          createdAt: row.createdAt,
        })),
      ),
    ),
    winners,
    winnerClaim: "internal_opportunity_only" as const,
    observations: observations.length,
    note: "Winner ranking uses in-repo catalog counts plus stored events. It is not revenue or an indexation input.",
  };
}

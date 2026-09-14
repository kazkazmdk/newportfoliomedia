import { buildCatalog, programmaticSeoIssues, sitemapConsistencyIssues } from "@penta/catalog";
import { shouldIndexPage, globalNoindex } from "@penta/publishing-core";
import { validateFactProvenance } from "@penta/data-provenance";
import { classifyEdgeKind } from "@penta/graph-core";

const store = buildCatalog();
const issues: string[] = [];

if (process.env.PUBLIC_SITE_LIVE === "true") {
  issues.push("PUBLIC_SITE_LIVE must stay false in this pass");
}
if (!globalNoindex()) issues.push("global noindex should be on");

const live = [...store.pages.values()].filter(shouldIndexPage);
if (live.length) issues.push(`public sitemap would include ${live.length} pages while prelaunch`);

for (const page of store.pages.values()) {
  if (page.index_state === "INDEXABLE" && page.noindex) {
    issues.push(`${page.url} INDEXABLE but noindex`);
  }
  if (page.index_state !== "INDEXABLE" && shouldIndexPage(page)) {
    issues.push(`${page.url} ${page.index_state} leaked into sitemap`);
  }
}

for (const rel of store.relations.values()) {
  const rec = rel.provenance[0];
  if (!rec) continue;
  const v = validateFactProvenance({
    source_type: rec.source_type,
    source_url: rec.source_url,
    inferred: rel.inferred || rec.source_type === "AI_INFERRED",
  });
  if (rec.source_type === "AI_INFERRED" && v.verified_primary) {
    issues.push(`${rel.id} AI_INFERRED marked verified_primary`);
  }
  const kind = classifyEdgeKind(rel);
  if (rel.type === "USER_TRIP_OUTFIT" || rel.type === "PERSONALIZED_PACK" || rel.type === "USER_ROUTE_QUOTE") {
    if (kind === "SOURCE_TRUTH") issues.push(`${rel.id} personalized classified as source truth`);
  }
  if ((rel.inferred || rel.estimated) && kind === "SOURCE_TRUTH" && rel.edge_kind !== "SOURCE_TRUTH") {
    issues.push(`${rel.id} inferred/estimated classified as source truth`);
  }
}

const seo = programmaticSeoIssues();
issues.push(...seo);
const sitemap = sitemapConsistencyIssues();
issues.push(...sitemap.issues);

if (issues.length) {
  console.error("TRUTH GATE FAILED");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

const stats = store.stats();
console.log(
  JSON.stringify(
    {
      ok: true,
      entities: stats.entities,
      relations: stats.relations,
      source_truth_edges: stats.source_truth_edges,
      derived_rule_edges: stats.derived_rule_edges,
      personalized_decision_edges: stats.personalized_decision_edges,
      INDEXABLE: stats.indexable,
      SEO_CANDIDATE: stats.seo_candidate,
      GRAPH_ONLY: stats.graph_only,
      public_sitemap: live.length,
    },
    null,
    2,
  ),
);

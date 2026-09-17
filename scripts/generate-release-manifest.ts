import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyAutoQaSample,
  buildCatalog,
  DATA_VERSION,
  GRAPH_VERSION,
  monitorCohorts,
  qaReviewQueue,
  releaseCandidates,
  resetCatalogCache,
  scaleReport,
} from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";

resetCatalogCache();
const store = buildCatalog();
const report = scaleReport(store);
const candidates = releaseCandidates(store);
const sample = applyAutoQaSample(store);
const review = qaReviewQueue(store);
const cohorts = monitorCohorts(store);

mkdirSync(resolve("ops"), { recursive: true });
writeFileSync(
  resolve("ops/release-candidates.json"),
  `${JSON.stringify(
    {
      generated_at: "graph-derived",
      data_version: DATA_VERSION,
      graph_version: GRAPH_VERSION,
      public_site_live: process.env.PUBLIC_SITE_LIVE === "true",
      global_noindex: globalNoindex(),
      note: "PUBLISHABLE is a quality-layer release candidate. INDEXABLE still requires a demand path. Sitemap stays empty while PUBLIC_SITE_LIVE=false.",
      target_publishable: 2500,
      scale: report,
      candidates,
    },
    null,
    2,
  )}\n`,
);

const demandRows = [
  "URL,query,intent,tier,product,quality,sourceCoverage",
  ...candidates.map((row) => {
    const query = row.url.replace(/^\//, "").replaceAll("/", " ");
    return [
      row.url,
      JSON.stringify(query),
      row.intent,
      row.catalogTier ?? "",
      row.product,
      row.quality,
      row.realSourceCoverage,
    ].join(",");
  }),
];
writeFileSync(resolve("ops/DEMAND_VALIDATION_2500.csv"), `${demandRows.join("\n")}\n`);

const rows = Object.values(report.byProduct);
const table = [
  "| Product | Generated | Publishable | Tier A | Tier B | Tier C | Noindex | Blocked | Limited | Real source coverage |",
  "| ------- | --------: | ----------: | -----: | -----: | -----: | ------: | ------: | ------: | -------------------: |",
  ...rows.map(
    (row) =>
      `| ${row.product} | ${row.generated} | ${row.publishable} | ${row.tierA} | ${row.tierB} | ${row.tierC} | ${row.noindex} | ${row.blocked} | ${row.limited} | ${row.realSourceCoverage} |`,
  ),
  `| **total** | **${report.generated}** | **${report.publishable}** | **${rows.reduce((s, r) => s + r.tierA, 0)}** | **${rows.reduce((s, r) => s + r.tierB, 0)}** | **${rows.reduce((s, r) => s + r.tierC, 0)}** | **${report.noindex}** | **${report.blocked}** | **${report.limited}** | |`,
].join("\n");

const bandLines = Object.entries(report.qualityBands)
  .map(([band, count]) => `- \`${band}\`: ${count}`)
  .join("\n");

const perProduct = rows
  .map((row) => {
    const bands = Object.entries(row.qualityBands)
      .map(([band, count]) => `${band}=${count}`)
      .join(", ");
    return `### ${row.product}

- total entities: ${row.entities}
- total relations: ${row.relations}
- sources: ${row.sources}
- real source coverage: ${row.realSourceCoverage}
- candidate URLs (SEO_CANDIDATE + INDEXABLE): ${row.candidateUrls}
- publishable URLs (quality-layer): ${row.publishable}
- Tier A: ${row.tierA}
- Tier B: ${row.tierB}
- Tier C: ${row.tierC}
- noindex: ${row.noindex}
- blocked: ${row.blocked}
- limited: ${row.limited}
- duplicate clusters removed: ${row.duplicateClustersRemoved}
- quality bands: ${bands}
`;
  })
  .join("\n");

writeFileSync(
  resolve("docs/PUBLISHABLE_SURFACE.md"),
  `# Publishable surface

The count is an **output of the data graph**. It is not a quota.

- A high soft score cannot bypass a hard gate.
- \`PUBLISHABLE\` here means: unique decision, hard gates passed, ready as a release candidate.
- \`INDEXABLE\` still requires a real demand path (autocomplete + SERP intent, or equivalent). Editorial demand never indexes.
- \`PUBLIC_SITE_LIVE=false\` keeps the kill switch: global noindex, empty \`/sitemap.xml\`.
- Segmented sitemaps exist at \`/sitemaps/{product}-{a|b|c}.xml\` and stay empty until a page is both live-indexable and PUBLISHABLE.
- lastmod is the latest entity / relation / source / decision update. Never \`new Date()\` per build.
- data_version: \`${DATA_VERSION}\`
- graph_version: \`${GRAPH_VERSION}\`

${table}

## Quality bands (all generated URLs)

${bandLines}

## Per product

${perProduct}

## Targets vs graph output

Indicative first-release ranges (not obligations): FixCode 800–1500+, AutoSpec 800–1500+, ChargeMatch 500–1000+, WearThere 500–1000+, TripCost 500–1000+.

If the graph produces fewer honest pages, we keep fewer. If it produces more that pass gates, we do not cut them.

## Monitoring cohorts

${cohorts
  .slice(0, 40)
  .map((c) => `- ${c.product} / Tier ${c.tier} / ${c.intentType} / ${c.qualityBand} / ${c.entityType} — ${c.publishable} publishable / ${c.urls} generated`)
  .join("\n")}

## GSC import readiness

Join later on \`url\` with clicks, impressions, CTR, position, indexing status.
See \`joinGscToReleaseManifest\` in \`@penta/demand\`. No live GSC access is required for this pass.
`,
);

const qaLines = sample.map((row) => {
  return `| ${row.product} | ${row.catalogTier ?? "—"} | ${row.family} | ${row.qualityBand} | ${row.publishState} | ${row.qaStatus ?? "NOT_REVIEWED"} | ${row.quality} | \`${row.url}\` |`;
});

writeFileSync(
  resolve("docs/PROGRAMMATIC_RELEASE_QA.md"),
  `# Programmatic release QA sample

This is an **automated review queue**, not a completed human QA pass.

Statuses:

- \`NOT_REVIEWED\` — no human review, automated checks incomplete or not run
- \`AUTO_VERIFIED\` — structural automated checks passed (canonical, robots state, decision surface, links, fingerprint, evidence/modelled label)
- \`MANUAL_PASS\` / \`MANUAL_FAIL\` — human only; this generator never writes them

No human has reviewed these URLs. Do not read this file as “100 URLs manually approved.”

Sample size: ${sample.length} URLs (target 10 Tier A + 8 B + 4 C + 3 rejected per product). Review queue size: ${review.length}.

## Automated checks (AUTO_VERIFIED)

- canonical self, or explicit redirect target
- noindex matches index_state
- main decision fields present
- internal link / hub / multi-entity
- decision fingerprint present
- evidence block or declared MODELLED assumptions

HTTP 200, structured-data parse, and mobile overflow need a running server and stay unchecked here.

## Sample

| Product | Tier | Template | Quality | State | QA | Score | URL |
| ------- | ---- | -------- | ------- | ----- | -- | ----: | --- |
${qaLines.join("\n")}

## How this sample was picked

Stratified over product and catalog tier (10 A / 8 B / 4 C / 3 rejected). It is not a claim that a human reviewed the set.
`,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      data_version: DATA_VERSION,
      graph_version: GRAPH_VERSION,
      generated: report.generated,
      publishable: report.publishable,
      indexable: [...store.pages.values()].filter((p) => p.index_state === "INDEXABLE").length,
      public_site_live: process.env.PUBLIC_SITE_LIVE === "true",
      qa_sample: sample.length,
      qa_statuses: {
        NOT_REVIEWED: sample.filter((r) => r.qaStatus === "NOT_REVIEWED").length,
        AUTO_VERIFIED: sample.filter((r) => r.qaStatus === "AUTO_VERIFIED").length,
        MANUAL_PASS: sample.filter((r) => r.qaStatus === "MANUAL_PASS").length,
        MANUAL_FAIL: sample.filter((r) => r.qaStatus === "MANUAL_FAIL").length,
      },
      candidates: candidates.length,
    },
    null,
    2,
  ),
);

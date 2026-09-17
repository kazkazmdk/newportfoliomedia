import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildCatalog,
  monitorCohorts,
  qaSample,
  releaseCandidates,
  resetCatalogCache,
  scaleReport,
} from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";

resetCatalogCache();
const store = buildCatalog();
const report = scaleReport(store);
const candidates = releaseCandidates(store);
const sample = qaSample(store, 20);
const cohorts = monitorCohorts(store);

mkdirSync(resolve("ops"), { recursive: true });
writeFileSync(
  resolve("ops/release-candidates.json"),
  `${JSON.stringify(
    {
      generated_at: "graph-derived",
      public_site_live: process.env.PUBLIC_SITE_LIVE === "true",
      global_noindex: globalNoindex(),
      note: "PUBLISHABLE is a quality-layer release candidate. INDEXABLE still requires a demand path. Sitemap stays empty while PUBLIC_SITE_LIVE=false.",
      scale: report,
      candidates,
    },
    null,
    2,
  )}\n`,
);

const rows = Object.values(report.byProduct);
const table = [
  "| Product | Generated | Publishable | Tier A | Tier B | Tier C | Noindex | Blocked | Limited |",
  "| ------- | --------: | ----------: | -----: | -----: | -----: | ------: | ------: | ------: |",
  ...rows.map(
    (row) =>
      `| ${row.product} | ${row.generated} | ${row.publishable} | ${row.tierA} | ${row.tierB} | ${row.tierC} | ${row.noindex} | ${row.blocked} | ${row.limited} |`,
  ),
  `| **total** | **${report.generated}** | **${report.publishable}** | **${rows.reduce((s, r) => s + r.tierA, 0)}** | **${rows.reduce((s, r) => s + r.tierB, 0)}** | **${rows.reduce((s, r) => s + r.tierC, 0)}** | **${report.noindex}** | **${report.blocked}** | **${report.limited}** |`,
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
  return `| ${row.product} | ${row.catalogTier ?? "—"} | ${row.family} | ${row.qualityBand} | ${row.publishState} | ${row.quality} | \`${row.url}\` |`;
});

writeFileSync(
  resolve("docs/PROGRAMMATIC_RELEASE_QA.md"),
  `# Programmatic release QA sample

This is a **manual QA sample**, not the SEO rollout cap.

After the sample is reviewed, every other URL that passes the same gates stays in the release candidate set.

Sample size: ${sample.length} URLs (~20 per product, stratified by tier / template / quality band / publish state).

## Checklist per URL

- page useful as a decision surface (not a generic article)
- result unique vs siblings
- visual quality / mobile
- evidence and assumptions visible
- internal links present
- structured data / main entity present
- canonical stable and self
- no 404 / 500
- no canonical toward a noindex page

## Sample

| Product | Tier | Template | Quality | State | Score | URL |
| ------- | ---- | -------- | ------- | ----- | ----: | --- |
${qaLines.join("\n")}

## How this sample was picked

Stratified over product, catalog tier (A/B/C), page family, quality band, and publish state. It is not the top-100 by score and it is not a 50-page launch ceiling.
`,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      generated: report.generated,
      publishable: report.publishable,
      indexable: [...store.pages.values()].filter((p) => p.index_state === "INDEXABLE").length,
      public_site_live: process.env.PUBLIC_SITE_LIVE === "true",
      qa_sample: sample.length,
      candidates: candidates.length,
    },
    null,
    2,
  ),
);

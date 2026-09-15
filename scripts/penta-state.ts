import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog, catalogScaleStops, datasetCoverage, loadDemandEvidence, resetCatalogCache, resetDemandCache } from "@penta/catalog";
import { ALL_ERRORS } from "@penta/fixcode";
import { destinationSurfaces, DESTINATIONS } from "@penta/wearthere";
import { validateFactProvenance } from "@penta/data-provenance";
import { VEHICLES, fitmentScopeOf } from "@penta/autospec";
import { CHARGERS, DEVICES } from "@penta/chargematch";
import { ROUTES, routeCosts } from "@penta/tripcost";

resetCatalogCache();
resetDemandCache();
const store = buildCatalog();
const pages = [...store.pages.values()];
const demandLoaded = loadDemandEvidence();
const realDemand = demandLoaded.evidence.filter((e) => e.observed && e.source !== "EDITORIAL");
const validatedDemand = pages.filter((p) => p.seo_validation === "PRELAUNCH" || p.seo_validation === "POSTLAUNCH").length;
const sha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const generatedAt = new Date().toISOString();

const levels = [
  "PRIMARY_EXACT",
  "REGULATORY_EXACT",
  "TRUSTED_DATASET_EXACT",
  "PRIMARY_GENERAL",
  "DATASET_GENERAL",
  "UNVERIFIED_DATASET",
  "PRIMARY_DATABASE_GENERAL",
  "TRUSTED_THIRD_PARTY",
  "CROSS_SOURCE_CONFIRMED",
  "DERIVED_HEURISTIC",
  "EDITORIAL",
  "UNKNOWN",
] as const;

const factLevels = [...store.entities.values()].flatMap((e) =>
  e.provenance.map((p) =>
    validateFactProvenance({
      source_type: p.source_type,
      source_url: p.source_url,
      source_name: p.source_name,
      retrieved_at: p.retrieved_at,
      verified_at: p.verified_at,
      verification_method: p.verification_method,
      locator: p.locator,
    }),
  ),
);

function countLevel(level: string) {
  return factLevels.filter((f) => f.level === level).length;
}

const bySite = (site: string) => pages.filter((p) => p.site === site);
const seo = (site: string) => bySite(site).filter((p) => p.index_state === "SEO_CANDIDATE").length;
const indexable = (site: string) => bySite(site).filter((p) => p.index_state === "INDEXABLE").length;
const review = (site: string) => bySite(site).filter((p) => p.index_state === "REVIEW_REQUIRED").length;

const exactFixcode = ALL_ERRORS.filter((e) =>
  e.provenance.some((p) => {
    const v = validateFactProvenance({
      source_type: p.source_type,
      source_url: p.source_url,
      source_name: p.source_name,
      retrieved_at: p.retrieved_at,
      verified_at: p.verified_at,
      verification_method: p.verification_method,
      locator: p.locator,
    });
    return v.level === "PRIMARY_EXACT";
  }),
).length;

const autospecExact = VEHICLES.flatMap((v) =>
  ["oil", "tyre_pressure", "battery"].map((fact) => fitmentScopeOf(v, fact)),
).filter((s) => s.confidence === "EXACT").length;
const autospecScoped = VEHICLES.flatMap((v) =>
  ["oil", "tyre_pressure", "battery"].map((fact) => fitmentScopeOf(v, fact)),
).filter((s) => s.confidence === "SCOPED" || s.confidence === "EXACT").length;

const tripCosts = ROUTES.flatMap((r) => Object.values(routeCosts(r)));
const tripHeuristic = tripCosts.filter((c) => c.evidence === "HEURISTIC").length;
const tripRef = tripCosts.filter((c) => c.evidence !== "HEURISTIC").length;

const wearSurfaces = DESTINATIONS.reduce((n, d) => n + destinationSurfaces(d).length, 0);

const snapshot = {
  sha,
  generatedAt,
  pages: pages.length,
  entities: store.entities.size,
  relations: store.relations.size,
  indexable: pages.filter((p) => p.index_state === "INDEXABLE").length,
  seo_candidate: pages.filter((p) => p.index_state === "SEO_CANDIDATE").length,
  review_required: pages.filter((p) => p.index_state === "REVIEW_REQUIRED").length,
  graph_only: pages.filter((p) => p.index_state === "GRAPH_ONLY").length,
  noindex_product: pages.filter((p) => p.index_state === "NOINDEX_PRODUCT").length,
  PRIMARY_EXACT: countLevel("PRIMARY_EXACT"),
  REGULATORY_EXACT: countLevel("REGULATORY_EXACT"),
  TRUSTED_DATASET_EXACT: countLevel("TRUSTED_DATASET_EXACT"),
  PRIMARY_GENERAL: countLevel("PRIMARY_GENERAL"),
  DATASET_GENERAL: countLevel("DATASET_GENERAL"),
  HEURISTIC: countLevel("DERIVED_HEURISTIC"),
  UNKNOWN: countLevel("UNKNOWN"),
  real_demand_observations: realDemand.length,
  validated_demand: validatedDemand,
  fixcode_exact_pages: exactFixcode,
  wearthere_surfaces: wearSurfaces,
  autospec_exact_facts: autospecExact,
  autospec_scoped_or_exact: autospecScoped,
  chargematch_devices: DEVICES.length,
  chargematch_chargers: CHARGERS.length,
  tripcost_heuristic_fields: tripHeuristic,
  tripcost_nonheuristic_fields: tripRef,
  coverage: datasetCoverage(),
  scaleStops: catalogScaleStops().map((s) => ({ id: s.id, triggered: s.triggered, value: Number(s.value.toFixed(4)) })),
};

const hash = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex").slice(0, 16);

const md = `# Penta state (canonical)

> Generated report. Do not edit by hand.
>
> git SHA: \`${sha}\`
> generated: \`${generatedAt}\`
> metrics snapshot hash: \`${hash}\`

This is the **only** current source of truth for live metrics. Older reports in \`docs/\` are historical unless they carry this same SHA + hash.

## Overall

| Metric | Value |
| ------ | ----: |
| pages | ${snapshot.pages} |
| entities | ${snapshot.entities} |
| relations | ${snapshot.relations} |
| PRIMARY_EXACT | ${snapshot.PRIMARY_EXACT} |
| REGULATORY_EXACT | ${snapshot.REGULATORY_EXACT} |
| TRUSTED_DATASET_EXACT | ${snapshot.TRUSTED_DATASET_EXACT} |
| PRIMARY_GENERAL | ${snapshot.PRIMARY_GENERAL} |
| DATASET_GENERAL | ${snapshot.DATASET_GENERAL} |
| heuristic | ${snapshot.HEURISTIC} |
| unknown | ${snapshot.UNKNOWN} |
| SEO_CANDIDATE | ${snapshot.seo_candidate} |
| INDEXABLE | ${snapshot.indexable} |
| REVIEW_REQUIRED | ${snapshot.review_required} |
| GRAPH_ONLY | ${snapshot.graph_only} |
| NOINDEX_PRODUCT | ${snapshot.noindex_product} |
| real demand observations | ${snapshot.real_demand_observations} |
| validated demand | ${snapshot.validated_demand} |

## Per product

| Product | Pages | SEO_CANDIDATE | INDEXABLE | REVIEW |
| ------- | ----: | ------------: | --------: | -----: |
| FixCode | ${bySite("fixcode").length} | ${seo("fixcode")} | ${indexable("fixcode")} | ${review("fixcode")} |
| WearThere | ${bySite("wearthere").length} | ${seo("wearthere")} | ${indexable("wearthere")} | ${review("wearthere")} |
| ChargeMatch | ${bySite("chargematch").length} | ${seo("chargematch")} | ${indexable("chargematch")} | ${review("chargematch")} |
| AutoSpec | ${bySite("autospec").length} | ${seo("autospec")} | ${indexable("autospec")} | ${review("autospec")} |
| TripCost | ${bySite("tripcost").length} | ${seo("tripcost")} | ${indexable("tripcost")} | ${review("tripcost")} |

## Source depth (this pass)

- exact OEM pages: **${exactFixcode}**
- exact source documents: **4** (Samsung washer table, Samsung 4E article, LG washer list, Bosch E15)
- PRIMARY_EXACT graph facts: **${snapshot.PRIMARY_EXACT}** (projections, not independent OEM documents)
- WearThere climate: compiled in-repo normals classified as **DATASET_GENERAL**, not TRUSTED_DATASET_EXACT
- WearThere surfaces after consolidation: **${wearSurfaces}** season/month pages + city hubs
- AutoSpec EXACT facts (oil/tyre/battery scopes): **${autospecExact}**
- ChargeMatch devices/chargers in catalog: **${DEVICES.length} / ${CHARGERS.length}** (rated specs, MEASURED empty)
- TripCost cost fields: **${tripHeuristic}** heuristic / **${tripRef}** non-heuristic

## Demand

Real observations imported: **${realDemand.length}** (${[...new Set(realDemand.map((e) => e.source))].join(", ") || "none"}). Collection queue: \`ops/DEMAND_COLLECTION_BATCH.csv\`. Validated Path A/B/C pages: **${validatedDemand}**.

## Flags

- \`PUBLIC_SITE_LIVE=false\`
- \`INDEXABLE=${snapshot.indexable}\` is acceptable
- Scale stops: ${catalogScaleStops().filter((s) => s.triggered).map((s) => s.id).join(", ") || "none triggered"}
`;

const out = resolve("docs/PENTA_STATE.md");
mkdirSync("docs", { recursive: true });

if (process.argv.includes("--check")) {
  const current = readFileSync(out, "utf8");
  const liveSha = current.match(/git SHA: `([^`]+)`/)?.[1];
  const liveHash = current.match(/metrics snapshot hash: `([^`]+)`/)?.[1];
  const pageLine = current.match(/\| pages \| (\d+) \|/)?.[1];
  const seoLine = current.match(/\| SEO_CANDIDATE \| (\d+) \|/)?.[1];
  const exactLine = current.match(/\| PRIMARY_EXACT \| (\d+) \|/)?.[1];
  if (pageLine !== String(snapshot.pages) || seoLine !== String(snapshot.seo_candidate) || exactLine !== String(snapshot.PRIMARY_EXACT)) {
    console.error("PENTA_STATE.md disagrees with live recalculation.");
    console.error({ committed: { pageLine, seoLine, exactLine }, live: { pages: snapshot.pages, seo: snapshot.seo_candidate, exact: snapshot.PRIMARY_EXACT } });
    process.exit(1);
  }
  console.log(`PENTA_STATE consistent (${liveSha} / ${liveHash})`);
  process.exit(0);
}

writeFileSync(out, md);
writeFileSync(resolve("ops/PENTA_STATE.json"), JSON.stringify({ ...snapshot, hash }, null, 2));
console.log(`Wrote docs/PENTA_STATE.md hash=${hash} pages=${snapshot.pages} seo=${snapshot.seo_candidate} exact=${snapshot.PRIMARY_EXACT}`);

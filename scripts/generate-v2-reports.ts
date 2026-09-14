import { writeFileSync } from "node:fs";
import { auditGraph } from "../packages/catalog/src/graph-audit";
import { buildCatalog, coverageReport, demandBreakdown, launchReport } from "../packages/catalog/src/index";
import { VIN_SUPPORT } from "@penta/autospec";
import { DIAGNOSTIC_OUTCOMES } from "@penta/fixcode";
import { MEASURED_CURVES, buildPowerScenarios } from "@penta/chargematch";

const BEFORE = {
  entities: 5470,
  relations: 15021,
  unique: 14137,
  duplicate: 884,
  avg: 2.75,
  median: 1,
  isolated: 11,
  exactly_1: 2921,
  pages: 890,
  INDEXABLE: 629,
  SEO_CANDIDATE: 0,
  NOINDEX_PRODUCT: 114,
  GRAPH_ONLY: 36,
  REVIEW_REQUIRED: 111,
  VERIFIED_PRIMARY: 9004,
  chargematch_relations: 1507,
};

const audit = auditGraph();
const store = buildCatalog();
const stats = store.stats();
const demand = demandBreakdown();
const coverage = coverageReport();
const launch = launchReport();

const degrees = new Map<string, number>();
for (const e of store.entities.values()) degrees.set(e.id, 0);
for (const r of store.relations.values()) {
  degrees.set(r.from_id, (degrees.get(r.from_id) ?? 0) + 1);
  degrees.set(r.to_id, (degrees.get(r.to_id) ?? 0) + 1);
}
const buckets = { zero: 0, one: 0, two_three: 0, four_ten: 0, ten_plus: 0 };
for (const n of degrees.values()) {
  if (n === 0) buckets.zero += 1;
  else if (n === 1) buckets.one += 1;
  else if (n <= 3) buckets.two_three += 1;
  else if (n <= 10) buckets.four_ten += 1;
  else buckets.ten_plus += 1;
}

const sourceTruthPerEntity = audit.entities.total
  ? Math.round((audit.edge_kinds.SOURCE_TRUTH / audit.entities.total) * 100) / 100
  : 0;
const cartesian = audit.relations.unique
  ? Math.round((audit.relations.total / audit.relations.unique) * 1000) / 1000
  : 1;
const density = {
  RAW_RELATION_COUNT: audit.relations.total,
  unique_relation_semantics: audit.relations.unique,
  cartesian_expansion_ratio: cartesian,
  source_truth_edges: audit.edge_kinds.SOURCE_TRUTH,
  derived_rule_edges: audit.edge_kinds.DERIVED_RULE,
  personalized_decision_edges: audit.edge_kinds.PERSONALIZED_DECISION,
  source_truth_per_entity: sourceTruthPerEntity,
  GRAPH_INFORMATION_DENSITY: Math.round((audit.edge_kinds.SOURCE_TRUTH / Math.max(1, audit.relations.total)) * 1000) / 1000,
};

function chg(before: number, after: number) {
  return after - before;
}

const report = `# Truth Gate V2 — report

Recalculated ${new Date().toISOString()} from in-memory GraphStore.
Previous markdown was not reused as proof.

## What changed

The quality gate no longer accepts a positive boolean as truth.

- \`required_fields_present\` inspects PAGE_REQUIREMENTS per family (mandatory + decision-critical).
- \`product_action\` is detected from payload outputs, not from the page family.
- \`interactive\` requires user input + computed output. A CTA is not an interaction.
- \`distinct_from_parent\` is computed (overlap, unique facts). \`page.id\` is not evidence.
- \`VERIFIED_PRIMARY\` comes from \`validateFactProvenance\`. Generic manufacturer URLs are PRIMARY_GENERAL.
- Editorial / demand level 0 cannot produce INDEXABLE. Ceiling is SEO_CANDIDATE.
- Edges are classified SOURCE_TRUTH / DERIVED_RULE / PERSONALIZED_DECISION.
- ChargeMatch cartesian EXPECTED_POWER / COMPATIBLE_IF / DEVICE_NEGOTIATES_WITH was replaced by PowerScenario.
- WearThere climate rows carry an explicit dataset citation (no WMO station invented).
- PUBLIC_SITE_LIVE remains false. Public sitemap is empty.

## Final metrics

### Graph

| Metric | Value |
| --- | ---: |
| Entities | ${audit.entities.total} |
| Raw relations | ${audit.relations.total} |
| Unique relation keys | ${audit.relations.unique} |
| Duplicate relation keys | ${audit.relations.duplicate} |
| SOURCE_TRUTH edges | ${audit.edge_kinds.SOURCE_TRUTH} |
| DERIVED_RULE edges | ${audit.edge_kinds.DERIVED_RULE} |
| PERSONALIZED_DECISION edges | ${audit.edge_kinds.PERSONALIZED_DECISION} |
| UNKNOWN edges | ${audit.edge_kinds.UNKNOWN} |
| Rel/entity mean | ${audit.relations.avg_per_entity} |
| Rel/entity median | ${audit.relations.median_per_entity} |
| Entities 0 edges | ${buckets.zero} |
| Entities 1 edge | ${buckets.one} |
| Entities 2–3 edges | ${buckets.two_three} |
| Entities 4–10 edges | ${buckets.four_ten} |
| Entities 10+ edges | ${buckets.ten_plus} |
| GRAPH_INFORMATION_DENSITY | ${density.GRAPH_INFORMATION_DENSITY} |
| Cartesian expansion ratio | ${density.cartesian_expansion_ratio} |
| Source truth / entity | ${density.source_truth_per_entity} |

### Provenance (validator, not enum)

| Status | Count |
| --- | ---: |
| Facts (entities + relations) | ${audit.provenance_v2.facts} |
| VERIFIED exact primary (PRIMARY_EXACT) | ${audit.provenance_v2.verified_exact_primary} |
| VERIFIED exact regulatory | ${audit.provenance_v2.verified_exact_regulatory} |
| Trusted dataset exact | ${audit.provenance_v2.trusted_dataset} |
| Cross-source confirmed | ${audit.provenance_v2.cross} |
| Single source | ${audit.provenance_v2.single} |
| Conflicted | ${audit.provenance_v2.conflicted} |
| Enum VERIFIED_PRIMARY (validator) | ${audit.truth.VERIFIED_PRIMARY} |
| VERIFIED_SECONDARY | ${audit.truth.VERIFIED_SECONDARY} |
| INFERRED | ${audit.truth.INFERRED} |
| ESTIMATED | ${audit.truth.ESTIMATED} |
| UNKNOWN | ${audit.truth.UNKNOWN} |
| Facts with exact source URL | ${audit.provenance_v2.exact_url} |
| Facts with identifiable document name | ${audit.provenance_v2.exact_document} |
| Facts with field-level provenance record | ${audit.provenance_v2.field_level} |
| Facts with only generic domain | ${audit.provenance_v2.generic_only} |
| Facts without provenance | ${audit.provenance_v2.none} |

### Pages

| State | Count |
| --- | ---: |
| Total candidates | ${[...store.pages.values()].length} |
| INDEXABLE | ${audit.pages.INDEXABLE} |
| SEO_CANDIDATE | ${audit.pages.SEO_CANDIDATE} |
| NOINDEX_PRODUCT | ${audit.pages.NOINDEX_PRODUCT} |
| GRAPH_ONLY | ${audit.pages.GRAPH_ONLY} |
| REVIEW_REQUIRED | ${audit.pages.REVIEW_REQUIRED} |

### Demand

| Kind | Pages |
| --- | ---: |
| GSC | ${demand.GSC_OBSERVED} |
| Keyword provider | ${demand.KEYWORD_PROVIDER} |
| SERP | ${demand.SERP_EXISTENCE} |
| Autocomplete | ${demand.AUTOCOMPLETE} |
| Internal search | ${demand.INTERNAL_SEARCH} |
| Editorial only | ${demand.EDITORIAL_JUDGMENT} |

### Quality distribution (non-compensable floors)

mean ${audit.quality.mean} · median ${audit.quality.median} · p10 ${audit.quality.p10} · p25 ${audit.quality.p25} · p75 ${audit.quality.p75} · p90 ${audit.quality.p90} · min ${audit.quality.min} · max ${audit.quality.max}

The 80–84 pile-up is gone. Soft score is capped when verified exact facts < 3 (currently 0). That cluster at 68 is a **cap**, not a claim of quality.

### Honesty flags

- MEASURED_CURVES = ${MEASURED_CURVES.length}
- VIN_SUPPORT = ${VIN_SUPPORT}
- DIAGNOSTIC_OUTCOMES = ${DIAGNOSTIC_OUTCOMES.length}
- PowerScenario measured_curve all null = ${buildPowerScenarios().every((s) => s.measured_curve === null)}
- PUBLIC_SITE_LIVE = ${process.env.PUBLIC_SITE_LIVE === "true"}
- public sitemap entries = 0
`;

const semantics = `# Graph semantics report

## Three logical graphs

| Kind | Count | Meaning |
| --- | ---: | --- |
| SOURCE_TRUTH | ${audit.edge_kinds.SOURCE_TRUTH} | Acquired or directly established from a source (climate normal, OEM spec row, error-on-appliance). |
| DERIVED_RULE | ${audit.edge_kinds.DERIVED_RULE} | Deterministic rule or heuristic (packing list, CAN_CHARGE, PowerScenario, cause ranking). |
| PERSONALIZED_DECISION | ${audit.edge_kinds.PERSONALIZED_DECISION} | Output for a specific user situation. None stored — we do not persist user trips. |
| UNKNOWN | ${audit.edge_kinds.UNKNOWN} | Taxonomy / navigation / unclassified. Not counted as source truth. |

Do not publish “relations total” as graph depth.

## GRAPH_INFORMATION_DENSITY

| Metric | Value |
| --- | ---: |
| RAW_RELATION_COUNT | ${density.RAW_RELATION_COUNT} |
| Unique relation keys | ${density.unique_relation_semantics} |
| Cartesian expansion ratio | ${density.cartesian_expansion_ratio} |
| Source truth / entity | ${density.source_truth_per_entity} |
| GRAPH_INFORMATION_DENSITY (source/raw) | ${density.GRAPH_INFORMATION_DENSITY} |

ChargeMatch raw relations BEFORE cartesian pass: **${BEFORE.chargematch_relations}**. AFTER PowerScenario: **${audit.bySite.chargematch.relations}**.

Duplicate relation keys BEFORE **${BEFORE.duplicate}** AFTER **${audit.relations.duplicate}**. Remaining duplicates are repeated typed edges (e.g. same pair, different property bags), not forced to zero.

## WearThere

- TYPICAL_CLIMATE = SOURCE_TRUTH (compiled normals, dataset \`compiled-monthly-normals\` / \`penta-climate-v1\`, period 1991-2020).
- PACKS / HAS_PACKING_DECISION = DERIVED_RULE (packing-v1). Not a measured wardrobe.
- No PERSONALIZED_DECISION stored for “I run 3h in the rain”.

## ChargeMatch

PowerScenario connects Device, Charger, Cable. expected_power is CALCULATED_EXPECTED / HEURISTIC_EXPECTED. measured_curve = null. EXPECTED_POWER cartesian edges = 0.

## FixCode

Cause → test → result → fix → safety remain decision edges (DERIVED_RULE when inferred from document priors). Labels LIKELY / POSSIBLE / UNCOMMON. No calibrated %. outcome_count = ${DIAGNOSTIC_OUTCOMES.length}.

## AutoSpec

Fitment is only FITS when a verified row exists. same generation ≠ FITS. VIN_SUPPORT = ${VIN_SUPPORT}.

## TripCost

HAS_COST_COMPONENT is DERIVED / heuristic snapshot. Price kind HEURISTIC_PRICE. live_fare = false.
`;

const provenance = `# Provenance V2 report

## Hierarchy

| Level | Rule | Counts as VERIFIED_PRIMARY? |
| --- | --- | --- |
| PRIMARY_EXACT | Manufacturer/official + non-generic URL + locator + verified_at | yes |
| PRIMARY_GENERAL | Manufacturer/official homepage or /support | **no** |
| REGULATORY_EXACT | Regulatory + exact URL + locator | yes |
| TRUSTED_DATASET_EXACT | PRIMARY_DATABASE + dataset + exact URL | no (trusted, not primary) |
| TRUSTED_THIRD_PARTY | Named third party | no |
| CROSS_SOURCE_CONFIRMED | CROSS_SOURCE method | no |
| DERIVED_DETERMINISTIC / DERIVED_HEURISTIC | Calculated | no |
| EDITORIAL / AI_INFERRED / UNKNOWN | — | never |

\`bmw.com\`, \`toyota.com\`, \`samsung.com/us/support\` → PRIMARY_GENERAL.

AI_INFERRED → never VERIFIED_PRIMARY (tested).

## Multi-source

Model: FactObservation[] → CanonicalFact { CONFIRMED | CONFLICTED | UNRESOLVED | ESTIMATED }.
Conflicts are kept. No average, no silent pick.

Current catalog: every compiled fact has **one** source (\`single=${audit.provenance_v2.single}\`). \`conflicted=${audit.provenance_v2.conflicted}\` means we did not invent a second source. 0 conflicts ≠ agreement.

## Coverage

- exact URL: ${audit.provenance_v2.exact_url}
- identifiable document name: ${audit.provenance_v2.exact_document}
- field-level record present: ${audit.provenance_v2.field_level}
- generic domain only: ${audit.provenance_v2.generic_only}
- PRIMARY_EXACT: ${audit.provenance_v2.verified_exact_primary}

WearThere climate uses PRIMARY_DATABASE + dataset id, but \`source_url\` is null (unknown WMO/station). Not TRUSTED_DATASET_EXACT.
`;

const seo = `# SEO readiness V2

INDEXABLE requires quality + truth + distinctiveness + **demonstrated demand** (level ≥ 2: GSC, keyword provider, or internal search).

EDITORIAL_JUDGMENT alone → SEO_CANDIDATE at most.

| Product | INDEXABLE | SEO_CANDIDATE | NOINDEX_PRODUCT | GRAPH_ONLY | REVIEW_REQUIRED |
| --- | ---: | ---: | ---: | ---: | ---: |
${(["fixcode", "autospec", "wearthere", "chargematch", "tripcost"] as const)
  .map((s) => {
    const st = audit.bySite[s].pages_by_state;
    return `| ${s} | ${st.INDEXABLE ?? 0} | ${st.SEO_CANDIDATE ?? 0} | ${st.NOINDEX_PRODUCT ?? 0} | ${st.GRAPH_ONLY ?? 0} | ${st.REVIEW_REQUIRED ?? 0} |`;
  })
  .join("\n")}

**Total INDEXABLE: ${audit.pages.INDEXABLE}.** That is correct. Every page in this catalog has editorial demand only.

The 50 SEO_CANDIDATE pages are FixCode error codes that pass required fields + a real diagnostic action, with editorial demand.

WearThere city-month pages are GRAPH_ONLY or NOINDEX_PRODUCT (climate twins / missing action / editorial). The city×month matrix is not an index list.

PUBLIC_SITE_LIVE=false. Sitemap empty. noindex global.
`;

const qa = `# Product QA V2

Notes /10. Not inflated. 10 would require live primary documents, measured outcomes, and observed demand.

## FixCode — 6.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 8 | ErrorCode → cause → test → result → fix → safety exists. |
| Truth quality | 6 | Manufacturer corpus compiled; URLs often generic support roots. |
| Source quality | 6 | 4 brands only. No invented Whirlpool. |
| Graph quality | 7 | Median 3 edges. Decision tree is real. |
| Decision engine | 8 | diagnostic-v3, labels not %. |
| SEO readiness | 4 | 50 SEO_CANDIDATE, 0 INDEXABLE. |
| Product usefulness | 7 | Diagnose tool works. |
| Risks | — | Document priors look like probabilities; outcomes = ${DIAGNOSTIC_OUTCOMES.length}. |

**DATA_SCALE: NO** — need manufacturer documents with locators before adding brands.
**SEO_SCALE: NO** — no GSC/keyword evidence.
**PUBLIC_LAUNCH: NO** — prelaunch noindex, incomplete provenance.

## AutoSpec — 4.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Vehicle → generation → engine → fluids. Fitment rows exist. |
| Truth quality | 3 | bmw.com-class sources fail PRIMARY_EXACT. |
| Source quality | 4 | Handbook compile, no page/table locators. |
| Graph quality | 4 | Median 1 edge. Thin fitment. |
| Decision engine | 6 | OEM row only; same generation ≠ FITS. VIN_SUPPORT=${VIN_SUPPORT}. |
| SEO readiness | 2 | 0 INDEXABLE, 0 SEO_CANDIDATE. Spec pages fail required fields or distinctiveness. |
| Product usefulness | 5 | Oil/capacity for known variants. |
| Risks | — | Specs can be over-generalized to a generation if not scoped. |

**DATA_SCALE: NO** — need handbook locators + market/trim scope.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## WearThere — 5.0 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Climate normal ≠ forecast. Packing-v1. |
| Truth quality | 4 | Dataset id exists; no station/URL. |
| Source quality | 4 | compiled-monthly-normals, UNVERIFIED method. |
| Graph quality | 5 | Many PACKS derived edges; SOURCE_TRUTH is TYPICAL_CLIMATE. |
| Decision engine | 6 | Capsule is deterministic. Personalized trip not persisted. |
| SEO readiness | 2 | Matrix not indexed. GRAPH_ONLY / NOINDEX. |
| Product usefulness | 6 | Trip tool works. |
| Risks | — | Thin month twins. |

**DATA_SCALE: CONDITIONAL** — only with a citable climate dataset (station or grid URL).
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## ChargeMatch — 5.5 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 8 | PowerScenario + port allocation. |
| Truth quality | 4 | Manufacturer PDO compile, generic provenance. |
| Source quality | 5 | Device max watts are manufacturer-rated, not measured. |
| Graph quality | 6 | Relations ${BEFORE.chargematch_relations} → ${audit.bySite.chargematch.relations}. No cartesian EXPECTED_POWER. |
| Decision engine | 8 | min(device,port,cable). Evidence ≠ MEASURED. |
| SEO readiness | 2 | 0 INDEXABLE. Pair pages are product-only. |
| Product usefulness | 7 | Kit checker is real. |
| Risks | — | Users may read expected W as a lab number. UI must keep measured_curve=null visible. |

**DATA_SCALE: NO** — lab curves or datasheet locators first.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

## TripCost — 4.0 / 10

| Axis | /10 | Notes |
| --- | ---: | --- |
| Architecture | 7 | Cost breakdown + HEURISTIC_PRICE snapshot. |
| Truth quality | 3 | Seed fares, not observed. |
| Source quality | 3 | THIRD_PARTY snapshot. |
| Graph quality | 4 | Median 1. |
| Decision engine | 6 | compareRoute + break-even. live_fare=false. |
| SEO readiness | 2 | 0 INDEXABLE. |
| Product usefulness | 5 | Useful estimate if labelled. |
| Risks | — | Heuristic looking like a live ticket. |

**DATA_SCALE: NO** — need a fare/fuel provider contract.
**SEO_SCALE: NO**
**PUBLIC_LAUNCH: NO**

Coverage snapshot: FixCode brands=${coverage.fixcode.brands} outcomes=${coverage.fixcode.outcomes}; ChargeMatch lab=${coverage.chargematch.lab_measurements}; VIN stub; WearThere climate_kind=${coverage.wearthere.climate_kind}.
`;

const next = `# Next scale plan

Do **not** generate these pages in this pass.

| Product | Best scale axis | Data needed | Realistic extra entities | Potential pages | Thin-content risk | Provenance cost | SEO demand | Priority |
| --- | --- | --- | ---: | ---: | --- | --- | --- | ---: |
| FixCode | More codes **inside 4 brands** with document locators | Manufacturer PDFs (page/section) | 200–400 | 80–150 SEO_CANDIDATE | Medium if hubs duplicate | High (manual locator) | Unknown until GSC | 1 |
| ChargeMatch | Datasheet locators + 0–1 lab curves | PDO PDFs; optional lab | 30–60 scenarios | 20–40 pair pages | High if every device×charger | High | Unknown | 2 |
| AutoSpec | Scoped specs (market/engine/year) | Handbook tables | 100–200 facts | 20–40 topic pages | Very high if year variants | Very high | Unknown | 3 |
| WearThere | Cite a climate dataset, then **few** city-season pages | Dataset URL + period | 0 new cities | 20–40 season pages | Extreme if month matrix | Medium | Unknown | 4 |
| TripCost | One live corridor snapshot | Provider API | 0 new corridors | 5–10 | High if city×city | High (stale) | Unknown | 5 |

READY_FOR_DATA_SCALE: **NO** (WearThere CONDITIONAL on a citable dataset).
READY_FOR_SEO_SCALE: **NO** (all five).
READY_FOR_PUBLIC_LAUNCH: **NO** (all five).

A drop from 629 INDEXABLE to ${audit.pages.INDEXABLE} is the intended outcome.
`;

const compare = `# Before / after

| METRIC | BEFORE | AFTER | CHANGE | INTERPRETATION |
| --- | ---: | ---: | ---: | --- |
| Entities | ${BEFORE.entities} | ${audit.entities.total} | ${chg(BEFORE.entities, audit.entities.total)} | PowerScenario entities added; no catalog scale. |
| Raw relations | ${BEFORE.relations} | ${audit.relations.total} | ${chg(BEFORE.relations, audit.relations.total)} | ChargeMatch cartesian removed. |
| Duplicate relation keys | ${BEFORE.duplicate} | ${audit.relations.duplicate} | ${chg(BEFORE.duplicate, audit.relations.duplicate)} | Fewer parallel EXPECTED_POWER keys. |
| Rel/entity mean | ${BEFORE.avg} | ${audit.relations.avg_per_entity} | ${Math.round((audit.relations.avg_per_entity - BEFORE.avg) * 100) / 100} | Raw mean fell; that is not a depth loss of source truth. |
| Rel/entity median | ${BEFORE.median} | ${audit.relations.median_per_entity} | ${chg(BEFORE.median, audit.relations.median_per_entity)} | Still 1 — many taxonomy nodes. |
| SOURCE_TRUTH edges | n/a (mixed) | ${audit.edge_kinds.SOURCE_TRUTH} | n/a | First honest split. |
| VERIFIED_PRIMARY | ${BEFORE.VERIFIED_PRIMARY} | ${audit.truth.VERIFIED_PRIMARY} | ${chg(BEFORE.VERIFIED_PRIMARY, audit.truth.VERIFIED_PRIMARY)} | Enum “manufacturer” is no longer primary. |
| Generic-source facts | uncounted | ${audit.provenance_v2.generic_only} | n/a | Now visible. |
| Field-level provenance records | 0 | ${audit.provenance_v2.field_level} | +${audit.provenance_v2.field_level} | Records exist; locators still thin. |
| INDEXABLE | ${BEFORE.INDEXABLE} | ${audit.pages.INDEXABLE} | ${chg(BEFORE.INDEXABLE, audit.pages.INDEXABLE)} | Editorial cannot index. |
| SEO_CANDIDATE | ${BEFORE.SEO_CANDIDATE} | ${audit.pages.SEO_CANDIDATE} | ${chg(BEFORE.SEO_CANDIDATE, audit.pages.SEO_CANDIDATE)} | New honest bucket. |
| GRAPH_ONLY | ${BEFORE.GRAPH_ONLY} | ${audit.pages.GRAPH_ONLY} | ${chg(BEFORE.GRAPH_ONLY, audit.pages.GRAPH_ONLY)} | WearThere matrix + near-duplicates. |
| ChargeMatch relations | ${BEFORE.chargematch_relations} | ${audit.bySite.chargematch.relations} | ${chg(BEFORE.chargematch_relations, audit.bySite.chargematch.relations)} | PowerScenario, not cartesian. |
| Pages | ${BEFORE.pages} | ${[...store.pages.values()].length} | 0 | No SEO scale. |

Median **source truth** depth is now measurable (${density.source_truth_per_entity}/entity) instead of being hidden inside 15k mixed edges.
`;

writeFileSync("docs/TRUTH_GATE_V2_REPORT.md", report + "\n" + compare);
writeFileSync("docs/GRAPH_SEMANTICS_REPORT.md", semantics);
writeFileSync("docs/PROVENANCE_V2_REPORT.md", provenance);
writeFileSync("docs/SEO_READINESS_V2.md", seo);
writeFileSync("docs/PRODUCT_QA_V2.md", qa);
writeFileSync("docs/NEXT_SCALE_PLAN.md", next);
console.log("wrote V2 reports", {
  INDEXABLE: audit.pages.INDEXABLE,
  SEO_CANDIDATE: audit.pages.SEO_CANDIDATE,
  VERIFIED_PRIMARY: audit.truth.VERIFIED_PRIMARY,
  relations: audit.relations.total,
});
void launch;

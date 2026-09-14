import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog, resetCatalogCache } from "@penta/catalog";
import {
  assessDemand,
  buildPrelaunchBatch,
  cellAction,
  queryClusterFor,
  recommendWearthereConsolidationV2,
  seoOpportunityScore,
  truthDemandCell,
  type DemandAssessmentV2,
  type DemandClass,
} from "@penta/demand";
import type { PageRecord, SiteId } from "@penta/graph-core";

resetCatalogCache();
const store = buildCatalog();
const pages = [...store.pages.values()];
const generatedAt = new Date().toISOString();

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function assessmentOf(page: PageRecord): DemandAssessmentV2 {
  const stored = page.structured_payload.demand_assessment as DemandAssessmentV2 | undefined;
  if (stored) return stored;
  return assessDemand({
    pageId: page.id,
    queryCluster: queryClusterFor(page),
    evidence: [],
    pageLocale: "en",
  });
}

function truthReady(page: PageRecord): boolean {
  return page.index_state === "SEO_CANDIDATE" || page.index_state === "INDEXABLE";
}

function demandChecked(assessment: DemandAssessmentV2): boolean {
  return assessment.evidence.some((row) => row.source !== "EDITORIAL" && row.observed);
}

function demandClassOf(assessment: DemandAssessmentV2): DemandClass {
  return assessment.class;
}

function priorityScore(page: PageRecord): { score: number; reason: string; wave: 1 | 2 | 3 } {
  const payload = page.structured_payload;
  let score = page.quality_score;
  const reasons: string[] = [];
  if (page.index_state === "SEO_CANDIDATE") {
    score += 100;
    reasons.push("already SEO_CANDIDATE after Truth Gate");
  }
  if (page.site === "fixcode" && page.family === "error-code") {
    score += 40;
    reasons.push("FixCode error-code (highest leverage)");
  }
  const brand = String(payload.brand ?? "").toLowerCase();
  if (["samsung", "lg", "bosch", "miele"].includes(brand)) {
    score += 20;
    reasons.push("known brand with existing provenance");
  }
  if (Array.isArray(payload.causes) && payload.causes.length >= 3) {
    score += 15;
    reasons.push("actionable diagnostic");
  }
  if (!payload.nearest_sibling || payload.neighbor_structured == null || Number(payload.neighbor_structured) < 0.85) {
    score += 8;
    reasons.push("not a near-duplicate");
  }
  if (page.index_state === "REVIEW_REQUIRED" || page.index_state === "GRAPH_ONLY") {
    score -= 30;
  }
  if (page.site === "tripcost") {
    score -= 15;
    reasons.push("heuristic fare — demand cannot unlock INDEXABLE yet");
  }
  let wave: 1 | 2 | 3 = 3;
  if (page.index_state === "SEO_CANDIDATE" || (truthReady(page) && page.site === "fixcode")) wave = 1;
  else if (page.index_state === "NOINDEX_PRODUCT" && page.quality_score >= 50) wave = 2;
  else wave = 3;
  return { score, reason: reasons.join("; ") || page.index_state, wave };
}

type QueueRow = {
  priority: number;
  site: SiteId;
  page_id: string;
  page_family: string;
  canonical_candidate: string;
  primary_query: string;
  query_2: string;
  query_3: string;
  truth_score: number;
  quality_score: number;
  provenance_score: number;
  current_state: string;
  reason_for_priority: string;
  wave: 1 | 2 | 3;
  assessment: DemandAssessmentV2;
  page: PageRecord;
};

const ranked: QueueRow[] = pages
  .map((page) => {
    const cluster = (page.structured_payload.query_cluster as string[] | undefined) ?? queryClusterFor(page);
    const assessment = assessmentOf(page);
    const prio = priorityScore(page);
    const axes = page.structured_payload.axes as { truth_quality?: number } | undefined;
    return {
      priority: Math.round(prio.score),
      site: page.site,
      page_id: page.id,
      page_family: page.family,
      canonical_candidate: page.url,
      primary_query: cluster[0] ?? page.title.toLowerCase(),
      query_2: cluster[1] ?? "",
      query_3: cluster[2] ?? "",
      truth_score: axes?.truth_quality ?? (truthReady(page) ? 70 : 30),
      quality_score: page.quality_score,
      provenance_score: axes?.truth_quality ?? 0,
      current_state: page.index_state,
      reason_for_priority: prio.reason,
      wave: prio.wave,
      assessment,
      page,
    };
  })
  .sort((a, b) => b.priority - a.priority);

const queueHeader = [
  "priority",
  "site",
  "page_id",
  "page_family",
  "canonical_candidate",
  "primary_query",
  "query_2",
  "query_3",
  "truth_score",
  "quality_score",
  "provenance_score",
  "current_state",
  "reason_for_priority",
];

function queueCsv(rows: QueueRow[]): string {
  return [
    queueHeader.join(","),
    ...rows.map((row) =>
      [
        row.priority,
        row.site,
        row.page_id,
        row.page_family,
        row.canonical_candidate,
        row.primary_query,
        row.query_2,
        row.query_3,
        row.truth_score,
        row.quality_score,
        row.provenance_score,
        row.current_state,
        row.reason_for_priority,
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");
}

mkdirSync(resolve("ops"), { recursive: true });
writeFileSync(resolve("ops/DEMAND_DISCOVERY_QUEUE.csv"), `${queueCsv(ranked)}\n`);

const wave1 = ranked.filter((row) => row.wave === 1).slice(0, 100);
const wave2 = ranked.filter((row) => row.wave === 2).slice(0, 150);
const wave3 = ranked.filter((row) => row.wave === 3);

writeFileSync(resolve("ops/WAVE_1.csv"), `${queueCsv(wave1)}\n`);
writeFileSync(resolve("ops/WAVE_2.csv"), `${queueCsv(wave2)}\n`);
writeFileSync(resolve("ops/WAVE_3.csv"), `${queueCsv(wave3)}\n`);

const reviewPages = wave1.slice(0, 80);
const review = [
  "# Demand review (Wave 1)",
  "",
  "Checkboxes are empty on purpose. Do not mark a signal observed unless you saw it.",
  "",
  ...reviewPages.flatMap((row) => {
    const cluster = [row.primary_query, row.query_2, row.query_3].filter(Boolean);
    return [
      `## ${row.page.title}`,
      "",
      `- Page: \`${row.page_id}\` · ${row.site} · ${row.canonical_candidate}`,
      `- Primary query: ${row.primary_query}`,
      `- Alternative queries: ${cluster.slice(1).join(" · ") || "—"}`,
      `- Truth readiness: ${truthReady(row.page) ? "READY (SEO_CANDIDATE/INDEXABLE)" : row.current_state}`,
      `- Current SEO state: ${row.current_state}`,
      `- Demand class: ${row.assessment.class} (unchecked unless evidence was imported)`,
      "",
      "- [ ] SERP strong",
      "- [ ] Autocomplete",
      "- [ ] Related searches",
      "- [ ] Trends",
      "- [ ] Keyword data",
      "",
      "Evidence notes:",
      "",
      "Final classification:",
      "",
    ];
  }),
];
writeFileSync(resolve("ops/DEMAND_REVIEW.md"), `${review.join("\n")}\n`);

const batch = buildPrelaunchBatch(
  pages.map((page) => ({
    id: page.id,
    site: page.site,
    url: page.url,
    index_state: page.index_state,
    seo_validation: page.seo_validation,
    demand_assessment: assessmentOf(page),
    quality_why: String(page.structured_payload.quality_why ?? ""),
  })),
  generatedAt,
);
writeFileSync(resolve("ops/PRELAUNCH_BATCH.json"), `${JSON.stringify(batch, null, 2)}\n`);

const sites: SiteId[] = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];
const bySite = Object.fromEntries(
  sites.map((site) => {
    const rows = ranked.filter((row) => row.site === site);
    const checked = rows.filter((row) => demandChecked(row.assessment));
    const strong = rows.filter((row) => row.assessment.class === "HIGH" || row.assessment.class === "VERY_HIGH");
    const states = {
      PRELAUNCH_INDEXABLE: rows.filter((row) => row.page.index_state === "INDEXABLE" && row.page.seo_validation === "PRELAUNCH")
        .length,
      INDEXABLE: rows.filter((row) => row.page.index_state === "INDEXABLE").length,
      SEO_CANDIDATE: rows.filter((row) => row.page.index_state === "SEO_CANDIDATE").length,
      NOINDEX_PRODUCT: rows.filter((row) => row.page.index_state === "NOINDEX_PRODUCT").length,
      GRAPH_ONLY: rows.filter((row) => row.page.index_state === "GRAPH_ONLY").length,
      REVIEW_REQUIRED: rows.filter((row) => row.page.index_state === "REVIEW_REQUIRED").length,
    };
    const cells = {
      HIGH_TRUTH_HIGH_DEMAND: 0,
      HIGH_TRUTH_LOW_DEMAND: 0,
      LOW_TRUTH_HIGH_DEMAND: 0,
      LOW_TRUTH_LOW_DEMAND: 0,
    };
    for (const row of rows) {
      cells[truthDemandCell(truthReady(row.page), row.assessment.class)] += 1;
    }
    return [
      site,
      {
        candidates: rows.length,
        truth_ready: rows.filter((row) => truthReady(row.page)).length,
        demand_checked: checked.length,
        demand_unchecked: rows.length - checked.length,
        strong_demand: strong.length,
        medium_demand: rows.filter((row) => row.assessment.class === "MEDIUM").length,
        weak_demand: rows.filter((row) => row.assessment.class === "LOW").length,
        unknown_demand: rows.filter((row) => row.assessment.class === "UNKNOWN").length,
        ...states,
        cells,
        queries: rows.reduce((sum, row) => sum + ((row.page.structured_payload.query_cluster as string[] | undefined)?.length ?? 0), 0),
        evidence: rows.reduce((sum, row) => sum + row.assessment.evidence.filter((e) => e.source !== "EDITORIAL").length, 0),
      },
    ];
  }),
) as unknown as Record<SiteId, Record<string, number | Record<string, number>>>;

const wearPages = pages
  .filter((page) => page.site === "wearthere" && page.family === "wear-month")
  .map((page) => ({
    city: String(page.structured_payload.city ?? page.structured_payload.slug ?? ""),
    lat: Number(page.structured_payload.lat ?? 48),
    month: Number(page.structured_payload.month ?? 0),
    tmax: Number(page.structured_payload.tmax_c ?? page.structured_payload.tmax ?? 0),
    tmin: Number(page.structured_payload.tmin_c ?? page.structured_payload.tmin ?? 0),
    rain_mm: Number(page.structured_payload.rain_mm ?? 0),
  }))
  .filter((row) => row.city && row.month);
const consolidations = recommendWearthereConsolidationV2(wearPages);

const evidenceBySource: Record<string, number> = {};
for (const row of ranked) {
  for (const ev of row.assessment.evidence) {
    evidenceBySource[ev.source] = (evidenceBySource[ev.source] ?? 0) + 1;
  }
}

const totals = {
  candidates: pages.length,
  truth_ready: pages.filter(truthReady).length,
  truth_not_ready: pages.filter((page) => !truthReady(page)).length,
  demand_checked: ranked.filter((row) => demandChecked(row.assessment)).length,
  demand_unchecked: ranked.filter((row) => !demandChecked(row.assessment)).length,
  strong_demand: ranked.filter((row) => row.assessment.class === "HIGH" || row.assessment.class === "VERY_HIGH").length,
  medium_demand: ranked.filter((row) => row.assessment.class === "MEDIUM").length,
  weak_demand: ranked.filter((row) => row.assessment.class === "LOW").length,
  unknown_demand: ranked.filter((row) => row.assessment.class === "UNKNOWN").length,
  PRELAUNCH_INDEXABLE: pages.filter((page) => page.index_state === "INDEXABLE" && page.seo_validation === "PRELAUNCH")
    .length,
  SEO_CANDIDATE: pages.filter((page) => page.index_state === "SEO_CANDIDATE").length,
  NOINDEX_PRODUCT: pages.filter((page) => page.index_state === "NOINDEX_PRODUCT").length,
  GRAPH_ONLY: pages.filter((page) => page.index_state === "GRAPH_ONLY").length,
  REVIEW_REQUIRED: pages.filter((page) => page.index_state === "REVIEW_REQUIRED").length,
  queries: ranked.reduce((sum, row) => sum + ([row.primary_query, row.query_2, row.query_3].filter(Boolean).length), 0),
};

const insufficientTruth = pages.filter((page) => page.index_state === "REVIEW_REQUIRED" || page.index_state === "GRAPH_ONLY").length;
const insufficientDemand = pages.filter((page) => truthReady(page) && page.index_state !== "INDEXABLE").length;
const strongDemandWeakTruth = ranked.filter(
  (row) => !truthReady(row.page) && (row.assessment.class === "HIGH" || row.assessment.class === "VERY_HIGH"),
).length;
const strongTruthNoDemand = ranked.filter((row) => truthReady(row.page) && row.assessment.class === "UNKNOWN").length;

const report = [
  "# Demand Discovery V2",
  "",
  `Generated: ${generatedAt}`,
  "",
  "`PUBLIC_SITE_LIVE` remains **false**. No SERP/autocomplete/Trends/GSC observations were invented in this pass.",
  "",
  "## Totals",
  "",
  `| Metric | Count |`,
  `| --- | ---: |`,
  `| Total candidates | ${totals.candidates} |`,
  `| Truth-ready | ${totals.truth_ready} |`,
  `| Truth-not-ready | ${totals.truth_not_ready} |`,
  `| Candidates eligible for demand check (Wave 1) | ${wave1.length} |`,
  `| Queries created (primary+alts on queue) | ${totals.queries} |`,
  `| Evidence collected (non-editorial) | ${ranked.reduce((s, r) => s + r.assessment.evidence.filter((e) => e.source !== "EDITORIAL").length, 0)} |`,
  `| Demand checked | ${totals.demand_checked} |`,
  `| Demand unchecked | ${totals.demand_unchecked} |`,
  `| Strong demand | ${totals.strong_demand} |`,
  `| Medium demand | ${totals.medium_demand} |`,
  `| Weak demand | ${totals.weak_demand} |`,
  `| Unknown demand | ${totals.unknown_demand} |`,
  `| PRELAUNCH_INDEXABLE | ${totals.PRELAUNCH_INDEXABLE} |`,
  `| Remaining SEO_CANDIDATE | ${totals.SEO_CANDIDATE} |`,
  `| NOINDEX_PRODUCT | ${totals.NOINDEX_PRODUCT} |`,
  `| GRAPH_ONLY | ${totals.GRAPH_ONLY} |`,
  `| REVIEW_REQUIRED | ${totals.REVIEW_REQUIRED} |`,
  `| Insufficient truth | ${insufficientTruth} |`,
  `| Insufficient demand | ${insufficientDemand} |`,
  `| Strong demand but weak truth | ${strongDemandWeakTruth} |`,
  `| Strong truth but no observed demand | ${strongTruthNoDemand} |`,
  "",
  "## By evidence source",
  "",
  Object.keys(evidenceBySource).length
    ? Object.entries(evidenceBySource)
        .map(([source, n]) => `- ${source}: ${n}`)
        .join("\n")
    : "- none imported (editorial fallback only)",
  "",
  "## By site",
  "",
  `| Product | Candidates | Truth Ready | Demand Checked | Strong Demand | PRELAUNCH INDEXABLE | SEO Candidate | Main blocker |`,
  `| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |`,
  ...sites.map((site) => {
    const s = bySite[site] as Record<string, number>;
    const blocker =
      s.PRELAUNCH_INDEXABLE > 0
        ? "none"
        : s.SEO_CANDIDATE > 0
          ? "no observed pre-launch demand (GSC not required; evidence not imported)"
          : site === "tripcost"
            ? "heuristic fare + missing demand"
            : "truth/quality not ready";
    return `| ${site} | ${s.candidates} | ${s.truth_ready} | ${s.demand_checked} | ${s.strong_demand} | ${s.PRELAUNCH_INDEXABLE} | ${s.SEO_CANDIDATE} | ${blocker} |`;
  }),
  "",
  "## Demand × truth matrix",
  "",
  `| Cell | Action | Count |`,
  `| --- | --- | ---: |`,
  ...(["HIGH_TRUTH_HIGH_DEMAND", "HIGH_TRUTH_LOW_DEMAND", "LOW_TRUTH_HIGH_DEMAND", "LOW_TRUTH_LOW_DEMAND"] as const).map(
    (cell) => {
      const count = sites.reduce((sum, site) => sum + ((bySite[site].cells as Record<string, number>)[cell] ?? 0), 0);
      const labels = {
        HIGH_TRUTH_HIGH_DEMAND: "HIGH_TRUTH + HIGH_DEMAND",
        HIGH_TRUTH_LOW_DEMAND: "HIGH_TRUTH + LOW_DEMAND",
        LOW_TRUTH_HIGH_DEMAND: "LOW_TRUTH + HIGH_DEMAND",
        LOW_TRUTH_LOW_DEMAND: "LOW_TRUTH + LOW_DEMAND",
      } as const;
      return `| ${labels[cell]} | ${cellAction(cell)} | ${count} |`;
    },
  ),
  "",
  "## Waves",
  "",
  `- Wave 1: ${wave1.length} pages (FixCode SEO_CANDIDATE first). See \`ops/WAVE_1.csv\`.`,
  `- Wave 2: ${wave2.length} pages needing little enrichment. See \`ops/WAVE_2.csv\`.`,
  `- Wave 3: ${wave3.length} pages needing new datasets/providers. See \`ops/WAVE_3.csv\`.`,
  "",
  "## WearThere consolidation",
  "",
  consolidations.filter((row) => row.action !== "KEEP_MONTHS").length
    ? consolidations
        .filter((row) => row.action !== "KEEP_MONTHS")
        .slice(0, 40)
        .map((row) => `- ${row.city} ${row.model} ${row.season} months ${row.months.join("/")}: ${row.action} — ${row.reason}`)
        .join("\n")
    : "- No seasonal consolidation recommended from climate spread alone.",
  "",
  "## Cold start",
  "",
  `PRELAUNCH_BATCH size: **${batch.pages.length}**.`,
  "",
  batch.pages.length === 0
    ? "Zero is not a failure. No compliant SERP/autocomplete/keyword observations were imported. The gate can promote a page to INDEXABLE/PRELAUNCH as soon as a real Path A/B/C is imported — GSC is not required."
    : batch.pages.map((page) => `- ${page.site} ${page.path}`).join("\n"),
  "",
  "## Opportunity score",
  "",
  "Informational only. A Truth Gate fail still means INDEXABLE = false.",
  "",
  `| Page | Demand | Truth | Utility | SERP opp. | Total | Indexable? |`,
  `| --- | ---: | ---: | ---: | ---: | ---: | --- |`,
  ...wave1.slice(0, 15).map((row) => {
    const opp = seoOpportunityScore({
      assessment: row.assessment,
      truthReady: truthReady(row.page),
      productUtility: row.page.index_state !== "GRAPH_ONLY",
      truthGatePass: truthReady(row.page),
    });
    return `| ${row.page_id} | ${opp.demand} | ${opp.truth_readiness} | ${opp.product_utility} | ${opp.serp_opportunity} | ${opp.total} | ${opp.indexable} |`;
  }),
  "",
].join("\n");

mkdirSync(resolve("docs"), { recursive: true });
writeFileSync(resolve("docs/DEMAND_DISCOVERY_V2.md"), `${report}\n`);

const backlog = [
  "# Demand-driven data backlog",
  "",
  `Generated: ${generatedAt}`,
  "",
  "Demand evidence can promote a page only when Truth/Quality already pass.",
  "No HIGH demand observations were imported in this pass, so there is **no** LOW_TRUTH + HIGH_DEMAND unlock yet.",
  "",
  "Do not read the examples below as observed demand. They are *potential* unlocks if a later import confirms the market.",
  "",
  "## Potential unlocks (unchecked demand)",
  "",
  "### FixCode — brands absent from the corpus",
  "",
  "```",
  "FixCode Whirlpool F21",
  "",
  "Demand: UNKNOWN (not observed)",
  "Truth: LOW (brand not in verified corpus)",
  "Missing:",
  "- exact manufacturer doc",
  "- diagnostic steps",
  "- safety warning",
  "",
  "Potential unlock:",
  "1 high-value SEO page — only after PRIMARY_EXACT provenance exists",
  "AND a qualifying pre-launch demand path is imported.",
  "```",
  "",
  "Do not add Whirlpool codes until manufacturer provenance is real.",
  "",
  "### AutoSpec",
  "",
  "- More OEM-exact oil/coolant/tyre rows at generation + engine + market scope.",
  "- VIN remains NOT_IMPLEMENTED. Demand cannot invent a decoder.",
  "",
  "### WearThere",
  "",
  "- Prefer seasonal hubs when month pages are climatically near-identical (see Demand Discovery consolidations).",
  "- Do not auto-index 12 × every city.",
  "",
  "### ChargeMatch",
  "",
  "- Target device-level wattage / best-charger intents, not device × charger × cable SEO pages.",
  "- Lab measurements remain absent. Demand does not create MEASURED evidence.",
  "",
  "### TripCost",
  "",
  "- Corridors can be queued for demand checks.",
  "- Heuristic fares stay SEO_CANDIDATE even if Paris–Lyon demand is later confirmed.",
  "- Missing: contracted live fare/fuel provider.",
  "",
];

writeFileSync(resolve("docs/DEMAND_DRIVEN_DATA_BACKLOG.md"), `${backlog.join("\n")}\n`);

writeFileSync(
  resolve("ops/DEMAND_METRICS.json"),
  `${JSON.stringify({ generatedAt, totals, bySite, wave1: wave1.length, wave2: wave2.length, wave3: wave3.length, prelaunch_batch: batch.pages.length, public_site_live: false }, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      generatedAt,
      totals,
      prelaunch_batch: batch.pages.length,
      public_site_live: false,
    },
    null,
    2,
  ),
);

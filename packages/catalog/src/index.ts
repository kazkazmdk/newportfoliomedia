import { GraphStore, classifyEntityDepth, type PageRecord } from "@penta/graph-core";
import { classifyDemand, duplicateAction, intentFamilyId, intentSimilarity, opportunityScore, qualityDistribution, type DemandSourceKind } from "@penta/quality-gate";
import { allFixcodePages } from "@penta/fixcode";
import { allAutospecPages } from "@penta/autospec";
import { allWeartherePages } from "@penta/wearthere";
import { allChargematchPages } from "@penta/chargematch";
import { allTripcostPages } from "@penta/tripcost";
import { globalNoindex } from "@penta/publishing-core";
import { SITE_AI_TOOLS } from "@penta/ai-core";
import { isFresh } from "@penta/data-provenance";
import { populateDecisionGraph } from "./graph-depth";
import { deepenDecisionGraph } from "./graph-deepen";
import { applyIndexGates, resetDemandCache } from "./index-recompute";
import type { DemandAssessmentV2, DemandEvidenceSource } from "@penta/demand";

let cached: GraphStore | null = null;

export function resetCatalogCache() {
  cached = null;
  resetDemandCache();
}

export function buildCatalog(): GraphStore {
  if (cached) return cached;
  const store = new GraphStore();
  populateDecisionGraph(store);
  deepenDecisionGraph(store);
  const pages = [
    ...allFixcodePages(),
    ...allAutospecPages(),
    ...allWeartherePages(),
    ...allChargematchPages(),
    ...allTripcostPages(),
  ];
  for (const page of pages) store.addPage(page);
  applyIndexGates(store);
  cached = store;
  return store;
}

export type DuplicateAction = "KEEP" | "MERGE" | "NOINDEX";

export function duplicateReport(threshold = 0.8) {
  const store = buildCatalog();
  const pages = [...store.pages.values()];
  const rows: Array<{
    a: string;
    b: string;
    similarity: number;
    distinct_a?: string;
    distinct_b?: string;
    action: DuplicateAction;
  }> = [];
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      if (pages[i].site !== pages[j].site) continue;
      const sim = intentSimilarity(pages[i], pages[j]);
      if (sim < threshold) continue;
      const distinct_a = String(pages[i].structured_payload.distinct_reason ?? "");
      const distinct_b = String(pages[j].structured_payload.distinct_reason ?? "");
      const hasDistinct = Boolean(distinct_a || distinct_b);
      const action =
        intentFamilyId(pages[i]) === intentFamilyId(pages[j]) && pages[i].url !== pages[j].url
          ? "MERGE"
          : hasDistinct
            ? duplicateAction(sim, distinct_a || distinct_b)
            : duplicateAction(sim);
      rows.push({
        a: pages[i].url,
        b: pages[j].url,
        similarity: Math.round(sim * 1000) / 1000,
        distinct_a: distinct_a || undefined,
        distinct_b: distinct_b || undefined,
        action,
      });
    }
  }
  return rows;
}

function connectivity(store: GraphStore) {
  const degree = new Map<string, number>();
  for (const id of store.entities.keys()) degree.set(id, 0);
  for (const rel of store.relations.values()) {
    degree.set(rel.from_id, (degree.get(rel.from_id) ?? 0) + 1);
    degree.set(rel.to_id, (degree.get(rel.to_id) ?? 0) + 1);
  }
  const buckets = { ISOLATED: 0, SHALLOW: 0, CONNECTED: 0, RICH: 0, ORPHAN: 0, LOW_DEPTH: 0 };
  for (const entity of store.entities.values()) {
    const n = degree.get(entity.id) ?? 0;
    const depth = classifyEntityDepth(entity.type, n);
    buckets[depth] += 1;
    if (depth === "ISOLATED") buckets.ORPHAN += 1;
    if (depth === "SHALLOW") buckets.LOW_DEPTH += 1;
  }
  return buckets;
}

export function launchReport() {
  const store = buildCatalog();
  const sites = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"] as const;
  const bySite = Object.fromEntries(sites.map((site) => [site, store.stats(site)]));
  const pages = [...store.pages.values()];
  const indexable = pages.filter((p) => p.index_state === "INDEXABLE");
  const avg =
    indexable.reduce((s, p) => s + p.quality_score, 0) / Math.max(1, indexable.length);
  const min = Math.min(...indexable.map((p) => p.quality_score), 100);
  const dups = duplicateReport(0.85);
  const stale = [...store.relations.values()].filter((rel) => {
    const until = rel.provenance[0]?.valid_until;
    return until ? new Date(until).getTime() < Date.now() : false;
  }).length;
  return {
    graph: store.stats(),
    bySite,
    connectivity: connectivity(store),
    average_indexable_quality: Math.round(avg * 10) / 10,
    minimum_indexable_quality: min,
    quality_distribution: qualityDistribution(pages),
    duplicate_candidates: dups.length,
    duplicates_without_distinct_reason: dups.filter((row) => row.action !== "KEEP").length,
    stale_relations: stale,
    families: Object.fromEntries(
      sites.map((site) => {
        const fam: Record<string, number> = {};
        for (const page of store.pagesFor(site, "INDEXABLE")) {
          fam[page.family] = (fam[page.family] ?? 0) + 1;
        }
        return [site, fam];
      }),
    ),
    public_site_live: process.env.PUBLIC_SITE_LIVE === "true",
    global_noindex: globalNoindex(),
  };
}

export function pageExplainability(page: PageRecord) {
  const distinct = String(page.structured_payload.distinct_reason ?? "");
  const why =
    page.index_state === "INDEXABLE"
      ? `INDEXABLE because demand evidence is above editorial, hard gates passed, and distinctiveness was computed — not because a boolean was set. Soft score ${page.quality_score} is secondary. ${page.structured_payload.quality_why ?? ""}`
      : page.index_state === "SEO_CANDIDATE"
        ? `SEO_CANDIDATE: ${page.structured_payload.quality_why ?? "editorial/unknown demand cannot produce INDEXABLE"}. Soft score ${page.quality_score} does not create demand.`
        : `Not indexable (${page.index_state}). Soft score ${page.quality_score} cannot override a failed hard gate. ${page.structured_payload.quality_why ?? ""}`;
  return {
    url: page.url,
    why_indexable: why,
    quality_score: page.quality_score,
    demand: page.search_demand,
    entity_ids: page.entity_ids,
    distinct_reason: page.structured_payload.distinct_reason ?? null,
    freshness: page.freshness,
    intent_family: intentFamilyId(page),
    seo_validation: page.seo_validation ?? "NONE",
    demand_phase: page.structured_payload.demand_phase ?? "PRE_LAUNCH",
    seo_eligibility: page.structured_payload.seo_eligibility ?? "NONE",
  };
}

export function entityInspector(id: string) {
  const store = buildCatalog();
  const entity = store.get(id);
  if (!entity) return null;
  const incoming = [...store.relations.values()].filter((rel) => rel.to_id === id);
  const outgoing = [...store.relations.values()].filter((rel) => rel.from_id === id);
  const pages = [...store.pages.values()].filter((page) => page.entity_ids.includes(id));
  const decision = [...incoming, ...outgoing].filter((rel) => rel.decision_relevant);
  const stale = [...incoming, ...outgoing].filter((rel) => {
    const until = rel.provenance[0]?.valid_until;
    return until ? new Date(until).getTime() < Date.now() : false;
  });
  return {
    entity,
    incoming,
    outgoing,
    decision_relevant: decision,
    stale,
    conflicts: store.conflicts.filter((c) => c.entity_id === id),
    pages: pages.map((page) => ({ url: page.url, index_state: page.index_state, quality_score: page.quality_score })),
  };
}

export function programmaticSeoIssues() {
  const store = buildCatalog();
  const issues: string[] = [];
  const titles = new Map<string, string>();
  const canonicals = new Map<string, string>();
  for (const page of store.pages.values()) {
    if (page.index_state !== "INDEXABLE") continue;
    if (page.index_state === "INDEXABLE" && page.quality_score < 1) {
      issues.push(`${page.url} INDEXABLE without a computed score`);
    }
    if (!page.title.trim()) issues.push(`${page.url} empty title`);
    const prev = titles.get(page.title);
    if (prev) issues.push(`Duplicate title "${page.title}" on ${prev} and ${page.url}`);
    titles.set(page.title, page.url);
    const seenCanon = canonicals.get(page.canonical);
    if (seenCanon && seenCanon !== page.url) issues.push(`Duplicate canonical ${page.canonical}`);
    canonicals.set(page.canonical, page.url);
    if (page.canonical.includes("localhost") || page.canonical.includes("vercel.app")) {
      issues.push(`${page.url} preview canonical`);
    }
    if (!page.freshness) issues.push(`${page.url} missing freshness`);
    if (page.noindex) issues.push(`${page.url} INDEXABLE but noindex flag`);
  }
  if (!globalNoindex() && process.env.PUBLIC_SITE_LIVE !== "true") {
    issues.push("PUBLIC_SITE_LIVE unexpectedly true");
  }
  return issues;
}

export function coverageReport() {
  const store = buildCatalog();
  return {
    fixcode: {
      brands: store.byType("fixcode", "brand").length,
      models: store.byType("fixcode", "model_family").length,
      error_codes: store.byType("fixcode", "error_code").length,
      symptoms: store.byType("fixcode", "symptom").length,
      causes: store.byType("fixcode", "cause").length,
      tests: store.byType("fixcode", "test").length,
      test_results: store.byType("fixcode", "test_result").length,
      fixes: store.byType("fixcode", "fix").length,
      safety_relations: [...store.relations.values()].filter((r) => r.site === "fixcode" && r.type === "SAFETY_CLASS").length,
      outcomes: store.byType("fixcode", "outcome").length,
    },
    autospec: {
      models: store.byType("autospec", "model").length,
      generations: store.byType("autospec", "generation").length,
      configurations: store.byType("autospec", "vehicle_configuration").length,
      engines: store.byType("autospec", "engine").length,
      fluids: store.byType("autospec", "fluid_spec").length,
      services: store.byType("autospec", "service").length,
      components: store.byType("autospec", "component").length,
      markets: store.byType("autospec", "market").length,
      fitments: [...store.relations.values()].filter((r) => r.site === "autospec" && r.type === "FITS").length,
      recalls: store.byType("autospec", "recall").length,
    },
    wearthere: {
      destinations: store.byType("wearthere", "destination").length,
      climate_records: store.byType("wearthere", "historical_climate").length,
      garments: store.byType("wearthere", "garment").length,
      packing_relations: [...store.relations.values()].filter((r) => r.site === "wearthere" && r.type === "PACKS").length,
      climate_kind: "CLIMATE_NORMAL",
    },
    chargematch: {
      devices: store.byType("chargematch", "device").length,
      chargers: store.byType("chargematch", "charger").length,
      ports: store.byType("chargematch", "charger_port").length,
      cables: store.byType("chargematch", "cable").length,
      protocols: store.byType("chargematch", "protocol").length,
      compatibility: [...store.relations.values()].filter((r) => r.site === "chargematch" && r.type === "CAN_CHARGE").length,
      expected_power: [...store.relations.values()].filter((r) => r.site === "chargematch" && r.type === "EXPECTED_POWER").length,
      lab_measurements: [...store.relations.values()].filter((r) => r.site === "chargematch" && r.type === "MEASURED_AT" && r.properties.lab === true).length,
    },
    tripcost: {
      corridors: store.byType("tripcost", "corridor").length,
      modes: store.byType("tripcost", "mode").length,
      cost_components: store.byType("tripcost", "cost_component").length,
      time_components: store.byType("tripcost", "time_component").length,
      distances: store.byType("tripcost", "distance").length,
      volatile_cost_relations: [...store.relations.values()].filter(
        (r) => r.site === "tripcost" && r.type === "HAS_COST_COMPONENT" && r.properties.family === "VOLATILE",
      ).length,
      evergreen_cost_relations: [...store.relations.values()].filter(
        (r) => r.site === "tripcost" && r.type === "HAS_COST_COMPONENT" && r.properties.family === "EVERGREEN",
      ).length,
    },
  };
}

export type AiUsageClass = "GOOD_USE" | "OPTIONAL" | "SHOULD_BE_DETERMINISTIC" | "DANGEROUS";

export const AI_USAGE_AUDIT: Array<{ fn: string; site: string; classification: AiUsageClass; status: string }> = [
  { fn: "oil / capacity lookup", site: "autospec", classification: "SHOULD_BE_DETERMINISTIC", status: "deterministic graph lookup; no LLM" },
  { fn: "fitment", site: "autospec", classification: "DANGEROUS", status: "OEM row only; LLM compatibility is forbidden; LOW shows Possible fitment — verify." },
  { fn: "VIN decode", site: "autospec", classification: "SHOULD_BE_DETERMINISTIC", status: "MockVinProvider stub — not a licensed VIN API" },
  { fn: "climate normals", site: "wearthere", classification: "SHOULD_BE_DETERMINISTIC", status: "compiled monthly normals (CLIMATE_NORMAL)" },
  { fn: "Open-Meteo forecast", site: "wearthere", classification: "OPTIONAL", status: "live HTTP optional; never mixed into climate normals" },
  { fn: "packing optimizer", site: "wearthere", classification: "SHOULD_BE_DETERMINISTIC", status: "packing-v1 property rules" },
  { fn: "USB-PD compatibility", site: "chargematch", classification: "SHOULD_BE_DETERMINISTIC", status: "compatibility-v2 min(device,port,cable); evidence never MEASURED without lab" },
  { fn: "lab watt measurement", site: "chargematch", classification: "SHOULD_BE_DETERMINISTIC", status: "not present; EXPECTED_POWER is INFERRED overlap" },
  { fn: "route compare", site: "tripcost", classification: "SHOULD_BE_DETERMINISTIC", status: "tripcost-v1 seed fares + door-to-door buffers" },
  { fn: "live transport price", site: "tripcost", classification: "DANGEROUS", status: "LLM must not invent current fares; snapshot labelled, stale ≠ current" },
  { fn: "diagnose()", site: "fixcode", classification: "SHOULD_BE_DETERMINISTIC", status: "diagnostic-v3 document priors; % hidden until VERIFIED outcomes" },
  { fn: "repair probability without evidence", site: "fixcode", classification: "DANGEROUS", status: "priors are document weights; labels High/Medium/Possible only" },
  { fn: "explainDiagnosis", site: "fixcode", classification: "OPTIONAL", status: "template over ranked causes; no model call in this pass" },
  { fn: "visionGuard / scan", site: "fixcode", classification: "GOOD_USE", status: "upload gated; vision not executed without confirmation" },
];

export const DATA_LICENSING = [
  { source_id: "fixcode-support-corpus", commercial_reuse: "restricted-compilation", caching: "allowed", redistribution: "no-verbatim-manuals", attribution: "manufacturer support URLs" },
  { source_id: "oem-handbook", commercial_reuse: "facts-only", caching: "allowed", redistribution: "no-scan-of-handbook", attribution: "manufacturer" },
  { source_id: "oem-power-specs", commercial_reuse: "facts-only", caching: "months", redistribution: "no-datasheet-dump", attribution: "manufacturer PDO tables" },
  { source_id: "climate-normals-compiled", commercial_reuse: "compiled-normals", caching: "long", redistribution: "aggregates-ok", attribution: "climate normals compilation" },
  { source_id: "seed-transport-snapshot", commercial_reuse: "estimates-only", caching: "hours-when-live", redistribution: "not-live-tickets", attribution: "snapshot, not a GDS" },
  { source_id: "open-meteo", commercial_reuse: "check-terms-before-prod", caching: "hours", redistribution: "provider-terms", attribution: "Open-Meteo if forecast used" },
];

export const PROVIDER_HEALTH = [
  { provider: "Open-Meteo", last_success: null as string | null, last_failure: null as string | null, error_rate: null as number | null, latency_ms: null as number | null, quota: "fair-use", notes: "Optional forecast only. Not pinged at build." },
  { provider: "MockVinProvider", last_success: "stub", last_failure: null, error_rate: null, latency_ms: 0, quota: "n/a", notes: "Not a licensed VIN decoder." },
  { provider: "seed-transport-snapshot", last_success: "2026-09-01", last_failure: null, error_rate: 0, latency_ms: 0, quota: "n/a", notes: "Static fares/fuel. No live rail/flight API." },
  { provider: "oem-power-specs", last_success: "2026-06-01", last_failure: null, error_rate: 0, latency_ms: 0, quota: "n/a", notes: "Compiled PDOs. No lab harness." },
];

export function freshnessBuckets() {
  const store = buildCatalog();
  const buckets = { fresh: 0, aging: 0, stale: 0, expired: 0 };
  for (const rel of store.relations.values()) {
    const rec = rel.provenance[0];
    if (!rec) {
      buckets.stale += 1;
      continue;
    }
    if (rec.valid_until && !isFresh(rec)) {
      buckets.expired += 1;
      continue;
    }
    const ageDays = (Date.now() - new Date(rec.retrieved_at).getTime()) / 86400000;
    if (ageDays < 45) buckets.fresh += 1;
    else if (ageDays < 180) buckets.aging += 1;
    else buckets.stale += 1;
  }
  return buckets;
}

export function demandBreakdown() {
  const store = buildCatalog();
  const counts: Record<DemandSourceKind, number> = {
    GSC_OBSERVED: 0,
    KEYWORD_PROVIDER: 0,
    AUTOCOMPLETE: 0,
    SERP_EXISTENCE: 0,
    INTERNAL_SEARCH: 0,
    EDITORIAL_JUDGMENT: 0,
    UNKNOWN: 0,
  };
  const v2_sources: Record<DemandEvidenceSource, number> = {
    SERP: 0,
    AUTOCOMPLETE: 0,
    RELATED_SEARCH: 0,
    PAA: 0,
    GOOGLE_TRENDS: 0,
    KEYWORD_PLANNER: 0,
    KEYWORD_PROVIDER: 0,
    GSC: 0,
    INTERNAL_SEARCH: 0,
    PRODUCT_USAGE: 0,
    EDITORIAL: 0,
  };
  for (const page of store.pages.values()) {
    const assessment = page.structured_payload.demand_assessment as DemandAssessmentV2 | undefined;
    const live = (assessment?.evidence ?? []).filter((row) => row.source !== "EDITORIAL" && row.observed && !row.expired);
    if (!live.length) counts.EDITORIAL_JUDGMENT += 1;
    else if (live.some((row) => row.source === "GSC")) counts.GSC_OBSERVED += 1;
    else if (live.some((row) => row.source === "INTERNAL_SEARCH" || row.source === "PRODUCT_USAGE")) {
      counts.INTERNAL_SEARCH += 1;
    } else if (live.some((row) => row.source === "KEYWORD_PROVIDER" || row.source === "KEYWORD_PLANNER")) {
      counts.KEYWORD_PROVIDER += 1;
    } else if (live.some((row) => row.source === "AUTOCOMPLETE")) counts.AUTOCOMPLETE += 1;
    else if (live.some((row) => row.source === "SERP")) counts.SERP_EXISTENCE += 1;
    else counts.UNKNOWN += 1;
    for (const row of assessment?.evidence ?? []) {
      v2_sources[row.source] += 1;
    }
  }
  return { ...counts, v2_sources };
}

export function pageQualityReport() {
  const store = buildCatalog();
  const dups = duplicateReport(0.8);
  return [...store.pages.values()].map((page) => {
    const sibling = dups.find((row) => row.a === page.url || row.b === page.url);
    const weakness =
      page.index_state === "INDEXABLE" && page.quality_score >= 85
        ? "STRONG"
        : page.index_state === "INDEXABLE"
          ? "OK"
          : page.index_state === "NOINDEX_PRODUCT"
            ? "WEAK"
            : sibling && sibling.action !== "KEEP"
              ? "DUPLICATE"
              : "UNSUPPORTED";
    return {
      site: page.site,
      url: page.url,
      quality_score: page.quality_score,
      index_state: page.index_state,
      demand: page.search_demand,
      demand_kind: (page.index_state === "INDEXABLE" ? "UNKNOWN" : "EDITORIAL_JUDGMENT") as DemandSourceKind,
      structured_data_count: Object.keys(page.structured_payload).length,
      closest_sibling: sibling ? (sibling.a === page.url ? sibling.b : sibling.a) : null,
      similarity: sibling?.similarity ?? null,
      source_count: page.entity_ids.length,
      distinct_reason: page.structured_payload.distinct_reason ?? null,
      weakness,
    };
  });
}

export function opportunityQueue() {
  return [
    {
      site: "fixcode",
      query: "Whirlpool washer F8 E1",
      action: "DO_NOT_AUTO_CREATE — no verified brand dataset",
      score: opportunityScore({
        search_demand: 70,
        data_completeness: 5,
        monetization_potential: 70,
        product_utility: 90,
        competition_difficulty: 40,
        data_gap: 95,
        acquisition_cost: 80,
      }),
    },
    {
      site: "chargematch",
      query: "independent lab watts for Anker 100W + Steam Deck",
      action: "MEASURE — do not publish as independently tested",
      score: opportunityScore({
        search_demand: 75,
        data_completeness: 40,
        monetization_potential: 60,
        product_utility: 90,
        competition_difficulty: 45,
        data_gap: 80,
        acquisition_cost: 50,
      }),
    },
    {
      site: "tripcost",
      query: "live SNCF Paris–Lyon fares",
      action: "CONTRACT API — keep snapshot label until then",
      score: opportunityScore({
        search_demand: 88,
        data_completeness: 30,
        monetization_potential: 80,
        product_utility: 85,
        competition_difficulty: 55,
        data_gap: 90,
        acquisition_cost: 70,
      }),
    },
  ].sort((a, b) => b.score - a.score);
}

export function publicationLayer(page: PageRecord) {
  if (page.index_state === "GRAPH_ONLY") return "GRAPH_ONLY";
  if (page.index_state === "NOINDEX_PRODUCT") return "PRODUCT_ONLY";
  if (page.index_state === "INDEXABLE" && page.publish_state !== "PUBLISHED") return "SEO_CANDIDATE";
  if (page.index_state === "INDEXABLE") return "INDEXABLE";
  return page.index_state;
}

export function currentManifest() {
  return [...buildCatalog().pages.values()].map((page) => page.url).sort();
}

export function staleGeneratedRoutes(previous: string[], current = currentManifest()) {
  return previous.filter((url) => !current.includes(url));
}

export function sitemapConsistencyIssues() {
  const live = process.env.PUBLIC_SITE_LIVE === "true";
  if (!live) {
    return { issues: [] as string[], note: "PUBLIC_SITE_LIVE=false — sitemap must stay empty; prelaunch noindex." };
  }
  const issues: string[] = [];
  for (const page of buildCatalog().pages.values()) {
    if (page.index_state === "INDEXABLE" && page.publish_state === "PUBLISHED" && !page.noindex) {
      if (page.canonical !== page.url) issues.push(`${page.url} canonical mismatch`);
    }
  }
  return { issues, note: "live mode" };
}

export function fullOpsPayload() {
  return {
    launch: launchReport(),
    coverage: coverageReport(),
    demand: demandBreakdown(),
    freshness: freshnessBuckets(),
    duplicates: duplicateReport(0.85).slice(0, 50),
    opportunity: opportunityQueue(),
    ai_usage: AI_USAGE_AUDIT,
    licensing: DATA_LICENSING,
    providers: PROVIDER_HEALTH,
    tools_declared: SITE_AI_TOOLS,
    sitemap: sitemapConsistencyIssues(),
  };
}

export { populateDecisionGraph, entity, rel } from "./graph-depth";
export { classifyDemand };
export { applyIndexGates, nearestNeighbors, similarityReport, resetDemandCache, loadDemandEvidence } from "./index-recompute";

import type { GraphStore, IndexState, PageRecord } from "@penta/graph-core";
import { classifyRelation, classifyEntityDepth } from "@penta/graph-core";
import {
  evaluatePageQuality,
  intentFamilyId,
  outputSimilarity,
  structuredSimilarity,
  densityRequired,
  type PageQualityInput,
  type SearchDemandEvidence,
} from "@penta/quality-gate";
import { isFresh } from "@penta/data-provenance";

export type NeighborRow = {
  url: string;
  structured: number;
  intent: number;
  output: number;
  unique_facts: string[];
  pass: boolean;
};

function demandEvidence(page: PageRecord): SearchDemandEvidence {
  // PageRecord.search_demand is already the output of searchDemandScore().
  // Passing that number back as seed_research would apply the 0.4 editorial cap twice.
  return { seed_research: Math.min(100, Math.round(page.search_demand / 0.4)) };
}

function pageRelations(store: GraphStore, page: PageRecord) {
  return page.entity_ids.flatMap((id) => store.related(id));
}

export function nearestNeighbors(store: GraphStore, page: PageRecord, n = 5): NeighborRow[] {
  const pages = [...store.pages.values()].filter((other) => other.site === page.site && other.url !== page.url);
  return pages
    .map((other) => {
      const structured = structuredSimilarity(page.structured_payload, other.structured_payload);
      const sameIntent = intentFamilyId(page) === intentFamilyId(other);
      const intent = sameIntent ? Math.max(0.9, structured) : page.family === other.family ? structured : 0.2;
      const output = outputSimilarity(page.structured_payload, other.structured_payload);
      const factsA = new Set(Object.keys(page.structured_payload));
      const factsB = new Set(Object.keys(other.structured_payload));
      const unique_facts = [...factsA].filter((k) => JSON.stringify(page.structured_payload[k]) !== JSON.stringify(other.structured_payload[k]));
      const pass = !(structured > 0.85 && sameIntent && output >= 0.8 && unique_facts.length < 2);
      void factsB;
      return { url: other.url, structured, intent, output, unique_facts, pass };
    })
    .sort((a, b) => b.structured + b.intent - (a.structured + a.intent))
    .slice(0, n);
}

function densityOk(store: GraphStore, page: PageRecord): boolean {
  const rels = pageRelations(store, page).filter((r) => classifyRelation(r) === "DECISION_RELEVANT");
  for (const id of page.entity_ids) {
    const entity = store.get(id);
    if (!entity) continue;
    const need = densityRequired(entity.type);
    if (need == null) continue;
    const degree = rels.filter((r) => r.from_id === id || r.to_id === id).length;
    if (degree < need && classifyEntityDepth(entity.type, store.related(id).length) !== "RICH") {
      if (degree < need) return false;
    }
  }
  return true;
}

function brokenRelations(store: GraphStore, page: PageRecord): boolean {
  return pageRelations(store, page).some((rel) => !store.entities.has(rel.from_id) || !store.entities.has(rel.to_id));
}

function staleCurrent(store: GraphStore, page: PageRecord): boolean {
  if (page.site !== "tripcost" && page.site !== "wearthere") return false;
  if (page.structured_payload.kind === "FORECAST" && page.family === "wear-month") return true;
  return pageRelations(store, page).some((rel) => {
    const until = rel.provenance[0]?.valid_until;
    if (!until) return false;
    return !isFresh(rel.provenance[0]) && rel.properties.family === "VOLATILE" && rel.properties.presented_as_current === true;
  });
}

function qualityInputFromGraph(store: GraphStore, page: PageRecord, neighbor: NeighborRow | undefined): PageQualityInput {
  const ents = page.entity_ids.map((id) => store.get(id)).filter(Boolean);
  const rels = pageRelations(store, page);
  const decision = rels.filter((r) => classifyRelation(r) === "DECISION_RELEVANT");
  const provenance_valid = ents.some((e) => (e?.provenance.length ?? 0) > 0) || rels.some((r) => r.provenance.length > 0);
  const aiAsOfficial = [...ents, ...rels].some((row) =>
    row!.provenance.some((p) => p.source_type === "AI_INFERRED" && (p.notes ?? "").toLowerCase().includes("official")),
  );
  const conflict = store.conflicts.some((c) => page.entity_ids.includes(c.entity_id));
  const retrieved = ents.flatMap((e) => e!.provenance.map((p) => p.retrieved_at)).sort()[0] ?? page.freshness;
  const freshness_days = retrieved
    ? Math.max(0, Math.round((Date.now() - new Date(retrieved).getTime()) / 86400000))
    : 60;
  const unique = new Set([
    ...Object.keys(page.structured_payload),
    ...ents.flatMap((e) => Object.keys(e!.properties)),
  ]).size;
  const requiredTotal = page.family === "error-code" ? 9 : 8;
  const requiredPresent = Math.min(requiredTotal, unique);
  const product_action =
    page.family === "error-code" ||
    page.family === "symptom" ||
    page.family.includes("oil") ||
    page.family === "vehicle-hub" ||
    page.family === "wear-month" ||
    page.family === "packing-month" ||
    page.family === "can-charger-charge" ||
    page.family.startsWith("route") ||
    page.family === "device-wattage" ||
    page.family === "device-hub" ||
    page.family === "maintenance-schedule" ||
    page.family === "tyre-pressure" ||
    page.family === "battery" ||
    page.family === "common-problems" ||
    page.family === "recalls" ||
    page.family === "appliance-hub";

  return {
    site: page.site,
    family: page.family,
    unique_fields: unique,
    required_fields_present: requiredPresent,
    required_fields_total: requiredTotal,
    search_demand: demandEvidence(page),
    product_cta: product_action,
    interactive: product_action,
    distinct_from_parent: true,
    near_duplicate: neighbor ? !neighbor.pass : false,
    year_only_variant: false,
    city_without_specifics: page.site === "wearthere" && !page.structured_payload.tmin_c && page.family === "wear-month",
    obscure_without_demand: page.search_demand < 15,
    llm_filler: false,
    confidence: ents[0]?.confidence ?? "MEDIUM",
    freshness_days,
    freshness_ttl_days: page.site === "tripcost" ? 30 : 365,
    provenance_valid,
    distinct_reason: String(page.structured_payload.distinct_reason ?? page.id),
    stale_presented_as_current: staleCurrent(store, page),
    unresolved_critical_conflict: conflict,
    ai_inferred_as_official: aiAsOfficial,
    placeholder: !page.title.trim() || page.title.includes("TODO"),
    broken_relations: brokenRelations(store, page),
    invented_data: false,
    depends_on_self_declared_score: false,
    http_viable: page.url.startsWith("/") && page.canonical === page.url,
    sitemap_robots_ok: page.canonical === page.url,
    product_action,
    sibling_structured_similarity: neighbor?.structured,
    same_intent_sibling: neighbor ? neighbor.intent >= 0.9 : false,
    same_decision_output: neighbor ? neighbor.output >= 0.8 : false,
    density_ok: densityOk(store, page),
    verified_fact_count: ents.filter((e) =>
      e!.provenance.some((p) => ["OFFICIAL", "MANUFACTURER", "REGULATORY", "TESTED"].includes(p.source_type)),
    ).length + decision.filter((r) => !r.inferred).length,
    decision_relation_count: decision.length,
    canonical_self_valid: page.canonical === page.url && Boolean(page.canonical),
    forecast_as_climate: page.structured_payload.kind === "FORECAST" && page.family === "wear-month",
    engine_undetermined:
      page.site === "autospec" &&
      page.family !== "vehicle-hub" &&
      !page.structured_payload.engine &&
      !page.structured_payload.vehicle,
    hub_necessity: page.family.includes("hub"),
  };
}

export function applyIndexGates(store: GraphStore): void {
  const neighborMap = new Map<string, NeighborRow[]>();
  for (const page of store.pages.values()) {
    neighborMap.set(page.url, nearestNeighbors(store, page, 5));
  }
  for (const page of store.pages.values()) {
    const neighbors = neighborMap.get(page.url) ?? [];
    const worst = neighbors.find((n) => !n.pass);
    const result = evaluatePageQuality(qualityInputFromGraph(store, page, worst ?? neighbors[0]));
    let state: IndexState = result.index_state;
    if (page.review_required && state === "INDEXABLE") state = "REVIEW_REQUIRED";
    page.quality_score = result.score;
    page.index_state = state;
    page.noindex = state !== "INDEXABLE";
    page.publish_state = state === "INDEXABLE" ? "PUBLISHED" : "DRAFT";
    page.structured_payload = {
      ...page.structured_payload,
      quality_why: result.why,
      nearest_sibling: neighbors[0]?.url ?? null,
      neighbor_structured: neighbors[0]?.structured ?? null,
      hard_blockers: result.blockers,
    };
  }
}

export function similarityReport(store: GraphStore) {
  return [...store.pages.values()]
    .filter((page) => page.index_state === "INDEXABLE" || page.structured_payload.nearest_sibling)
    .map((page) => {
      const neighbors = nearestNeighbors(store, page, 5);
      const nearest = neighbors[0];
      return {
        page: page.url,
        nearest_sibling: nearest?.url ?? null,
        structured_similarity: nearest?.structured ?? 0,
        intent_similarity: nearest?.intent ?? 0,
        unique_facts: nearest?.unique_facts ?? [],
        unique_decision_output: nearest ? nearest.output < 0.8 : true,
        pass: nearest?.pass ?? true,
        index_state: page.index_state,
      };
    });
}

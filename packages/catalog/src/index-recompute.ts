import type { GraphStore, IndexState, PageRecord } from "@penta/graph-core";
import { classifyRelation, classifyEntityDepth } from "@penta/graph-core";
import {
  evaluatePageQuality,
  intentFamilyId,
  outputSimilarity,
  structuredSimilarity,
  densityRequired,
  climateDeltaVsAdjacent,
  countVerifiedExact,
  detectProductAction,
  type PageQualityInput,
  type SearchDemandEvidence,
} from "@penta/quality-gate";
import { isFresh, isGenericSourceUrl, validateFactProvenance } from "@penta/data-provenance";

export type NeighborRow = {
  url: string;
  structured: number;
  intent: number;
  output: number;
  unique_facts: string[];
  pass: boolean;
};

function demandEvidence(page: PageRecord): SearchDemandEvidence {
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
      const unique_facts = [...factsA].filter(
        (k) => JSON.stringify(page.structured_payload[k]) !== JSON.stringify(other.structured_payload[k]),
      );
      const pass = !(structured > 0.85 && sameIntent && output >= 0.8 && unique_facts.length < 2);
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

function parentPage(store: GraphStore, page: PageRecord): PageRecord | undefined {
  if (page.family === "wear-month") {
    const slug = String(page.structured_payload.slug ?? "");
    return [...store.pages.values()].find(
      (p) =>
        p.site === "wearthere" &&
        p.family === "destination-hub" &&
        (p.structured_payload.slug === slug || p.url === `/wearthere/${slug}`),
    );
  }
  if (page.family === "can-charger-charge") {
    const device = String(page.structured_payload.device ?? "");
    return [...store.pages.values()].find((p) => p.url === `/chargematch/${device}`);
  }
  if (page.family === "error-code") {
    const brand = String(page.structured_payload.brand ?? "").toLowerCase();
    const appliance = String(page.structured_payload.appliance ?? "").toLowerCase();
    return [...store.pages.values()].find((p) => p.family === "appliance-hub" && p.url.endsWith(`/${brand}/${appliance}`));
  }
  return undefined;
}

function qualityInputFromGraph(store: GraphStore, page: PageRecord, neighbor: NeighborRow | undefined): PageQualityInput {
  const ents = page.entity_ids.map((id) => store.get(id)).filter(Boolean);
  const rels = pageRelations(store, page);
  const decision = rels.filter((r) => classifyRelation(r) === "DECISION_RELEVANT");
  const parent = parentPage(store, page);
  const action = detectProductAction(page.family, page.structured_payload);
  const urls = [
    ...ents.flatMap((e) => e!.provenance.map((p) => p.source_url)),
    ...rels.flatMap((r) => r.provenance.map((p) => p.source_url)),
  ].filter((u): u is string => Boolean(u));
  const exactUrls = urls.filter((u) => !isGenericSourceUrl(u));
  const verifiedExact = countVerifiedExact(rels);
  const provenance_valid =
    exactUrls.length > 0 ||
    verifiedExact > 0 ||
    rels.some((r) => {
      const rec = r.provenance[0];
      if (!rec) return false;
      const v = validateFactProvenance({
        source_type: rec.source_type,
        source_url: rec.source_url,
        source_name: rec.source_name,
        retrieved_at: rec.retrieved_at,
        verified_at: rec.verified_at,
        verification_method: rec.verification_method,
        inferred: r.inferred,
      });
      return v.valid && v.level !== "PRIMARY_GENERAL" && v.level !== "UNKNOWN";
    }) ||
    ents.some((e) =>
      e!.provenance.some((p) => {
        const v = validateFactProvenance({
          source_type: p.source_type,
          source_url: p.source_url,
          source_name: p.source_name,
          retrieved_at: p.retrieved_at,
          verified_at: p.verified_at,
          verification_method: p.verification_method,
        });
        return v.level !== "UNKNOWN" && !v.generic_url;
      }),
    );
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
  const wearSiblings =
    page.site === "wearthere" && page.family === "wear-month"
      ? [...store.pages.values()].filter((p) => p.site === "wearthere" && p.family === "wear-month")
      : [];
  const climate = wearSiblings.length ? climateDeltaVsAdjacent(page, wearSiblings) : undefined;

  return {
    site: page.site,
    family: page.family,
    page_id: page.id,
    title: page.title,
    structured_payload: page.structured_payload,
    parent_id: parent?.id,
    parent_payload: parent?.structured_payload,
    unique_fields: unique,
    required_fields_present: 0,
    required_fields_total: 1,
    search_demand: demandEvidence(page),
    product_cta: action.present,
    interactive: action.present,
    product_action: action.present,
    distinct_from_parent: false,
    near_duplicate: neighbor ? !neighbor.pass : false,
    year_only_variant: false,
    city_without_specifics: page.site === "wearthere" && !page.structured_payload.tmin_c && page.family === "wear-month",
    obscure_without_demand: page.search_demand < 15,
    llm_filler: false,
    confidence: ents[0]?.confidence ?? "MEDIUM",
    freshness_days,
    freshness_ttl_days: page.site === "tripcost" ? 30 : 365,
    provenance_valid,
    provenance_urls: urls,
    distinct_reason:
      typeof page.structured_payload.distinct_reason === "string" &&
      page.structured_payload.distinct_reason !== page.id
        ? String(page.structured_payload.distinct_reason)
        : undefined,
    stale_presented_as_current: staleCurrent(store, page),
    unresolved_critical_conflict: conflict,
    ai_inferred_as_official: aiAsOfficial,
    placeholder: !page.title.trim() || page.title.includes("TODO"),
    broken_relations: brokenRelations(store, page),
    invented_data: false,
    depends_on_self_declared_score: false,
    http_viable: page.url.startsWith("/") && page.canonical === page.url,
    sitemap_robots_ok: page.canonical === page.url,
    sibling_structured_similarity: neighbor?.structured,
    same_intent_sibling: neighbor ? neighbor.intent >= 0.9 : false,
    same_decision_output: neighbor ? neighbor.output >= 0.8 : false,
    density_ok: densityOk(store, page),
    verified_fact_count: verifiedExact,
    decision_relation_count: decision.length,
    canonical_self_valid: page.canonical === page.url && Boolean(page.canonical),
    forecast_as_climate: page.structured_payload.kind === "FORECAST" && page.family === "wear-month",
    engine_undetermined:
      page.site === "autospec" &&
      page.family !== "vehicle-hub" &&
      !page.structured_payload.engine &&
      !page.structured_payload.vehicle,
    hub_necessity: page.family.includes("hub"),
    wearthere_climate_delta_c: climate?.climate_delta_c,
    wearthere_rain_delta: climate?.rain_delta,
  };
}

function publishState(state: IndexState): PageRecord["publish_state"] {
  if (state === "INDEXABLE") return "PUBLISHED";
  if (state === "SEO_CANDIDATE") return "READY";
  return "DRAFT";
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
    page.publish_state = publishState(state);
    page.structured_payload = {
      ...page.structured_payload,
      quality_why: result.why,
      nearest_sibling: neighbors[0]?.url ?? null,
      neighbor_structured: neighbors[0]?.structured ?? null,
      hard_blockers: result.blockers,
      gate_evidence: result.gate_evidence,
      axes: result.axes,
    };
  }
}

export function similarityReport(store: GraphStore) {
  return [...store.pages.values()]
    .filter((page) => page.index_state === "INDEXABLE" || page.index_state === "SEO_CANDIDATE" || page.structured_payload.nearest_sibling)
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

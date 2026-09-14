import type { GraphRelation, IndexState, PageRecord, SiteId } from "@penta/graph-core";
import {
  confidenceLevelFromScore,
  isFresh,
  sourceRank,
  type ConfidenceLevel,
} from "@penta/data-provenance";

export type QualityDimension =
  | "intent_strength"
  | "unique_structured_data"
  | "decision_utility"
  | "graph_depth"
  | "provenance"
  | "completeness"
  | "differentiation"
  | "freshness";

export type QualityBreakdown = Record<QualityDimension, number>;

export type DemandSourceKind =
  | "GSC_OBSERVED"
  | "KEYWORD_PROVIDER"
  | "AUTOCOMPLETE"
  | "SERP_EXISTENCE"
  | "INTERNAL_SEARCH"
  | "EDITORIAL_JUDGMENT"
  | "UNKNOWN";

export type DemandClassification = {
  kind: DemandSourceKind;
  score: number;
  confidence: ConfidenceLevel;
};

export type HardGateId =
  | "identifiable_intent"
  | "valid_canonical"
  | "critical_data_present"
  | "minimum_provenance"
  | "no_unresolved_critical_conflict"
  | "no_stale_current"
  | "no_ai_inferred_as_official"
  | "distinct_from_sibling"
  | "product_action"
  | "no_placeholder"
  | "no_broken_relations"
  | "no_invented_data"
  | "no_self_declared_score"
  | "http_viable"
  | "sitemap_robots_coherent"
  | "not_llm_safety_claim"
  | "engine_determined"
  | "causes_sourced"
  | "density_sufficient"
  | "unique_structured_data"
  | "valid_source"
  | "no_critical_unknown"
  | "not_duplicate"
  | "valid_canonical_fields"
  | "no_invented_claims"
  | "no_safety_issue"
  | "no_llm_filler"
  | "not_year_only"
  | "not_city_without_specifics"
  | "not_obscure_without_demand"
  | "not_forecast_as_climate"
  | "not_stale_as_current"
  | "no_critical_missing_facts"
  | "explicit_entity_identity"
  | "data_confidence_sufficient"
  | "actual_user_intent"
  | "actual_product_utility"
  | "unverified_specs";

export type HardGateResult = { id: HardGateId; passed: boolean; detail: string };

export type QualityResult = {
  score: number;
  breakdown: QualityBreakdown;
  index_state: IndexState;
  reasons: string[];
  blockers: string[];
  hard_gates: HardGateResult[];
  demand: DemandClassification;
  why: string;
};

export type SearchDemandEvidence = {
  gsc?: number;
  autocomplete?: number;
  keyword_provider?: number;
  internal_search?: number;
  user_questions?: number;
  competitor_coverage?: number;
  impression_discovery?: number;
  related_queries?: number;
  seed_research?: number;
};

export type PageQualityInput = {
  site: SiteId;
  family: string;
  unique_fields: number;
  required_fields_present: number;
  required_fields_total: number;
  search_demand: SearchDemandEvidence;
  product_cta: boolean;
  interactive: boolean;
  distinct_from_parent: boolean;
  near_duplicate: boolean;
  year_only_variant: boolean;
  city_without_specifics: boolean;
  obscure_without_demand: boolean;
  llm_filler: boolean;
  confidence: ConfidenceLevel;
  freshness_days: number;
  freshness_ttl_days: number;
  provenance_valid: boolean;
  hub_necessity?: boolean;
  distinct_reason?: string;
  forecast_as_climate?: boolean;
  llm_safety_claim?: boolean;
  stale_presented_as_current?: boolean;
  engine_undetermined?: boolean;
  causes_without_source?: boolean;
  unverified_specs?: boolean;
  verified_fact_count?: number;
  decision_relation_count?: number;
  word_count?: number;
  title_unique?: boolean;
  internal_link_count?: number;
  site_rules?: (input: PageQualityInput) => { delta: number; reasons: string[]; blockers: string[] };
  canonical_self_valid?: boolean;
  unresolved_critical_conflict?: boolean;
  ai_inferred_as_official?: boolean;
  placeholder?: boolean;
  broken_relations?: boolean;
  invented_data?: boolean;
  depends_on_self_declared_score?: boolean;
  http_viable?: boolean;
  sitemap_robots_ok?: boolean;
  product_action?: boolean;
  sibling_structured_similarity?: number;
  same_intent_sibling?: boolean;
  same_decision_output?: boolean;
  density_ok?: boolean;
  hazard_known?: boolean;
  diy_boundary?: boolean;
  /** Soft-score only. Never used as a hard proof. */
  stored_quality_score?: number;
};

const DIMENSION_MAX: QualityBreakdown = {
  intent_strength: 15,
  unique_structured_data: 15,
  decision_utility: 20,
  graph_depth: 15,
  provenance: 15,
  completeness: 10,
  differentiation: 5,
  freshness: 5,
};

const EDITORIAL_SCORE_CAP = 84;

export const INDEXABLE_THRESHOLD = 80;

export function classifyDemand(evidence: SearchDemandEvidence): DemandClassification {
  if (typeof evidence.gsc === "number") {
    return { kind: "GSC_OBSERVED", score: clamp100(evidence.gsc), confidence: evidence.gsc >= 60 ? "HIGH" : "MEDIUM" };
  }
  if (typeof evidence.internal_search === "number" || typeof evidence.user_questions === "number") {
    const score = clamp100(evidence.internal_search ?? evidence.user_questions ?? 0);
    return { kind: "INTERNAL_SEARCH", score, confidence: score >= 60 ? "HIGH" : "MEDIUM" };
  }
  if (typeof evidence.keyword_provider === "number") {
    return { kind: "KEYWORD_PROVIDER", score: clamp100(evidence.keyword_provider), confidence: "MEDIUM" };
  }
  if (typeof evidence.autocomplete === "number") {
    return { kind: "AUTOCOMPLETE", score: clamp100(evidence.autocomplete), confidence: "MEDIUM" };
  }
  if (typeof evidence.competitor_coverage === "number") {
    return { kind: "SERP_EXISTENCE", score: clamp100(evidence.competitor_coverage), confidence: "MEDIUM" };
  }
  if (typeof evidence.seed_research === "number") {
    return {
      kind: "EDITORIAL_JUDGMENT",
      score: Math.min(40, Math.round(evidence.seed_research * 0.4)),
      confidence: "LOW",
    };
  }
  return { kind: "UNKNOWN", score: 0, confidence: "UNKNOWN" };
}

export function searchDemandScore(evidence: SearchDemandEvidence): number {
  return classifyDemand(evidence).score;
}

export function opportunityScore(input: {
  search_demand: number;
  data_completeness: number;
  monetization_potential: number;
  product_utility: number;
  competition_difficulty: number;
  data_gap?: number;
  acquisition_cost?: number;
}): number {
  const difficulty = Math.max(1, input.competition_difficulty);
  const gap = input.data_gap ?? 50;
  const acq = Math.max(1, input.acquisition_cost ?? 50);
  return Math.round(
    (input.search_demand *
      input.data_completeness *
      input.monetization_potential *
      input.product_utility *
      gap) /
      difficulty /
      acq /
      10000,
  );
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function gate(id: HardGateId, passed: boolean, detail: string): HardGateResult {
  return { id, passed, detail };
}

export function evaluatePageQuality(input: PageQualityInput): QualityResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const demand = classifyDemand(input.search_demand);
  input = {
    forecast_as_climate: false,
    llm_safety_claim: false,
    stale_presented_as_current: false,
    engine_undetermined: false,
    causes_without_source: false,
    unverified_specs: false,
    canonical_self_valid: true,
    unresolved_critical_conflict: false,
    ai_inferred_as_official: false,
    placeholder: false,
    broken_relations: false,
    invented_data: false,
    depends_on_self_declared_score: false,
    http_viable: true,
    sitemap_robots_ok: true,
    density_ok: true,
    ...input,
  };

  const missingCritical =
    input.required_fields_present / Math.max(1, input.required_fields_total) < 0.75;
  const productAction = input.product_action ?? (input.product_cta || input.interactive);
  const siblingTooClose =
    (input.sibling_structured_similarity ?? 0) > 0.85 &&
    Boolean(input.same_intent_sibling) &&
    Boolean(input.same_decision_output);
  const distinctOk =
    !siblingTooClose &&
    !(input.near_duplicate && !input.distinct_reason) &&
    !input.year_only_variant;

  const intentIdentifiable = demand.kind !== "UNKNOWN" || Boolean(input.hub_necessity);

  const hard_gates: HardGateResult[] = [
    gate("identifiable_intent", intentIdentifiable, demand.kind),
    gate("valid_canonical", Boolean(input.family) && input.canonical_self_valid !== false, input.family || "missing family"),
    gate("critical_data_present", !missingCritical, `${input.required_fields_present}/${input.required_fields_total}`),
    gate("minimum_provenance", input.provenance_valid, input.provenance_valid ? "provenance present" : "missing provenance"),
    gate(
      "no_unresolved_critical_conflict",
      !input.unresolved_critical_conflict,
      input.unresolved_critical_conflict ? "unresolved critical conflict" : "no critical conflict",
    ),
    gate("no_stale_current", !input.stale_presented_as_current, "freshness claim"),
    gate("no_ai_inferred_as_official", !input.ai_inferred_as_official, "AI_INFERRED ≠ OFFICIAL"),
    gate("distinct_from_sibling", distinctOk, input.distinct_reason ?? "sibling check"),
    gate("product_action", productAction, productAction ? "tool or CTA" : "no product utility"),
    gate("no_placeholder", !input.placeholder && !input.llm_filler, "placeholder/filler"),
    gate("no_broken_relations", !input.broken_relations, "broken relations"),
    gate(
      "no_invented_data",
      !input.invented_data && !input.llm_filler && !input.unverified_specs,
      "invented/unverified",
    ),
    gate("no_self_declared_score", !input.depends_on_self_declared_score, "self-declared score ignored"),
    gate("http_viable", input.http_viable !== false, "http"),
    gate("sitemap_robots_coherent", input.sitemap_robots_ok !== false, "sitemap/robots"),
    gate("not_llm_safety_claim", !input.llm_safety_claim, "llm safety claim"),
    gate("engine_determined", !input.engine_undetermined, "engine identity"),
    gate("causes_sourced", !input.causes_without_source, "cause sources"),
    gate("density_sufficient", input.density_ok !== false, "relation density"),
    gate("unique_structured_data", input.unique_fields >= 4, `${input.unique_fields} unique fields`),
    gate("valid_source", input.provenance_valid, input.provenance_valid ? "provenance present" : "missing provenance"),
    gate("no_critical_unknown", demand.confidence !== "UNKNOWN" || Boolean(input.hub_necessity), demand.kind),
    gate("not_duplicate", distinctOk, input.distinct_reason ?? "no distinct_reason"),
    gate("valid_canonical_fields", Boolean(input.family), input.family || "missing family"),
    gate(
      "explicit_entity_identity",
      Boolean(input.family) && (Boolean(input.distinct_reason) || input.unique_fields >= 6),
      input.distinct_reason ?? input.family,
    ),
    gate("no_invented_claims", !input.llm_filler && !input.invented_data, "llm_filler"),
    gate("no_safety_issue", !input.llm_safety_claim, "llm safety claim"),
    gate("no_llm_filler", !input.llm_filler, "filler"),
    gate("not_year_only", !input.year_only_variant, "year-only variant"),
    gate("not_city_without_specifics", !input.city_without_specifics, "city specifics"),
    gate("not_obscure_without_demand", !input.obscure_without_demand, "obscure combo"),
    gate("not_forecast_as_climate", !input.forecast_as_climate, "climate vs forecast"),
    gate("not_stale_as_current", !input.stale_presented_as_current, "freshness claim"),
    gate("no_critical_missing_facts", !missingCritical, `${input.required_fields_present}/${input.required_fields_total}`),
    gate(
      "data_confidence_sufficient",
      input.confidence === "HIGH" ||
        input.confidence === "MEDIUM" ||
        (input.confidence === "LOW" && Boolean(input.hub_necessity)),
      input.confidence,
    ),
    gate("actual_user_intent", intentIdentifiable, demand.kind),
    gate("actual_product_utility", productAction, productAction ? "tool or CTA" : "no product utility"),
    gate("unverified_specs", !input.unverified_specs, "specs"),
  ];

  for (const row of hard_gates) {
    if (!row.passed) blockers.push(`HARD:${row.id}`);
  }

  if (input.llm_filler) blockers.push("LLM filler is forbidden");
  if (!input.provenance_valid) blockers.push("Missing or invalid provenance");
  if (input.year_only_variant) blockers.push("Year-only variant without technical change");
  if (input.city_without_specifics) blockers.push("City page without destination-specific data");
  if (input.obscure_without_demand) blockers.push("Obscure combination with unknown demand");
  if (demand.kind === "EDITORIAL_JUDGMENT") {
    reasons.push("Demand is editorial judgment — capped, not treated as observed search.");
  }
  if (demand.kind === "UNKNOWN") reasons.push("Search demand unknown — cannot auto-index");
  void input.word_count;
  void input.title_unique;
  void input.internal_link_count;
  void input.stored_quality_score;

  const intent_strength = clamp((demand.score / 100) * DIMENSION_MAX.intent_strength, DIMENSION_MAX.intent_strength);
  const unique_structured_data = clamp(
    (input.unique_fields / 10) * DIMENSION_MAX.unique_structured_data,
    DIMENSION_MAX.unique_structured_data,
  );
  let decision_utility = input.product_cta ? 10 : 2;
  if (input.interactive) decision_utility += 10;
  decision_utility = clamp(decision_utility, DIMENSION_MAX.decision_utility);

  const decisionCount = input.decision_relation_count ?? 0;
  const graph_depth = clamp((decisionCount / 10) * DIMENSION_MAX.graph_depth, DIMENSION_MAX.graph_depth);

  const verifiedCount = input.verified_fact_count ?? Math.min(input.unique_fields, 4);
  let provenancePts = input.provenance_valid ? 8 : 0;
  if (input.confidence === "HIGH") provenancePts += 7;
  else if (input.confidence === "MEDIUM") provenancePts += 5;
  else if (input.confidence === "LOW") provenancePts += 2;
  if (verifiedCount >= 6) provenancePts = Math.min(15, provenancePts + 2);
  const provenanceScore = clamp(provenancePts, DIMENSION_MAX.provenance);

  const completeness = clamp(
    (input.required_fields_present / Math.max(1, input.required_fields_total)) * DIMENSION_MAX.completeness,
    DIMENSION_MAX.completeness,
  );

  let differentiation = input.distinct_from_parent ? 4 : 1;
  if (input.near_duplicate || input.year_only_variant || siblingTooClose) differentiation = 1;
  if (input.distinct_reason && input.distinct_reason.length > 8) differentiation = Math.max(differentiation, 4);
  differentiation = clamp(differentiation, DIMENSION_MAX.differentiation);

  const freshnessRatio = Math.max(0, 1 - input.freshness_days / Math.max(1, input.freshness_ttl_days * 2));
  const freshness = clamp(freshnessRatio * DIMENSION_MAX.freshness, DIMENSION_MAX.freshness);

  const site = input.site_rules?.(input) ?? { delta: 0, reasons: [], blockers: [] };
  reasons.push(...site.reasons);
  blockers.push(...site.blockers);

  const breakdown: QualityBreakdown = {
    intent_strength: round1(intent_strength),
    unique_structured_data: round1(unique_structured_data),
    decision_utility: round1(decision_utility),
    graph_depth: round1(graph_depth),
    provenance: round1(provenanceScore),
    completeness: round1(completeness),
    differentiation: round1(differentiation),
    freshness: round1(freshness),
  };

  let score = Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0) + site.delta);
  score = Math.max(0, Math.min(100, score));
  if (demand.kind === "EDITORIAL_JUDGMENT") score = Math.min(score, EDITORIAL_SCORE_CAP);
  if (verifiedCount < 3) score = Math.min(score, 68);
  if (decisionCount < 3 && !input.hub_necessity) score = Math.min(score, 74);

  const failedHard = hard_gates.some((g) => !g.passed) || site.blockers.length > 0;
  let index_state: IndexState = "GRAPH_ONLY";
  if (input.unresolved_critical_conflict) index_state = "CONFLICTED";
  else if (input.stale_presented_as_current) index_state = "STALE";
  else if (failedHard && productAction) index_state = "NOINDEX_PRODUCT";
  else if (failedHard) index_state = "GRAPH_ONLY";
  else if (score >= INDEXABLE_THRESHOLD) index_state = "INDEXABLE";
  else if (productAction) index_state = "NOINDEX_PRODUCT";
  else index_state = "GRAPH_ONLY";

  if (failedHard && index_state === "INDEXABLE") {
    index_state = productAction ? "NOINDEX_PRODUCT" : "GRAPH_ONLY";
  }

  const why = explainWhyIndexable({
    score,
    breakdown,
    index_state,
    reasons,
    blockers,
    hard_gates,
    demand,
    why: "",
  });

  return { score, breakdown, index_state, reasons, blockers, hard_gates, demand, why };
}

export function explainWhyIndexable(result: Omit<QualityResult, "why"> & { why?: string }): string {
  if (result.index_state !== "INDEXABLE") {
    const failed = result.hard_gates.filter((g) => !g.passed).map((g) => g.id);
    if (failed.length) {
      return `Not indexable: hard gates failed (${failed.slice(0, 8).join(", ")}). Soft score ${result.score} does not compensate. State=${result.index_state}.`;
    }
    return `Not indexable: soft score ${result.score} is below ${INDEXABLE_THRESHOLD} after hard gates passed. Product/graph use can remain (${result.index_state}).`;
  }
  return [
    `Hard gates passed (${result.hard_gates.filter((g) => g.passed).length}/${result.hard_gates.length}).`,
    `Demand evidence is ${result.demand.kind} (editorial is capped; GSC is not claimed).`,
    `Decision utility ${result.breakdown.decision_utility}/${DIMENSION_MAX.decision_utility}; graph depth ${result.breakdown.graph_depth}/${DIMENSION_MAX.graph_depth}.`,
    `Soft score ${result.score} is secondary — it cannot override a failed hard gate. INDEX candidate threshold is ${INDEXABLE_THRESHOLD}.`,
  ].join(" ");
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function seoRecommendation(input: {
  query: string;
  matched_page?: PageRecord;
  intent_cluster_size: number;
  data_ready: boolean;
  existing_tool: boolean;
  duplicate_intent: boolean;
}): "IMPROVE_PAGE" | "CREATE_PAGE" | "MERGE_PAGES" | "EXPAND_TOOL" | "NO_ACTION" {
  if (input.duplicate_intent) return "MERGE_PAGES";
  if (input.matched_page && input.matched_page.quality_score < 85) return "IMPROVE_PAGE";
  if (!input.matched_page && input.existing_tool && !input.data_ready) return "EXPAND_TOOL";
  if (!input.matched_page && input.data_ready && input.intent_cluster_size >= 3) {
    return "CREATE_PAGE";
  }
  return "NO_ACTION";
}

const CORE_SIM_KEYS = [
  "facts",
  "relations",
  "answer",
  "decision",
  "code",
  "engine",
  "vehicle",
  "causes",
  "modes",
  "max_power",
  "match",
];

export function structuredSimilarity(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (keys.size === 0) return 1;
  let weightedSame = 0;
  let weight = 0;
  for (const key of keys) {
    const w = CORE_SIM_KEYS.includes(key) ? 3 : 1;
    weight += w;
    if (JSON.stringify(a[key]) === JSON.stringify(b[key])) weightedSame += w;
  }
  return weight ? weightedSame / weight : 1;
}

export function outputSimilarity(a: Record<string, unknown>, b: Record<string, unknown>): number {
  const keys = ["match", "max_power", "decision", "answer", "modes", "causes", "spec", "capsule"];
  let same = 0;
  let n = 0;
  for (const key of keys) {
    if (!(key in a) && !(key in b)) continue;
    n += 1;
    if (JSON.stringify(a[key]) === JSON.stringify(b[key])) same += 1;
  }
  return n ? same / n : 0;
}

export function intentSimilarity(a: PageRecord, b: PageRecord): number {
  if (a.site !== b.site) return 0;
  if (intentFamilyId(a) === intentFamilyId(b)) {
    return Math.max(0.9, structuredSimilarity(a.structured_payload, b.structured_payload));
  }
  if (a.family !== b.family) return 0.2;
  return structuredSimilarity(a.structured_payload, b.structured_payload);
}

export function duplicateAction(similarity: number, distinctReason?: string): "KEEP" | "MERGE" | "NOINDEX" {
  if (similarity <= 0.85) return "KEEP";
  if (distinctReason && distinctReason.length > 8 && !/^(unique|slug|title)/i.test(distinctReason)) return "KEEP";
  return similarity >= 0.92 ? "MERGE" : "NOINDEX";
}

export function intentFamilyId(page: {
  site: SiteId;
  family: string;
  title?: string;
  structured_payload: Record<string, unknown>;
}): string {
  const payload = page.structured_payload;
  const title = (page.title ?? "").toLowerCase();
  const oilLike = page.family.includes("oil") || /\b(engine )?oils?\b|\bbest oil\b/.test(title);
  if (oilLike) {
    return `${page.site}:oil:${String(payload.vehicle ?? payload.engine ?? payload.spec ?? "")}`;
  }
  if (page.family === "can-charger-charge") {
    return `${page.site}:pair:${String(payload.device)}:${String(payload.charger)}`;
  }
  if (page.family === "wear-month") {
    return `${page.site}:wear:${String(payload.slug)}:${String(payload.month ?? "")}`;
  }
  if (page.family.startsWith("route")) {
    return `${page.site}:corridor:${String(payload.route)}:${page.family}`;
  }
  if (page.family === "error-code") {
    return `${page.site}:error:${String(payload.brand)}:${String(payload.appliance)}:${String(payload.code)}`;
  }
  return `${page.site}:${page.family}:${String(payload.distinct_reason ?? payload.city ?? payload.slug ?? "")}`;
}

export function relationQuality(relation: GraphRelation, now = new Date()): number {
  const source = relation.provenance[0];
  const sourceScore = source ? (sourceRank(source.source_type) / 100) * 30 : 0;
  const conf =
    relation.confidence === "HIGH" ? 25 : relation.confidence === "MEDIUM" ? 18 : relation.confidence === "LOW" ? 8 : 0;
  const fresh = source && isFresh(source, now) ? 15 : source ? 5 : 0;
  const specific = Object.keys(relation.properties ?? {}).length >= 2 ? 15 : 6;
  const useful = relation.decision_relevant ? 15 : 0;
  let score = Math.round(sourceScore + conf + fresh + specific + useful);
  if (relation.inferred) score = Math.min(score, 60);
  if (relation.estimated) score = Math.min(score, 55);
  if (source?.source_type === "AI_INFERRED") score = Math.min(score, 40);
  return Math.max(0, Math.min(100, score));
}

export const QUALITY_BUCKETS = [
  "0-49",
  "50-59",
  "60-69",
  "70-79",
  "80-84",
  "85-89",
  "90-94",
  "95-100",
] as const;
export type QualityBucket = (typeof QUALITY_BUCKETS)[number];

export function qualityBucket(score: number): QualityBucket {
  if (score < 50) return "0-49";
  if (score < 60) return "50-59";
  if (score < 70) return "60-69";
  if (score < 80) return "70-79";
  if (score < 85) return "80-84";
  if (score < 90) return "85-89";
  if (score < 95) return "90-94";
  return "95-100";
}

export function qualityDistribution(
  pages: Array<{ quality_score: number; index_state: string }>,
): Array<{ bucket: QualityBucket; count: number; percentage: number; indexable: number }> {
  const rows = QUALITY_BUCKETS.map((bucket) => ({ bucket, count: 0, percentage: 0, indexable: 0 }));
  const map = Object.fromEntries(rows.map((row) => [row.bucket, row])) as Record<
    QualityBucket,
    (typeof rows)[number]
  >;
  for (const page of pages) {
    const bucket = qualityBucket(page.quality_score);
    map[bucket].count += 1;
    if (page.index_state === "INDEXABLE") map[bucket].indexable += 1;
  }
  const total = pages.length || 1;
  for (const row of rows) row.percentage = Math.round((row.count / total) * 1000) / 10;
  return rows;
}

export const DENSITY_MIN: Record<string, number> = {
  error_code: 5,
  vehicle_configuration: 8,
  device: 10,
  charger: 10,
  corridor: 6,
  historical_climate: 5,
  destination: 5,
};

export function densityRequired(entityType: string): number | null {
  return DENSITY_MIN[entityType] ?? null;
}

export { confidenceLevelFromScore, DIMENSION_MAX };

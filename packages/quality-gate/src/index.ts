import type { PageRecord, SiteId } from "@penta/graph-core";
import { confidenceLevelFromScore, type ConfidenceLevel } from "@penta/data-provenance";

export type QualityDimension =
  | "unique_structured_data"
  | "search_intent_evidence"
  | "product_utility"
  | "information_completeness"
  | "differentiation"
  | "data_confidence"
  | "freshness";

export type QualityBreakdown = Record<QualityDimension, number>;

export type QualityResult = {
  score: number;
  breakdown: QualityBreakdown;
  index_state: "INDEXABLE" | "NOINDEX_PRODUCT" | "GRAPH_ONLY";
  reasons: string[];
  blockers: string[];
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
  site_rules?: (input: PageQualityInput) => { delta: number; reasons: string[]; blockers: string[] };
};

const DIMENSION_MAX: QualityBreakdown = {
  unique_structured_data: 25,
  search_intent_evidence: 20,
  product_utility: 15,
  information_completeness: 15,
  differentiation: 10,
  data_confidence: 10,
  freshness: 5,
};

export function searchDemandScore(evidence: SearchDemandEvidence): number {
  const weights: Array<[keyof SearchDemandEvidence, number]> = [
    ["gsc", 1.2],
    ["internal_search", 1.1],
    ["user_questions", 1.1],
    ["autocomplete", 0.9],
    ["keyword_provider", 0.8],
    ["competitor_coverage", 0.7],
    ["impression_discovery", 0.8],
    ["related_queries", 0.6],
    ["seed_research", 0.5],
  ];
  let weighted = 0;
  let mass = 0;
  for (const [key, weight] of weights) {
    const value = evidence[key];
    if (typeof value === "number") {
      weighted += Math.max(0, Math.min(100, value)) * weight;
      mass += weight;
    }
  }
  if (mass === 0) return 0;
  return Math.round(weighted / mass);
}

export function opportunityScore(input: {
  search_demand: number;
  data_completeness: number;
  monetization_potential: number;
  product_utility: number;
  competition_difficulty: number;
}): number {
  const difficulty = Math.max(1, input.competition_difficulty);
  return Math.round(
    (input.search_demand *
      input.data_completeness *
      input.monetization_potential *
      input.product_utility) /
      difficulty /
      10000,
  );
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

export function evaluatePageQuality(input: PageQualityInput): QualityResult {
  const reasons: string[] = [];
  const blockers: string[] = [];

  const unique = clamp(
    (input.unique_fields / 8) * DIMENSION_MAX.unique_structured_data,
    DIMENSION_MAX.unique_structured_data,
  );
  const demand = searchDemandScore(input.search_demand);
  const intent = clamp(
    (demand / 100) * DIMENSION_MAX.search_intent_evidence,
    DIMENSION_MAX.search_intent_evidence,
  );
  let utility = input.product_cta ? 8 : 2;
  if (input.interactive) utility += 7;
  utility = clamp(utility, DIMENSION_MAX.product_utility);
  const completeness = clamp(
    (input.required_fields_present / Math.max(1, input.required_fields_total)) *
      DIMENSION_MAX.information_completeness,
    DIMENSION_MAX.information_completeness,
  );
  let differentiation = input.distinct_from_parent ? 8 : 3;
  if (input.near_duplicate || input.year_only_variant) differentiation = 1;
  differentiation = clamp(differentiation, DIMENSION_MAX.differentiation);

  const confidenceScore =
    input.confidence === "HIGH"
      ? 10
      : input.confidence === "MEDIUM"
        ? 7
        : input.confidence === "LOW"
          ? 3
          : 0;

  const freshnessRatio = Math.max(
    0,
    1 - input.freshness_days / Math.max(1, input.freshness_ttl_days * 2),
  );
  const freshness = clamp(freshnessRatio * 5, 5);

  if (input.llm_filler) blockers.push("LLM filler is forbidden");
  if (!input.provenance_valid) blockers.push("Missing or invalid provenance");
  if (input.year_only_variant) blockers.push("Year-only variant without technical change");
  if (input.city_without_specifics) blockers.push("City page without destination-specific data");
  if (input.obscure_without_demand) blockers.push("Obscure combination with unknown demand");
  if (demand === 0) reasons.push("Search demand unknown — cannot auto-index");

  const site = input.site_rules?.(input) ?? { delta: 0, reasons: [], blockers: [] };
  reasons.push(...site.reasons);
  blockers.push(...site.blockers);

  const breakdown: QualityBreakdown = {
    unique_structured_data: round1(unique),
    search_intent_evidence: round1(intent),
    product_utility: round1(utility),
    information_completeness: round1(completeness),
    differentiation: round1(differentiation),
    data_confidence: confidenceScore,
    freshness: round1(freshness),
  };

  let score = Math.round(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0) + site.delta,
  );
  score = Math.max(0, Math.min(100, score));

  let index_state: QualityResult["index_state"] = "GRAPH_ONLY";
  if (blockers.length === 0 && score >= 75) index_state = "INDEXABLE";
  else if (blockers.length === 0 && score >= 60) index_state = "NOINDEX_PRODUCT";

  if (blockers.length > 0) index_state = "GRAPH_ONLY";

  return { score, breakdown, index_state, reasons, blockers };
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

export const INDEXABLE_THRESHOLD = 75;

export function structuredSimilarity(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (keys.size === 0) return 1;
  let same = 0;
  for (const key of keys) {
    if (JSON.stringify(a[key]) === JSON.stringify(b[key])) same += 1;
  }
  return same / keys.size;
}

export { confidenceLevelFromScore };

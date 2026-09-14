export const DEMAND_PHASES = ["PRE_LAUNCH", "POST_LAUNCH"] as const;
export type DemandPhase = (typeof DEMAND_PHASES)[number];

export const DEMAND_EVIDENCE_SOURCES = [
  "SERP",
  "AUTOCOMPLETE",
  "RELATED_SEARCH",
  "PAA",
  "GOOGLE_TRENDS",
  "KEYWORD_PLANNER",
  "KEYWORD_PROVIDER",
  "GSC",
  "INTERNAL_SEARCH",
  "PRODUCT_USAGE",
  "EDITORIAL",
] as const;
export type DemandEvidenceSource = (typeof DEMAND_EVIDENCE_SOURCES)[number];

export const COLLECTION_METHODS = ["MANUAL", "IMPORT", "API", "BROWSER_OBSERVATION", "SYSTEM"] as const;
export type CollectionMethod = (typeof COLLECTION_METHODS)[number];

export const DEMAND_CLASSES = ["VERY_HIGH", "HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;
export type DemandClass = (typeof DEMAND_CLASSES)[number];

export const SEO_ELIGIBILITIES = [
  "NONE",
  "DISCOVERED",
  "PRELAUNCH_VALIDATED",
  "POSTLAUNCH_VALIDATED",
] as const;
export type SeoEligibility = (typeof SEO_ELIGIBILITIES)[number];

export const SEO_VALIDATIONS = ["NONE", "PRELAUNCH", "POSTLAUNCH"] as const;
export type SeoValidation = (typeof SEO_VALIDATIONS)[number];

export const SERP_CLASSIFICATIONS = [
  "STRONG_INTENT",
  "MIXED_INTENT",
  "WEAK_INTENT",
  "NO_CLEAR_INTENT",
] as const;
export type SerpClassification = (typeof SERP_CLASSIFICATIONS)[number];

export const SERP_OPPORTUNITIES = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;
export type SerpOpportunity = (typeof SERP_OPPORTUNITIES)[number];

export const POSTLAUNCH_STATUSES = ["WINNER", "PROVEN", "DISCOVERY", "WEAK", "DECAYING"] as const;
export type PostLaunchStatus = (typeof POSTLAUNCH_STATUSES)[number];

export type DemandEvidence = {
  id: string;
  source: DemandEvidenceSource;
  query: string;
  locale: string;
  country?: string;
  language?: string;
  observedAt: string;
  observed: boolean;
  value?: number | null;
  unit?: string | null;
  url?: string | null;
  rawLabel?: string | null;
  confidence: number;
  notes?: string;
  collectionMethod: CollectionMethod;
  pageId?: string;
  expired?: boolean;
};

export type SerpObservation = {
  query: string;
  locale: string;
  observedAt: string;
  resultsObserved: number;
  exactIntentResults: number;
  partialIntentResults: number;
  exactIntentResultsTop10?: number;
  domains?: string[];
  hasPaa?: boolean;
  relatedQueries?: string[];
  classification: SerpClassification;
  composition?: SerpComposition;
  pageId?: string;
};

export type SerpComposition = {
  official: number;
  editorial: number;
  forums: number;
  ecommerce: number;
};

export type DemandAssessmentV2 = {
  pageId: string;
  queryCluster: string[];
  evidence: DemandEvidence[];
  serpObservations: SerpObservation[];
  preLaunchScore: number;
  postLaunchScore?: number;
  externalEvidenceCount: number;
  independentSourceCount: number;
  serpObserved: boolean;
  intentMatchObserved: boolean;
  autocompleteObserved: boolean;
  trendsObserved: boolean;
  quantitativeVolumeObserved: boolean;
  exactIntentResultsTop10: number;
  serpComposition?: SerpComposition;
  serpOpportunity: SerpOpportunity;
  phase: DemandPhase;
  class: DemandClass;
  seoEligibility: SeoEligibility;
  pathA: boolean;
  pathB: boolean;
  pathC: boolean;
  pathD: boolean;
  expiredEvidenceIds: string[];
  localeMismatches: string[];
  warnings: string[];
};

export type SeoOpportunityScore = {
  demand: number;
  truth_readiness: number;
  product_utility: number;
  serp_opportunity: number;
  competition: number;
  total: number;
  indexable: boolean;
  reason: string;
};

export type DemandProviderContext = {
  pageId?: string;
  locale?: string;
  country?: string;
  language?: string;
};

export interface DemandProvider {
  name: string;
  checkQuery(query: string, context: DemandProviderContext): Promise<DemandEvidence[]>;
}

export const DEMAND_TTL_DAYS: Record<DemandEvidenceSource, number> = {
  SERP: 75,
  AUTOCOMPLETE: 75,
  RELATED_SEARCH: 75,
  PAA: 75,
  GOOGLE_TRENDS: 90,
  KEYWORD_PLANNER: 90,
  KEYWORD_PROVIDER: 90,
  GSC: 14,
  INTERNAL_SEARCH: 30,
  PRODUCT_USAGE: 30,
  EDITORIAL: 365,
};

export const GOOGLE_SURFACE_SOURCES = new Set<DemandEvidenceSource>([
  "SERP",
  "AUTOCOMPLETE",
  "RELATED_SEARCH",
  "PAA",
  "GOOGLE_TRENDS",
]);

export const QUANTITATIVE_SOURCES = new Set<DemandEvidenceSource>([
  "KEYWORD_PLANNER",
  "KEYWORD_PROVIDER",
]);

export const POSTLAUNCH_SOURCES = new Set<DemandEvidenceSource>([
  "GSC",
  "INTERNAL_SEARCH",
  "PRODUCT_USAGE",
]);

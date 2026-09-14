import type { ProvenanceRecord, ConfidenceLevel } from "@penta/data-provenance";

export const INDEX_STATES = [
  "INDEXABLE",
  "NOINDEX_PRODUCT",
  "GRAPH_ONLY",
  "REVIEW_REQUIRED",
  "CONFLICTED",
  "STALE",
  "REDIRECT",
  "REMOVED",
] as const;

export type IndexState = (typeof INDEX_STATES)[number];

export const RELATION_CLASSES = [
  "DECISION_RELEVANT",
  "DESCRIPTIVE",
  "NAVIGATION_ONLY",
  "UNKNOWN",
] as const;

export type RelationClass = (typeof RELATION_CLASSES)[number];

export const TRUTH_STATUSES = [
  "VERIFIED_PRIMARY",
  "VERIFIED_SECONDARY",
  "TESTED",
  "REPORTED",
  "INFERRED",
  "ESTIMATED",
  "STALE",
  "UNKNOWN",
  "CONFLICTING",
] as const;

export type TruthStatus = (typeof TRUTH_STATUSES)[number];

export type SiteId =
  | "fixcode"
  | "autospec"
  | "wearthere"
  | "chargematch"
  | "tripcost";

export type GraphEntity = {
  id: string;
  site: SiteId;
  type: string;
  slug: string;
  name: string;
  properties: Record<string, unknown>;
  provenance: ProvenanceRecord[];
  confidence: ConfidenceLevel;
  created_at: string;
  updated_at: string;
};

export type GraphRelation = {
  id: string;
  site: SiteId;
  type: string;
  from_id: string;
  to_id: string;
  properties: Record<string, unknown>;
  provenance: ProvenanceRecord[];
  confidence: ConfidenceLevel;
  index_eligible: boolean;
  /** Used by a product engine to make a decision. Trivia links must stay false. */
  decision_relevant: boolean;
  /** Independent of the boolean flag — audit classifies from type + flag. */
  relation_class?: RelationClass;
  inferred: boolean;
  /** Protocol overlap / heuristic estimate — not a lab measurement. */
  estimated?: boolean;
  method?: string;
  verified_at?: string;
};

export type PageFamily =
  | "error-code"
  | "symptom"
  | "repair-guide"
  | "appliance-hub"
  | "brand-hub"
  | "oil-type"
  | "oil-capacity"
  | "tyre-pressure"
  | "battery"
  | "wipers"
  | "maintenance-schedule"
  | "common-problems"
  | "recalls"
  | "compatible-component"
  | "vehicle-hub"
  | "wear-month"
  | "packing-month"
  | "season-clothing"
  | "destination-hub"
  | "device-wattage"
  | "charger-for-device"
  | "can-charger-charge"
  | "protocol-education"
  | "device-hub"
  | "route-driving"
  | "route-toll"
  | "route-car-vs-train"
  | "route-fuel"
  | "travel-calculator";

export type PageRecord = {
  id: string;
  site: SiteId;
  family: PageFamily;
  url: string;
  canonical: string;
  title: string;
  meta_description: string;
  entity_ids: string[];
  structured_payload: Record<string, unknown>;
  quality_score: number;
  search_demand: number;
  index_state: IndexState;
  noindex: boolean;
  similarity_hash: string;
  freshness: string;
  review_required: boolean;
  batch: string;
  publish_state: "DRAFT" | "READY" | "INDEXABLE" | "PUBLISHED";
};

export class GraphStore {
  entities = new Map<string, GraphEntity>();
  relations = new Map<string, GraphRelation>();
  pages = new Map<string, PageRecord>();
  conflicts: Array<{ id: string; entity_id: string; field: string }> = [];
  demandSignals: Array<{
    query: string;
    site: SiteId;
    count: number;
    matched_entity_id?: string;
  }> = [];

  addEntity(entity: GraphEntity): void {
    this.entities.set(entity.id, entity);
  }

  addRelation(relation: GraphRelation): void {
    this.relations.set(relation.id, relation);
  }

  addPage(page: PageRecord): void {
    this.pages.set(page.id, page);
  }

  get(id: string): GraphEntity | undefined {
    return this.entities.get(id);
  }

  byType(site: SiteId, type: string): GraphEntity[] {
    return [...this.entities.values()].filter(
      (entity) => entity.site === site && entity.type === type,
    );
  }

  related(id: string, type?: string): GraphRelation[] {
    return [...this.relations.values()].filter(
      (relation) =>
        (relation.from_id === id || relation.to_id === id) &&
        (!type || relation.type === type),
    );
  }

  pagesFor(site: SiteId, indexState?: IndexState): PageRecord[] {
    return [...this.pages.values()].filter(
      (page) =>
        page.site === site && (!indexState || page.index_state === indexState),
    );
  }

  stats(site?: SiteId) {
    const entities = [...this.entities.values()].filter(
      (entity) => !site || entity.site === site,
    );
    const relations = [...this.relations.values()].filter(
      (relation) => !site || relation.site === site,
    );
    const pages = [...this.pages.values()].filter(
      (page) => !site || page.site === site,
    );
    const verifiedRelations = relations.filter(
      (relation) =>
        !relation.inferred &&
        (relation.confidence === "HIGH" || relation.confidence === "MEDIUM"),
    );
    const inferredRelations = relations.filter((relation) => relation.inferred);
    const unknownRelations = relations.filter((relation) => relation.confidence === "UNKNOWN");
    const estimatedRelations = relations.filter(
      (relation) => relation.estimated || relation.properties.theoretical === true,
    );
    const staleRelations = relations.filter((relation) => {
      const until = relation.provenance[0]?.valid_until;
      return until ? new Date(until).getTime() < Date.now() : false;
    });
    const decisionRelations = relations.filter((relation) => relation.decision_relevant);
    const degrees = new Map<string, number>();
    for (const entity of entities) degrees.set(entity.id, 0);
    for (const relation of relations) {
      degrees.set(relation.from_id, (degrees.get(relation.from_id) ?? 0) + 1);
      degrees.set(relation.to_id, (degrees.get(relation.to_id) ?? 0) + 1);
    }
    const degVals = [...degrees.values()];
    const isolated_entity_count = degVals.filter((n) => n === 0).length;
    const single_relation_entity_count = degVals.filter((n) => n === 1).length;
    const entities_with_3plus_relations = degVals.filter((n) => n >= 3).length;
    const entities_with_5plus_relations = degVals.filter((n) => n >= 5).length;
    const entities_with_10plus_relations = degVals.filter((n) => n >= 10).length;
    const sourceCounts = entities.map((entity) => entity.provenance.length);
    const relSourceCounts = relations.map((relation) => relation.provenance.length);
    const avg = (nums: number[]) =>
      nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;
    const indexable = pages.filter((page) => page.index_state === "INDEXABLE").length;
    return {
      entities: entities.length,
      relations: relations.length,
      verified_relations: verifiedRelations.length,
      inferred_relations: inferredRelations.length,
      unknown_relations: unknownRelations.length,
      decision_relevant_relations: decisionRelations.length,
      decision_relations_per_entity:
        entities.length ? Math.round((decisionRelations.length / entities.length) * 100) / 100 : 0,
      estimated_relations: estimatedRelations.length,
      stale_relations: staleRelations.length,
      isolated_entity_count,
      single_relation_entity_count,
      entities_with_3plus_relations,
      entities_with_5plus_relations,
      entities_with_10plus_relations,
      relations_per_entity:
        entities.length ? Math.round((relations.length / entities.length) * 100) / 100 : 0,
      relations_per_indexable_page:
        indexable ? Math.round((relations.length / indexable) * 100) / 100 : 0,
      average_sources_per_entity: avg(sourceCounts),
      average_sources_per_relation: avg(relSourceCounts),
      orphan_entities: isolated_entity_count,
      low_confidence: [...entities, ...relations].filter(
        (item) => item.confidence === "LOW" || item.confidence === "UNKNOWN",
      ).length,
      pages: pages.length,
      indexable,
      noindex_product: pages.filter(
        (page) => page.index_state === "NOINDEX_PRODUCT",
      ).length,
      graph_only: pages.filter((page) => page.index_state === "GRAPH_ONLY").length,
      published: pages.filter((page) => page.publish_state === "PUBLISHED").length,
    };
  }
}

export type DecisionTrace = {
  facts: string[];
  relations: string[];
  rules: string[];
  sources: string[];
  bottlenecks?: string[];
};

export type PageCandidate = {
  url: string;
  site: SiteId;
  family: PageFamily | string;
  intent_family: string;
  index_state: IndexState;
};

export type EntityDepth = "ISOLATED" | "SHALLOW" | "CONNECTED" | "RICH";

/** Decision entities need more edges than taxonomy nodes. */
export function classifyEntityDepth(type: string, degree: number): EntityDepth {
  if (degree <= 0) return "ISOLATED";
  const decisionTypes = new Set([
    "error_code",
    "cause",
    "vehicle_configuration",
    "device",
    "charger",
    "corridor",
    "destination",
    "historical_climate",
  ]);
  const richAt = decisionTypes.has(type) ? 8 : 5;
  if (degree < 3) return "SHALLOW";
  if (degree < richAt) return "CONNECTED";
  return "RICH";
}

const DECISION_TYPES = new Set([
  "MAY_BE_CAUSED_BY",
  "TESTED_BY",
  "RETURNS",
  "FIXED_BY",
  "RISK_LEVEL",
  "SAFETY_CLASS",
  "REQUIRES_TOOL",
  "REQUIRES_PART",
  "HAS_ERROR",
  "NEXT_TEST",
  "NEXT_ACTION",
  "DIY_OR_TECH",
  "SAFETY_HAZARD",
  "HAS_EXPECTED_RESULT",
  "REQUIRES_FLUID_SPEC",
  "OIL_CAPACITY",
  "HAS_SERVICE_INTERVAL",
  "FITS",
  "HAS_COMPONENT",
  "HAS_BATTERY",
  "USES_ENGINE",
  "USES_TRANSMISSION",
  "USES_DRIVETRAIN",
  "HAS_COOLANT_SPEC",
  "HAS_BRAKE_FLUID",
  "HAS_TRANS_FLUID",
  "SUBJECT_TO_RECALL",
  "TYPICAL_CLIMATE",
  "PACKS",
  "PACKS_FOR_ACTIVITY",
  "HAS_TEMPERATURE_RANGE",
  "HAS_PRECIPITATION",
  "HAS_WIND",
  "HAS_HUMIDITY",
  "HAS_PACKING_DECISION",
  "DIFFERS_FROM",
  "MAX_INPUT",
  "MAX_OUTPUT",
  "HAS_PORT",
  "DEVICE_HAS_PORT",
  "SUPPORTS_PROTOCOL",
  "PORT_SUPPORTS_PROTOCOL",
  "HAS_POWER_ALLOCATION",
  "CHARGER_SPLITS_POWER_AS",
  "CAN_CHARGE",
  "EXPECTED_POWER",
  "COMPATIBLE_IF",
  "CABLE_MAX_CURRENT",
  "CABLE_MAX_WATTAGE",
  "CABLE_EMARKED",
  "DEVICE_ACCEPTS_MAX_WATTAGE",
  "DEVICE_NEGOTIATES_WITH",
  "MEASUREMENT_OBSERVED_FOR",
  "HAS_DISTANCE",
  "HAS_CONSUMPTION",
  "HAS_COST_COMPONENT",
  "HAS_MODE",
  "ROUTE_HAS_TOLL",
  "ROUTE_NO_TOLL",
  "ROUTE_ALTERNATIVE",
  "ROUTE_BREAK_EVEN",
  "ROUTE_ENERGY_REQUIRED",
  "ROUTE_WEAR_COST",
  "HAS_TIME_COMPONENT",
  "VEHICLE_CONSUMPTION",
]);

const NAVIGATION_TYPES = new Set([
  "FROM_PLACE",
  "TO_PLACE",
  "MAKES_APPLIANCE",
  "ON_APPLIANCE",
]);

const DESCRIPTIVE_TYPES = new Set([
  "HAS_MODEL",
  "HAS_GENERATION",
  "COVERS_YEARS",
  "SOLD_IN",
  "OBSERVED_ON_MODEL",
  "INDICATES",
  "MAY_INDICATE",
  "IS_CONFIGURATION_OF",
  "AVAILABLE_WITH_ENGINE",
  "IN_FAMILY",
  "BRAND_HAS_FAMILY",
  "FAMILY_HAS_MODEL",
  "HAS_TRIM",
  "HAS_ERROR_CODE",
  "SUPPORTS",
  "ALLOCATION_UNKNOWN",
]);

export function classifyRelation(relation: {
  type: string;
  decision_relevant?: boolean;
  relation_class?: RelationClass;
}): RelationClass {
  if (relation.relation_class) return relation.relation_class;
  if (DECISION_TYPES.has(relation.type)) return "DECISION_RELEVANT";
  if (NAVIGATION_TYPES.has(relation.type)) return "NAVIGATION_ONLY";
  if (DESCRIPTIVE_TYPES.has(relation.type)) return "DESCRIPTIVE";
  if (relation.decision_relevant === true) return "DECISION_RELEVANT";
  if (relation.decision_relevant === false) return "DESCRIPTIVE";
  return "UNKNOWN";
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round((sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)) * 100) / 100;
}

export function median(values: number[]): number {
  return percentile(values, 0.5);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

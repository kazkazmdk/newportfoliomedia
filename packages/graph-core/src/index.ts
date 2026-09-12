import type { ProvenanceRecord, ConfidenceLevel } from "@penta/data-provenance";

export const INDEX_STATES = [
  "GRAPH_ONLY",
  "NOINDEX_PRODUCT",
  "INDEXABLE",
  "DRAFT",
  "READY",
  "PUBLISHED",
] as const;

export type IndexState = (typeof INDEX_STATES)[number];

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
        relation.confidence === "HIGH" || relation.confidence === "MEDIUM",
    );
    return {
      entities: entities.length,
      relations: relations.length,
      verified_relations: verifiedRelations.length,
      low_confidence: [...entities, ...relations].filter(
        (item) => item.confidence === "LOW" || item.confidence === "UNKNOWN",
      ).length,
      pages: pages.length,
      indexable: pages.filter((page) => page.index_state === "INDEXABLE").length,
      noindex_product: pages.filter(
        (page) => page.index_state === "NOINDEX_PRODUCT",
      ).length,
      graph_only: pages.filter((page) => page.index_state === "GRAPH_ONLY").length,
      published: pages.filter((page) => page.publish_state === "PUBLISHED").length,
    };
  }
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

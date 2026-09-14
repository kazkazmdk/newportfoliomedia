import type { GraphRelation, PageRecord, SiteId } from "@penta/graph-core";
import { classifyEdgeKind } from "@penta/graph-core";
import {
  isGenericSourceUrl,
  validateFactProvenance,
  type ProvenanceLevel,
} from "@penta/data-provenance";
import { inspectPayloadKeys, inspectRequiredFields, PAGE_REQUIREMENTS } from "./page-requirements";

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

export type GateResult = {
  gate: string;
  status: boolean;
  evidence: Record<string, unknown>;
  reason?: string;
};

export type Distinctiveness = {
  parent_id?: string;
  unique_fact_count: number;
  unique_relation_count: number;
  unique_decision_count: number;
  semantic_overlap: number;
  passed: boolean;
  reason: string;
};

export type ProductActionEvidence = {
  present: boolean;
  action?: string;
  inputs: string[];
  outputs: string[];
  evidence: string[];
  consequence?: string;
};

export type AxisScores = {
  content_quality: number;
  truth_quality: number;
  decision_utility: number;
  demand_evidence: number;
  distinctiveness: number;
  safety: number;
};

export type PageEvidenceReport = {
  page_id: string;
  product: SiteId;
  page_family: string;
  status: string;
  required_fields: { required: string[]; present: string[]; missing: string[] };
  source_facts: number;
  derived_facts: number;
  inferred_facts: number;
  decision_outputs: string[];
  demand_evidence: SearchDemandEvidence;
  distinctiveness: Distinctiveness;
  provenance_coverage: number;
  product_action: ProductActionEvidence;
  interactive: boolean;
  gates: GateResult[];
  critical_failures: string[];
  warnings: string[];
  final_reason: string;
  axes: AxisScores;
};

export function detectProductAction(
  family: string,
  payload?: Record<string, unknown>,
): ProductActionEvidence {
  const rec = payload ?? {};
  const evidence: string[] = [];
  const inputs: string[] = [];
  const outputs: string[] = [];

  if (Array.isArray(rec.causes) && rec.causes.length) {
    evidence.push("causes");
    outputs.push("causes");
    if (rec.code) inputs.push("code");
    if (rec.brand) inputs.push("brand");
    if (rec.appliance) inputs.push("appliance");
  }
  if (Array.isArray(rec.ranked_causes) && rec.ranked_causes.length) {
    evidence.push("ranked_causes");
    outputs.push("ranked_causes");
  }
  if (Array.isArray(rec.tests) && rec.tests.length) {
    evidence.push("tests");
    outputs.push("tests");
  }
  if (rec.match != null && rec.max_power != null) {
    evidence.push("charger_decision");
    outputs.push("max_power", "match");
    if (rec.device) inputs.push("device");
    if (rec.charger) inputs.push("charger");
  }
  if (rec.bottleneck) {
    evidence.push("limiting_component");
    outputs.push("bottleneck");
  }
  if (Array.isArray(rec.layers) && rec.layers.length) {
    evidence.push("wear_layers");
    outputs.push("layers");
    if (rec.city) inputs.push("city");
    if (rec.month) inputs.push("month");
  }
  if (Array.isArray(rec.modes) && rec.modes.length) {
    evidence.push("trip_modes");
    outputs.push("modes");
    if (rec.from) inputs.push("from");
    if (rec.to) inputs.push("to");
    if (rec.route) inputs.push("route");
  }
  if (rec.capacity_l != null || rec.spec != null || rec.viscosity != null) {
    evidence.push("service_spec");
    outputs.push(rec.capacity_l != null ? "capacity_l" : rec.spec != null ? "spec" : "viscosity");
    if (rec.vehicle) inputs.push("vehicle");
    if (rec.engine) inputs.push("engine");
  }
  if (rec.pressure_bar_front != null) {
    evidence.push("tyre_spec");
    outputs.push("pressure_bar_front");
  }
  if (Array.isArray(rec.services) && rec.services.length) {
    evidence.push("maintenance_services");
    outputs.push("services");
  }

  const action =
    outputs.includes("causes") || outputs.includes("ranked_causes")
      ? "rank_diagnostic_causes"
      : outputs.includes("max_power")
        ? "recommend_charging_kit"
        : outputs.includes("layers")
          ? "generate_packing_recommendation"
          : outputs.includes("modes")
            ? "compare_trip_modes"
            : outputs.includes("capacity_l") || outputs.includes("spec")
              ? "compute_service_spec"
              : outputs.includes("services")
                ? "list_service_interval"
                : undefined;

  const familyImpliesAction = /wear-month|error-code|can-charger|oil-|route-/.test(family);
  void familyImpliesAction;
  const intended = rec.intendedAction ?? rec.intended_action;
  if (typeof intended === "string" && /help user decide|intended action/i.test(intended) && !action) {
    return { present: false, inputs, outputs, evidence };
  }

  return {
    present: Boolean(action && outputs.length && evidence.length),
    action,
    inputs,
    outputs,
    evidence,
    consequence: action
      ? {
          rank_diagnostic_causes: "user can pick a test sequence instead of guessing",
          recommend_charging_kit: "user knows expected watts and the limiting component",
          generate_packing_recommendation: "user gets a layer stack for a city-month",
          compare_trip_modes: "user can compare door-to-door cost bands",
          compute_service_spec: "user gets a capacity/spec for one variant",
          list_service_interval: "user sees scheduled services for one vehicle",
        }[action]
      : undefined,
  };
}

export function detectInteractive(
  family: string,
  payload: Record<string, unknown> | undefined,
  claimed: { product_cta?: boolean; interactive?: boolean },
): GateResult {
  const action = detectProductAction(family, payload);
  const rec = payload ?? {};
  const hasUserInput = Boolean(
    rec.inputs ||
      rec.user_inputs ||
      rec.symptoms ||
      (rec.device && rec.charger) ||
      (rec.from && rec.to) ||
      (rec.city && rec.month) ||
      (rec.code && rec.brand) ||
      rec.vehicle ||
      rec.route,
  );
  const ctaOnly = Boolean(claimed.product_cta) && !action.present;
  const spec = PAGE_REQUIREMENTS[family];
  const familyLooksInteractive = Boolean(spec?.interaction.needs_user_input);
  const interactive = hasUserInput && action.present && !ctaOnly;
  return {
    gate: "interactive",
    status: payload ? interactive : Boolean(claimed.interactive) && !ctaOnly,
    evidence: {
      has_user_input: hasUserInput,
      has_deterministic_output: action.present,
      cta_only: ctaOnly,
      family_looks_interactive: familyLooksInteractive,
      cta_is_not_interaction: true,
      claimed_interactive: claimed.interactive === true,
    },
    reason: payload
      ? interactive
        ? undefined
        : "CTA/template is not an interaction; need input + computed output"
      : claimed.interactive
        ? undefined
        : "no interactive evidence",
  };
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

export function computeDistinctiveness(input: {
  page_id: string;
  title?: string;
  intent?: string;
  payload?: Record<string, unknown>;
  parent?: { id: string; title?: string; payload?: Record<string, unknown> };
  sibling_structured_similarity?: number;
  same_intent_sibling?: boolean;
  same_decision_output?: boolean;
  claimed_reason?: string;
}): Distinctiveness {
  const keys = inspectPayloadKeys(input.payload);
  const parentKeys = inspectPayloadKeys(input.parent?.payload);
  const uniqueFacts = keys.filter((k) => !parentKeys.includes(k));
  const pageText = `${input.title ?? ""} ${input.intent ?? ""} ${JSON.stringify(input.payload ?? {})}`;
  const parentText = input.parent
    ? `${input.parent.title ?? ""} ${JSON.stringify(input.parent.payload ?? {})}`
    : "";
  const a = tokenize(pageText);
  const b = tokenize(parentText);
  let overlap = 0;
  if (a.size && b.size) {
    let inter = 0;
    for (const t of a) if (b.has(t)) inter += 1;
    overlap = inter / Math.min(a.size, b.size);
  }
  if (input.sibling_structured_similarity != null && input.same_intent_sibling) {
    overlap = Math.max(overlap, input.sibling_structured_similarity);
  }
  const uniqueDecisions = detectProductAction("", input.payload).outputs.filter((o) => !parentKeys.includes(o)).length;
  const idIsNotEvidence = Boolean(input.claimed_reason) && input.claimed_reason !== input.page_id;
  const siblingClone =
    (input.sibling_structured_similarity ?? 0) > 0.85 &&
    Boolean(input.same_intent_sibling) &&
    Boolean(input.same_decision_output);
  const passed = !siblingClone && overlap < 0.92 && (uniqueFacts.length >= 2 || uniqueDecisions > 0 || (!input.parent && keys.length >= 4));
  return {
    parent_id: input.parent?.id,
    unique_fact_count: uniqueFacts.length,
    unique_relation_count: uniqueFacts.length,
    unique_decision_count: uniqueDecisions,
    semantic_overlap: Number(overlap.toFixed(3)),
    passed,
    reason: siblingClone
      ? "near-duplicate sibling (id difference ignored)"
      : overlap >= 0.92
        ? "semantic overlap too high vs parent/sibling"
        : passed
          ? `unique_facts=${uniqueFacts.length} overlap=${overlap.toFixed(2)}`
          : "not enough unique facts/decisions (page.id is not distinctiveness)",
    ...(idIsNotEvidence ? {} : {}),
  };
}

export function demandLevel(evidence: SearchDemandEvidence): number {
  if (evidence.gsc != null || evidence.keyword_provider != null || evidence.internal_search != null || evidence.user_questions != null) {
    return 3;
  }
  if (evidence.competitor_coverage != null && evidence.autocomplete != null) return 2;
  if (evidence.autocomplete != null || evidence.related_queries != null || evidence.competitor_coverage != null) {
    return 1;
  }
  if (evidence.seed_research != null) return 0;
  return 0;
}

export function editorialOnly(evidence: SearchDemandEvidence): boolean {
  const observed =
    evidence.gsc != null ||
    evidence.keyword_provider != null ||
    evidence.internal_search != null ||
    evidence.user_questions != null ||
    evidence.autocomplete != null ||
    evidence.competitor_coverage != null;
  return !observed;
}

export function weartherePageValue(input: {
  family: string;
  demand_level: number;
  climate_delta_c?: number;
  rain_delta?: number;
  outfit_delta?: number;
}): { indexable: boolean; graph_only: boolean; reason: string } {
  if (input.family !== "wear-month" && input.family !== "wearthere-city-month") {
    return { indexable: false, graph_only: false, reason: "not a city-month page" };
  }
  const climate = Math.abs(input.climate_delta_c ?? 0);
  const rain = Math.abs(input.rain_delta ?? 0);
  const outfit = input.outfit_delta ?? 0;
  if (climate < 3 && rain < 3 && outfit < 2) {
    return {
      indexable: false,
      graph_only: true,
      reason: "city-month not climatically/decision-distinct vs adjacent months",
    };
  }
  if (input.demand_level === 0) {
    return { indexable: false, graph_only: false, reason: "no demonstrated demand; candidate at best" };
  }
  return { indexable: input.demand_level >= 2, graph_only: false, reason: "sufficient climate delta and demand" };
}

export function climateDeltaVsAdjacent(
  page: PageRecord,
  siblings: PageRecord[],
): { climate_delta_c: number; rain_delta: number } {
  const tmax = Number(page.structured_payload.tmax_c);
  const tmin = Number(page.structured_payload.tmin_c);
  const rain = Number(page.structured_payload.rain_days);
  const month = Number(page.structured_payload.month);
  const city = String(page.structured_payload.slug ?? page.structured_payload.city ?? "");
  const adjacent = siblings.filter((other) => {
    const otherCity = String(other.structured_payload.slug ?? other.structured_payload.city ?? "");
    const otherMonth = Number(other.structured_payload.month);
    return other.url !== page.url && otherCity === city && Math.abs(otherMonth - month) === 1;
  });
  if (!adjacent.length || Number.isNaN(tmax)) return { climate_delta_c: 99, rain_delta: 99 };
  let minClimate = 99;
  let minRain = 99;
  for (const other of adjacent) {
    const dt = Math.abs(tmax - Number(other.structured_payload.tmax_c)) + Math.abs(tmin - Number(other.structured_payload.tmin_c));
    const dr = Math.abs(rain - Number(other.structured_payload.rain_days));
    minClimate = Math.min(minClimate, dt / 2);
    minRain = Math.min(minRain, Number.isNaN(dr) ? 99 : dr);
  }
  return { climate_delta_c: minClimate, rain_delta: minRain };
}

export function relationProvenanceLevel(rel: GraphRelation): {
  level: ProvenanceLevel;
  verified_primary: boolean;
  generic_url: boolean;
} {
  const rec = rel.provenance[0];
  const v = validateFactProvenance({
    source_type: rec?.source_type ?? "THIRD_PARTY",
    source_url: rec?.source_url,
    source_name: rec?.source_name,
    retrieved_at: rec?.retrieved_at,
    verified_at: rec?.verified_at,
    verification_method: rec?.verification_method,
    inferred: rel.inferred,
    locator: {
      document_title: rec?.source_name,
      dataset: typeof rel.properties.dataset === "string" ? rel.properties.dataset : undefined,
      section: typeof rel.properties.section === "string" ? rel.properties.section : undefined,
      page: rel.properties.page as string | number | undefined,
      table: typeof rel.properties.table === "string" ? rel.properties.table : undefined,
    },
  });
  return { level: v.level, verified_primary: v.verified_primary, generic_url: v.generic_url };
}

export function countVerifiedExact(relations: GraphRelation[]): number {
  return relations.filter((rel) => relationProvenanceLevel(rel).verified_primary).length;
}

export function provenanceCoverage(relations: GraphRelation[]): number {
  if (!relations.length) return 0;
  const exact = relations.filter((rel) => {
    const v = relationProvenanceLevel(rel);
    return (
      v.verified_primary ||
      v.level === "TRUSTED_DATASET_EXACT" ||
      v.level === "CROSS_SOURCE_CONFIRMED"
    );
  }).length;
  return exact / relations.length;
}

export function edgeKindCounts(relations: GraphRelation[]) {
  const counts = { SOURCE_TRUTH: 0, DERIVED_RULE: 0, PERSONALIZED_DECISION: 0, UNKNOWN: 0 };
  for (const rel of relations) counts[classifyEdgeKind(rel)] += 1;
  return counts;
}

export function genericUrlCount(urls: Array<string | undefined>): number {
  return urls.filter((u) => isGenericSourceUrl(u)).length;
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.floor((p / 100) * (s.length - 1))));
  return s[idx] ?? 0;
}

export function axisDistribution(values: number[]) {
  return {
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    p10: percentile(values, 10),
    p25: percentile(values, 25),
    median: percentile(values, 50),
    p75: percentile(values, 75),
    p90: percentile(values, 90),
    mean: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
  };
}

export { inspectRequiredFields, inspectPayloadKeys };

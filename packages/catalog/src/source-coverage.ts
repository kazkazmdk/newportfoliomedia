import type { GraphStore, PageRecord } from "@penta/graph-core";
import { validateFactProvenance, type ProvenanceLevel } from "@penta/data-provenance";
import { PAGE_REQUIREMENTS } from "@penta/quality-gate";

export const DECISION_FACT_WEIGHTS = {
  critical: 3,
  supporting: 2,
  descriptive: 0.5,
} as const;

export type DecisionFactRole = keyof typeof DECISION_FACT_WEIGHTS;

export const QUALIFYING_EVIDENCE_LEVELS: ReadonlySet<ProvenanceLevel> = new Set([
  "PRIMARY_EXACT",
  "PRIMARY_GENERAL",
  "REGULATORY_EXACT",
  "TRUSTED_DATASET_EXACT",
  "DATASET_GENERAL",
  "PRIMARY_DATABASE_GENERAL",
  "TRUSTED_THIRD_PARTY",
  "CROSS_SOURCE_CONFIRMED",
]);

export type DecisionFact = {
  key: string;
  role: DecisionFactRole;
  evidenceLevel: ProvenanceLevel | "NONE";
  modelled?: boolean;
  assumptionsDeclared?: boolean;
};

export type SourceCoverageReport = {
  sourceCoverage: number;
  decisionFacts: number;
  sourcedDecisionFacts: number;
  weightedFacts: number;
  weightedSourced: number;
  facts: DecisionFact[];
};

function bestLevel(levels: Array<ProvenanceLevel | "NONE">): ProvenanceLevel | "NONE" {
  const order: Array<ProvenanceLevel | "NONE"> = [
    "PRIMARY_EXACT",
    "REGULATORY_EXACT",
    "TRUSTED_DATASET_EXACT",
    "PRIMARY_GENERAL",
    "DATASET_GENERAL",
    "PRIMARY_DATABASE_GENERAL",
    "CROSS_SOURCE_CONFIRMED",
    "TRUSTED_THIRD_PARTY",
    "DERIVED_HEURISTIC",
    "EDITORIAL",
    "UNVERIFIED_DATASET",
    "UNKNOWN",
    "AI_INFERRED",
    "NONE",
  ];
  return order.find((level) => levels.includes(level)) ?? "NONE";
}

export function evidenceQualifies(
  level: ProvenanceLevel | "NONE",
  fact: Pick<DecisionFact, "modelled" | "assumptionsDeclared">,
): boolean {
  if (level !== "NONE" && QUALIFYING_EVIDENCE_LEVELS.has(level as ProvenanceLevel)) return true;
  return level === "DERIVED_HEURISTIC" && Boolean(fact.modelled && fact.assumptionsDeclared);
}

export function coverageFromFacts(facts: DecisionFact[]): SourceCoverageReport {
  let weightedFacts = 0;
  let weightedSourced = 0;
  let sourcedDecisionFacts = 0;
  for (const fact of facts) {
    const weight = DECISION_FACT_WEIGHTS[fact.role];
    weightedFacts += weight;
    if (evidenceQualifies(fact.evidenceLevel, fact)) {
      weightedSourced += weight;
      sourcedDecisionFacts += 1;
    }
  }
  const sourceCoverage = weightedFacts === 0 ? 0 : Math.round((weightedSourced / weightedFacts) * 1000) / 1000;
  return {
    sourceCoverage,
    decisionFacts: facts.length,
    sourcedDecisionFacts,
    weightedFacts,
    weightedSourced,
    facts,
  };
}

function provenanceLevelOf(store: GraphStore, page: PageRecord): ProvenanceLevel | "NONE" {
  const ents = page.entity_ids.map((id) => store.get(id)).filter(Boolean);
  const rels = page.entity_ids.flatMap((id) => store.related(id));
  const levels: Array<ProvenanceLevel | "NONE"> = [];
  for (const rec of [...ents.flatMap((e) => e!.provenance), ...rels.flatMap((r) => r.provenance)]) {
    const v = validateFactProvenance({
      source_type: rec.source_type,
      source_url: rec.source_url,
      source_name: rec.source_name,
      retrieved_at: rec.retrieved_at,
      verified_at: rec.verified_at,
      verification_method: rec.verification_method,
      locator: rec.locator,
    });
    levels.push(v.level);
  }
  return bestLevel(levels);
}

function modelledPage(page: PageRecord): boolean {
  const kind = String(page.structured_payload.price_kind ?? page.structured_payload.cost_class ?? "");
  return (
    page.structured_payload.modelled === true ||
    page.structured_payload.cost_class === "MODELLED" ||
    kind === "HEURISTIC_PRICE" ||
    kind === "ESTIMATED_PRICE"
  );
}

function assumptionsDeclared(page: PageRecord): boolean {
  if (page.structured_payload.assumptions_declared === true) return true;
  const assumptions = page.structured_payload.assumptions;
  return Array.isArray(assumptions) && assumptions.length > 0;
}

export function deriveDecisionFacts(page: PageRecord, store?: GraphStore): DecisionFact[] {
  const stored = page.structured_payload.decision_facts;
  if (Array.isArray(stored) && stored.length) {
    return stored.filter((row): row is DecisionFact => {
      return Boolean(row && typeof row === "object" && "key" in row && "role" in row);
    });
  }
  const spec = PAGE_REQUIREMENTS[page.family];
  const payload = page.structured_payload;
  const level = store ? provenanceLevelOf(store, page) : "NONE";
  const modelled = modelledPage(page);
  const declared = assumptionsDeclared(page);
  const facts: DecisionFact[] = [];
  const seen = new Set<string>();
  const push = (key: string, role: DecisionFactRole) => {
    if (!key || seen.has(key)) return;
    if (payload[key] == null && role !== "descriptive") return;
    seen.add(key);
    facts.push({ key, role, evidenceLevel: level, modelled, assumptionsDeclared: declared });
  };
  if (spec) {
    for (const key of spec.mandatory) push(key, "critical");
    for (const key of spec.decision_critical) push(key, "critical");
    for (const key of spec.optional) push(key, "supporting");
    for (const key of spec.provenance_required) push(key, "critical");
  }
  for (const key of ["match", "max_power", "bottleneck", "meaning", "causes", "layers", "modes", "spec", "viscosity", "capacity_l", "pressure_bar_front"]) {
    push(key, "critical");
  }
  return facts;
}

export function computeSourceCoverage(page: PageRecord, store?: GraphStore): SourceCoverageReport {
  return coverageFromFacts(deriveDecisionFacts(page, store));
}

/** Stored coverage only. Never inferred from quality_score or entity count. */
export function sourceCoverageOf(page: PageRecord): number {
  const stored = page.structured_payload.source_coverage;
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return Math.max(0, Math.min(1, stored));
  }
  const storedFacts = page.structured_payload.decision_facts;
  if (Array.isArray(storedFacts) && storedFacts.length) {
    return coverageFromFacts(deriveDecisionFacts(page)).sourceCoverage;
  }
  return 0;
}

export const SOURCE_COVERAGE_PUBLISHABLE_FLOOR = 0.75;

/**
 * PUBLISHABLE pages should usually keep critical-fact coverage >= 0.75.
 * MODELLED / TYPICAL TripCost pages may sit below that floor when assumptions
 * are declared: the gate still requires identifiable modelled evidence, not live fares.
 */
export function sourceCoverageMeetsPublishableFloor(page: PageRecord, coverage: SourceCoverageReport): boolean {
  if (coverage.sourceCoverage >= SOURCE_COVERAGE_PUBLISHABLE_FLOOR) return true;
  return modelledPage(page) && assumptionsDeclared(page) && coverage.weightedFacts > 0;
}

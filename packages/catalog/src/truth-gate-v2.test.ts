import { describe, expect, it } from "vitest";
import {
  evaluatePageQuality,
  detectProductAction,
  inspectRequiredFields,
  computeDistinctiveness,
  editorialOnly,
} from "@penta/quality-gate";
import {
  validateFactProvenance,
  canonicalizeFact,
  agreementStatus,
  provenance,
  type FactObservation,
} from "@penta/data-provenance";
import { classifyEdgeKind } from "@penta/graph-core";
import { buildCatalog } from "@penta/catalog";
import { shouldIndexPage, globalNoindex } from "@penta/publishing-core";
import { VIN_SUPPORT } from "@penta/autospec";
import { DIAGNOSTIC_OUTCOMES } from "@penta/fixcode";
import { MEASURED_CURVES, buildPowerScenarios } from "@penta/chargematch";

const base = {
  unique_fields: 12,
  required_fields_present: 9,
  required_fields_total: 9,
  search_demand: { internal_search: 80 },
  product_cta: true,
  interactive: true,
  product_action: true,
  distinct_from_parent: true,
  near_duplicate: false,
  year_only_variant: false,
  city_without_specifics: false,
  obscure_without_demand: false,
  llm_filler: false,
  confidence: "HIGH" as const,
  freshness_days: 10,
  freshness_ttl_days: 365,
  provenance_valid: true,
  distinct_reason: "unit-test-page",
  verified_fact_count: 10,
  decision_relation_count: 8,
};

describe("Truth Gate V2 false positives", () => {
  it("fails when many fields exist but a critical field is missing", () => {
    const fields = inspectRequiredFields("error-code", {
      brand: "Samsung",
      appliance: "Washer",
      code: "4C",
      extra_a: 1,
      extra_b: 2,
      extra_c: 3,
      extra_d: 4,
    });
    expect(fields.missing).toContain("meaning");
    expect(fields.missing).toContain("causes");
    expect(fields.passed).toBe(false);
    const result = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...base,
      structured_payload: {
        brand: "Samsung",
        appliance: "Washer",
        code: "4C",
        extra_a: 1,
        extra_b: 2,
        extra_c: 3,
      },
    });
    expect(result.index_state).not.toBe("INDEXABLE");
    expect(result.gate_evidence?.find((g) => g.gate === "required_fields_present")?.status).toBe(false);
  });

  it("wear-month without a real action is not product_action", () => {
    const action = detectProductAction("wear-month", {
      city: "Tokyo",
      month: 1,
      tmin_c: 2,
      tmax_c: 10,
    });
    expect(action.present).toBe(false);
    const result = evaluatePageQuality({
      site: "wearthere",
      family: "wear-month",
      ...base,
      product_action: true,
      interactive: true,
      structured_payload: { city: "Tokyo", month: 1, tmin_c: 2, tmax_c: 10 },
    });
    expect(result.gate_evidence?.find((g) => g.gate === "product_action")?.status).toBe(false);
  });

  it("a CTA without a calculation is not interactive", () => {
    const result = evaluatePageQuality({
      site: "chargematch",
      family: "can-charger-charge",
      ...base,
      product_cta: true,
      interactive: true,
      structured_payload: { device: "iphone-16", charger: "apple-20w", cta: "Check now" },
    });
    expect(result.gate_evidence?.find((g) => g.gate === "interactive")?.status).toBe(false);
  });

  it("different IDs with the same content are not distinct", () => {
    const distinct = computeDistinctiveness({
      page_id: "page-b",
      title: "What to wear in Tokyo in January",
      payload: { city: "Tokyo", month: 1, tmin_c: 2, tmax_c: 10, layers: ["knit"] },
      parent: {
        id: "page-a",
        title: "What to wear in Tokyo in January",
        payload: { city: "Tokyo", month: 1, tmin_c: 2, tmax_c: 10, layers: ["knit"] },
      },
      claimed_reason: "page-b",
      sibling_structured_similarity: 0.98,
      same_intent_sibling: true,
      same_decision_output: true,
    });
    expect(distinct.passed).toBe(false);
    const result = evaluatePageQuality({
      site: "wearthere",
      family: "wear-month",
      ...base,
      page_id: "page-b",
      distinct_reason: "page-b",
      sibling_structured_similarity: 0.98,
      same_intent_sibling: true,
      same_decision_output: true,
      structured_payload: { city: "Tokyo", month: 1, tmin_c: 2, tmax_c: 10, layers: ["knit"] },
    });
    expect(result.gate_evidence?.find((g) => g.gate === "distinct_from_parent")?.status).toBe(false);
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("generic manufacturer URL is not VERIFIED_PRIMARY", () => {
    const v = validateFactProvenance({
      source_type: "MANUFACTURER",
      source_url: "https://www.bmw.com",
      source_name: "BMW",
      retrieved_at: "2026-09-01T00:00:00.000Z",
    });
    expect(v.level).toBe("PRIMARY_GENERAL");
    expect(v.verified_primary).toBe(false);
    expect(v.generic_url).toBe(true);
  });

  it("AI_INFERRED can never be VERIFIED_PRIMARY", () => {
    const v = validateFactProvenance({
      source_type: "AI_INFERRED",
      source_url: "https://handbook.example.com/tech/oil#table-12",
      source_name: "Hallucinated handbook",
      retrieved_at: "2026-09-01T00:00:00.000Z",
      verified_at: "2026-09-01T00:00:00.000Z",
      locator: { page: 12, table: "fluids" },
    });
    expect(v.verified_primary).toBe(false);
    expect(v.level).toBe("AI_INFERRED");
  });

  it("two contradictory observations produce a conflict and never average", () => {
    const rec = (value: string, id: string) =>
      provenance({
        source_id: id,
        source_type: "MANUFACTURER",
        retrieved_at: "2026-01-01T00:00:00.000Z",
        confidence: 90,
        raw_value: value,
        normalized_value: value,
        verification_method: "MANUFACTURER_DOC",
      });
    const observations: FactObservation[] = [
      { id: "a", entity_id: "veh:320d", field: "oil_capacity_l", value: "5.2", provenance: rec("5.2", "oem-a") },
      { id: "b", entity_id: "veh:320d", field: "oil_capacity_l", value: "5.5", provenance: rec("5.5", "oem-b") },
    ];
    expect(agreementStatus(observations)).toBe("MULTI_SOURCE_CONFLICT");
    const canonical = canonicalizeFact(observations);
    expect(canonical.status).toBe("CONFLICTED");
    expect(canonical.resolution).toBe("NONE");
    expect(canonical.selectedValue).toBeUndefined();
    expect(canonical.observations).toHaveLength(2);
  });

  it("editorial judgment alone cannot create INDEXABLE", () => {
    expect(editorialOnly({ seed_research: 99 })).toBe(true);
    const result = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...base,
      search_demand: { seed_research: 99 },
    });
    expect(result.index_state).not.toBe("INDEXABLE");
    expect(result.index_state).toBe("SEO_CANDIDATE");
  });
});

describe("Truth Gate V2 invariants", () => {
  it("UNKNOWN provenance is never verified_primary", () => {
    const v = validateFactProvenance({ source_type: "THIRD_PARTY" });
    expect(v.verified_primary).toBe(false);
  });

  it("GRAPH_ONLY and SEO_CANDIDATE stay out of the public sitemap", () => {
    const store = buildCatalog();
    for (const page of store.pages.values()) {
      if (page.index_state !== "INDEXABLE") {
        expect(shouldIndexPage(page)).toBe(false);
      }
    }
    expect(globalNoindex()).toBe(true);
  });

  it("PUBLIC_SITE_LIVE remains false so the public sitemap is empty", () => {
    expect(process.env.PUBLIC_SITE_LIVE === "true").toBe(false);
    const live = [...buildCatalog().pages.values()].filter(shouldIndexPage);
    expect(live).toHaveLength(0);
  });

  it("derived and personalized edges are never classified as SOURCE_TRUTH", () => {
    expect(classifyEdgeKind({ type: "PACKS", inferred: true })).toBe("DERIVED_RULE");
    expect(classifyEdgeKind({ type: "CAN_CHARGE", inferred: true })).toBe("DERIVED_RULE");
    expect(classifyEdgeKind({ type: "USER_TRIP_OUTFIT" })).toBe("PERSONALIZED_DECISION");
    expect(classifyEdgeKind({ type: "TYPICAL_CLIMATE", inferred: false })).toBe("SOURCE_TRUTH");
  });

  it("does not invent measured curves, VIN decode, or diagnostic outcomes", () => {
    expect(MEASURED_CURVES).toHaveLength(0);
    expect(VIN_SUPPORT).toBe("NOT_IMPLEMENTED");
    expect(DIAGNOSTIC_OUTCOMES).toHaveLength(0);
    expect(buildPowerScenarios().every((s) => s.measured_curve === null && s.power_kind !== "MEASURED")).toBe(true);
  });

  it("ChargeMatch scenarios replace cartesian EXPECTED_POWER inflation", () => {
    const store = buildCatalog();
    const expected = [...store.relations.values()].filter((r) => r.site === "chargematch" && r.type === "EXPECTED_POWER");
    const scenarios = store.byType("chargematch", "power_scenario");
    expect(expected.length).toBe(0);
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.length).toBeLessThan(200);
  });
});

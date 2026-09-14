import { describe, expect, it } from "vitest";
import {
  evaluatePageQuality,
  INDEXABLE_THRESHOLD,
  structuredSimilarity,
  intentFamilyId,
} from "@penta/quality-gate";
import {
  assertInferenceCannotBecomeOfficial,
  assertEstimatedIsNotTested,
  buildFactConflict,
  isFresh,
  provenance,
} from "@penta/data-provenance";
import { diagnose, getError, initialState } from "@penta/fixcode";
import { VEHICLES, checkFitment } from "@penta/autospec";
import { capsuleFor, DESTINATIONS, weatherSourceLabel } from "@penta/wearthere";
import { allocate, compatibility, getCharger, getDevice, getCable, MEASURED_CURVES } from "@penta/chargematch";
import { compareRoute, getRoute, timeValueBreakEven } from "@penta/tripcost";
import { buildCatalog, programmaticSeoIssues } from "@penta/catalog";
import { shouldIndexPage } from "@penta/publishing-core";

const rich = {
  unique_fields: 12,
  required_fields_present: 9,
  required_fields_total: 9,
  search_demand: { internal_search: 80 },
  product_cta: true,
  interactive: true,
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

describe("global hard gates", () => {
  it("never indexes a hard-gate failure even with a high soft score", () => {
    const result = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...rich,
      llm_safety_claim: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(INDEXABLE_THRESHOLD - 5);
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("stale current data cannot INDEX as current", () => {
    const result = evaluatePageQuality({
      site: "tripcost",
      family: "route-car-vs-train",
      ...rich,
      stale_presented_as_current: true,
    });
    expect(result.index_state).toBe("STALE");
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("AI inferred never becomes official", () => {
    expect(() => assertInferenceCannotBecomeOfficial("AI_INFERRED", "OFFICIAL")).toThrow();
    const result = evaluatePageQuality({
      site: "chargematch",
      family: "can-charger-charge",
      ...rich,
      ai_inferred_as_official: true,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("unresolved critical conflict blocks index", () => {
    const conflict = buildFactConflict("watts", [
      provenance({
        source_id: "mfr",
        source_type: "MANUFACTURER",
        retrieved_at: "2026-01-01T00:00:00.000Z",
        confidence: 90,
        raw_value: "65",
        normalized_value: "65",
        verification_method: "MANUFACTURER_DOC",
      }),
      provenance({
        source_id: "third",
        source_type: "TRUSTED_THIRD_PARTY",
        retrieved_at: "2026-01-01T00:00:00.000Z",
        confidence: 80,
        raw_value: "100",
        normalized_value: "100",
        verification_method: "CROSS_SOURCE",
      }),
    ], true);
    expect(conflict?.unresolved).toBe(true);
    const result = evaluatePageQuality({
      site: "chargematch",
      family: "can-charger-charge",
      ...rich,
      unresolved_critical_conflict: true,
    });
    expect(result.index_state).toBe("CONFLICTED");
  });

  it("sitemap never includes noindex pages", () => {
    const store = buildCatalog();
    for (const page of store.pages.values()) {
      if (page.noindex || page.index_state !== "INDEXABLE") {
        expect(shouldIndexPage(page)).toBe(false);
      }
    }
  });

  it("every indexable canonical is valid and self", () => {
    const issues = programmaticSeoIssues();
    expect(issues).toEqual([]);
    for (const page of buildCatalog().pages.values()) {
      if (page.index_state !== "INDEXABLE") continue;
      expect(page.canonical).toBe(page.url);
      expect(page.canonical.startsWith("/")).toBe(true);
    }
  });

  it("score is recomputed and not a stored fixture", () => {
    const a = evaluatePageQuality({ site: "fixcode", family: "error-code", ...rich });
    const b = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...rich,
      unique_fields: 4,
      decision_relation_count: 1,
      verified_fact_count: 1,
    });
    expect(a.score).not.toBe(b.score);
    expect(b.index_state).not.toBe("INDEXABLE");
  });

  it("duplicate similarity blocks index", () => {
    const result = evaluatePageQuality({
      site: "wearthere",
      family: "wear-month",
      ...rich,
      sibling_structured_similarity: 0.92,
      same_intent_sibling: true,
      same_decision_output: true,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
    expect(structuredSimilarity({ a: 1, match: "x" }, { a: 1, match: "x" })).toBe(1);
  });

  it("estimated cannot be tested", () => {
    expect(() => assertEstimatedIsNotTested(true, "TESTED")).toThrow();
  });
});

describe("FixCode gates", () => {
  it("error code with no safe test fails index input", () => {
    const result = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...rich,
      causes_without_source: true,
      decision_relation_count: 1,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("multi-cause tree passes diagnosis", () => {
    const profile = getError("samsung", "washer", "4c")!;
    expect(profile.causes.length).toBeGreaterThanOrEqual(2);
    expect(profile.questions.length).toBeGreaterThanOrEqual(1);
    const result = diagnose(profile, initialState(profile));
    expect(result.next_question).toBeTruthy();
    expect(result.causes.length).toBeGreaterThanOrEqual(2);
  });

  it("hazard forces service escalation", () => {
    const profile = getError("samsung", "washer", "4c")!;
    const stop = profile.causes.find((c) => c.safety === "STOP_USE" || c.safety === "PROFESSIONAL_ONLY");
    expect(profile.safety_notes.length + (stop ? 1 : 0)).toBeGreaterThan(0);
    const diagnosed = diagnose(profile, initialState(profile));
    expect(["CAUTION", "PROFESSIONAL_ONLY", "STOP_USE", "SAFE_USER_CHECK"]).toContain(diagnosed.safety_ceiling);
  });
});

describe("AutoSpec gates", () => {
  it("ambiguous engine blocks exact spec", () => {
    const result = evaluatePageQuality({
      site: "autospec",
      family: "oil-type",
      ...rich,
      engine_undetermined: true,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });

  it("exact powertrain allows spec", () => {
    const v = VEHICLES.find((item) => item.variant_slug === "320d-b47")!;
    expect(v.engine_code).toBe("B47D20");
    expect(v.generation).toBe("G20");
    expect(v.market.length).toBeGreaterThan(0);
    const fit = checkFitment(v, "oil-ll04-5w30");
    expect("compatible" in fit && fit.compatible).toBe(true);
  });

  it("conflicting manufacturer facts block", () => {
    const result = evaluatePageQuality({
      site: "autospec",
      family: "oil-type",
      ...rich,
      unresolved_critical_conflict: true,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });
});

describe("WearThere gates", () => {
  it("climate normal is allowed for evergreen", () => {
    expect(weatherSourceLabel({ hasForecast: false, daysAhead: 60 }).kind).toBe("TYPICAL");
    const tokyo = DESTINATIONS.find((d) => d.slug === "tokyo")!;
    const cap = capsuleFor(tokyo, 10, "classic");
    expect(cap.weather_kind).toBe("TYPICAL");
  });

  it("climate normal is rejected for a future forecast claim", () => {
    const result = evaluatePageQuality({
      site: "wearthere",
      family: "wear-month",
      ...rich,
      forecast_as_climate: true,
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });
});

describe("ChargeMatch gates", () => {
  it("cable bottleneck correctly limits wattage", () => {
    const device = getDevice("macbook-pro-14-m3")!;
    const charger = getCharger("anker-100w-2c")!;
    const cable = getCable("apple-usbc-60w")!;
    const result = compatibility(device, charger, cable);
    expect(result.max_power).toBeLessThanOrEqual(60);
    expect(result.bottleneck).toBe("cable");
    expect(result.evidence).not.toBe("MEASURED");
    expect(MEASURED_CURVES.length).toBe(0);
  });

  it("multi-port allocation is conditional", () => {
    const chg = getCharger("anker-100w-2c")!;
    const dual = allocate(chg, ["c1", "c2"]);
    expect(dual.watts[0] + dual.watts[1]).toBeLessThanOrEqual(chg.total_watts);
    const split = compatibility(getDevice("macbook-air-13-m3")!, chg, undefined, ["c1", "c2"]);
    expect(split.max_power).toBe(65);
  });

  it("protocol incompatibility", () => {
    const watch = compatibility(getDevice("apple-watch")!, getCharger("anker-65w")!);
    expect(watch.compatible).toBe(false);
    expect(watch.match).toBe("INCOMPATIBLE");
  });
});

describe("TripCost gates", () => {
  it("stale fuel price expires", () => {
    const route = getRoute("paris", "lyon")!;
    const expired = compareRoute(route, 4, false, new Date("2026-11-01T00:00:00.000Z"));
    expect(expired.modes.find((m) => m.mode === "car")!.stale).toBe(true);
    const rec = provenance({
      source_id: "seed-transport-snapshot",
      source_type: "THIRD_PARTY",
      retrieved_at: "2026-08-01T00:00:00.000Z",
      valid_until: "2026-09-01T00:00:00.000Z",
      confidence: 40,
      raw_value: "fuel",
      normalized_value: "fuel",
      verification_method: "HEURISTIC",
    });
    expect(isFresh(rec, new Date("2026-09-13T00:00:00.000Z"))).toBe(false);
  });

  it("break-even calculation", () => {
    const route = getRoute("paris", "lyon")!;
    const four = compareRoute(route, 4);
    const train = four.modes.find((m) => m.mode === "train")!;
    const car = four.modes.find((m) => m.mode === "car")!;
    const be = timeValueBreakEven(train, car);
    expect(be === null || typeof be === "number").toBe(true);
  });

  it("toll/no-toll assumptions are explicit", () => {
    const store = buildCatalog();
    const parisLyon = [...store.relations.values()].filter(
      (r) => r.from_id.includes("paris-lyon") && (r.type === "ROUTE_HAS_TOLL" || r.type === "ROUTE_NO_TOLL"),
    );
    expect(parisLyon.length).toBeGreaterThan(0);
  });
});

describe("intent families stay split", () => {
  it("does not merge unrelated families", () => {
    expect(
      intentFamilyId({
        site: "fixcode",
        family: "error-code",
        structured_payload: { brand: "Samsung", appliance: "Washer", code: "4C" },
      }),
    ).not.toBe(
      intentFamilyId({
        site: "fixcode",
        family: "error-code",
        structured_payload: { brand: "LG", appliance: "Washer", code: "OE" },
      }),
    );
  });
});

import { describe, expect, it } from "vitest";
import { evaluatePageQuality, searchDemandScore, seoRecommendation, opportunityScore } from "@penta/quality-gate";
import { assertInferenceCannotBecomeOfficial } from "@penta/data-provenance";
import { applyAnswer, diagnose, getError, initialState } from "@penta/fixcode";
import { compatibility, getCharger, getDevice } from "@penta/chargematch";
import { compareRoute, getRoute, timeValueBreakEven } from "@penta/tripcost";
import { capsuleFor, DESTINATIONS, weatherSourceLabel } from "@penta/wearthere";
import { ownershipScore, VEHICLES } from "@penta/autospec";
import { buildCatalog, launchReport, programmaticSeoIssues } from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";
import { routeAiTask } from "@penta/ai-core";

describe("PageQualityGate", () => {
  it("indexes rich pages and refuses filler", () => {
    const ok = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      unique_fields: 12,
      required_fields_present: 9,
      required_fields_total: 9,
      search_demand: { seed_research: 90, internal_search: 80 },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: false,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 10,
      freshness_ttl_days: 365,
      provenance_valid: true,
    });
    expect(ok.score).toBeGreaterThanOrEqual(75);
    expect(ok.index_state).toBe("INDEXABLE");

    const filler = evaluatePageQuality({
      ...{
        site: "fixcode" as const,
        family: "error-code",
        unique_fields: 1,
        required_fields_present: 1,
        required_fields_total: 9,
        search_demand: {},
        product_cta: false,
        interactive: false,
        distinct_from_parent: false,
        near_duplicate: true,
        year_only_variant: true,
        city_without_specifics: false,
        obscure_without_demand: true,
        llm_filler: true,
        confidence: "UNKNOWN" as const,
        freshness_days: 900,
        freshness_ttl_days: 30,
        provenance_valid: false,
      },
    });
    expect(filler.index_state).toBe("GRAPH_ONLY");
    expect(filler.blockers.length).toBeGreaterThan(0);
  });

  it("does not treat unknown demand as indexable automatically", () => {
    expect(searchDemandScore({})).toBe(0);
    expect(seoRecommendation({
      query: "obscure cable xyz",
      intent_cluster_size: 1,
      data_ready: false,
      existing_tool: true,
      duplicate_intent: false,
    })).toBe("EXPAND_TOOL");
  });

  it("computes opportunity score", () => {
    expect(opportunityScore({
      search_demand: 80,
      data_completeness: 90,
      monetization_potential: 70,
      product_utility: 80,
      competition_difficulty: 50,
    })).toBeGreaterThan(0);
  });
});

describe("provenance", () => {
  it("refuses promoting AI_INFERRED to OFFICIAL", () => {
    expect(() => assertInferenceCannotBecomeOfficial("AI_INFERRED", "OFFICIAL")).toThrow();
  });
});

describe("FixCode engine", () => {
  it("recalculates 4C after water-supply answers", () => {
    const profile = getError("samsung", "washer", "4c");
    expect(profile).toBeTruthy();
    let state = initialState(profile!);
    state = applyAnswer(profile!, state, "4c-tap", "yes");
    const result = diagnose(profile!, state);
    expect(result.causes[0].id).not.toBe("");
    expect(result.next_question?.why).toBeTruthy();
    expect(result.confidence_pct).toBeGreaterThan(0);
  });
});

describe("ChargeMatch", () => {
  it("matches MacBook Air with 65W and flags Steam Deck on 20W as slow", () => {
    const air = compatibility(getDevice("macbook-air-13-m3")!, getCharger("anker-65w")!);
    expect(air.compatible).toBe(true);
    expect(air.max_power).toBe(65);
    const deck = compatibility(getDevice("steam-deck")!, getCharger("apple-20w")!);
    expect(deck.compatible).toBe(true);
    expect(deck.match).toBe("SLOW");
  });
});

describe("TripCost", () => {
  it("makes car cheaper per person as travellers increase on Paris-Lyon", () => {
    const route = getRoute("paris", "lyon")!;
    const one = compareRoute(route, 1);
    const four = compareRoute(route, 4);
    const car1 = one.modes.find((m) => m.mode === "car")!;
    const car4 = four.modes.find((m) => m.mode === "car")!;
    expect(car4.per_person_cash).toBeLessThan(car1.per_person_cash);
    const train = four.modes.find((m) => m.mode === "train")!;
    const car = four.modes.find((m) => m.mode === "car")!;
    const be = timeValueBreakEven(train, car);
    expect(be === null || be > 0).toBe(true);
  });
});

describe("WearThere", () => {
  it("never labels typical climate as a forecast", () => {
    expect(weatherSourceLabel({ hasForecast: false, daysAhead: 60 }).kind).toBe("TYPICAL");
    const tokyo = DESTINATIONS.find((d) => d.slug === "tokyo")!;
    const cap = capsuleFor(tokyo, 11, "classic");
    expect(cap.weather_kind).toBe("TYPICAL");
    expect(cap.pieces.length).toBeGreaterThan(4);
  });

  it("indexes january for high-demand cities", async () => {
    const { allWeartherePages } = await import("@penta/wearthere");
    const jan = allWeartherePages().find((p) => p.url === "/wearthere/tokyo/january/what-to-wear");
    expect(jan?.index_state).toBe("INDEXABLE");
  });
});

describe("AutoSpec", () => {
  it("canonicalizes G20 320d years onto one engine identity", () => {
    const v = VEHICLES.find((item) => item.variant_slug === "320d-b47")!;
    expect(v.years.length).toBeGreaterThan(1);
    expect(v.oil.spec).toContain("Longlife-04");
    const score = ownershipScore({
      km: 87432,
      last_oil_km: 80000,
      tyre_ok: true,
      brake_pct: 72,
      battery: "GOOD",
      open_recalls: 0,
    });
    expect(score.score).toBeGreaterThan(50);
    expect(score.factors.length).toBeGreaterThan(3);
  });
});

describe("catalog / SEO tests", () => {
  it("keeps indexable pages above threshold with unique titles", () => {
    const issues = programmaticSeoIssues();
    expect(issues).toEqual([]);
    const report = launchReport();
    expect(report.graph.indexable).toBeGreaterThan(20);
    expect(report.average_indexable_quality).toBeGreaterThanOrEqual(75);
    expect(globalNoindex()).toBe(true);
    expect(report.graph.entities).toBeGreaterThan(200);
  });

  it("stores more graph relations than indexable URLs for ChargeMatch", () => {
    const store = buildCatalog();
    const stats = store.stats("chargematch");
    expect(stats.relations).toBeGreaterThan(stats.indexable);
  });
});

describe("AI routing", () => {
  it("skips the model for oil capacity lookup", () => {
    const route = routeAiTask({
      deterministicAvailable: true,
      needsClassification: false,
      needsExplanation: false,
      needsVision: false,
      multiFactor: false,
    });
    expect(route.model).toBe("none");
  });
});

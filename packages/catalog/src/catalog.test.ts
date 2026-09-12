import { describe, expect, it } from "vitest";
import { evaluatePageQuality, searchDemandScore, seoRecommendation, classifyDemand } from "@penta/quality-gate";
import { assertInferenceCannotBecomeOfficial } from "@penta/data-provenance";
import { applyAnswer, diagnose, getError, getSymptom, initialState, likelihoodLabel, BRANDS } from "@penta/fixcode";
import { allocate, compatibility, getCharger, getDevice } from "@penta/chargematch";
import { compareRoute, getRoute, timeValueBreakEven } from "@penta/tripcost";
import { capsuleFor, DESTINATIONS, weatherSourceLabel } from "@penta/wearthere";
import { checkFitment, ownershipScore, VEHICLES } from "@penta/autospec";
import { buildCatalog, coverageReport, launchReport, programmaticSeoIssues } from "@penta/catalog";
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

  it("fails hard gates even with a high soft score shape", () => {
    const fail = evaluatePageQuality({
      site: "chargematch",
      family: "can-charger-charge",
      unique_fields: 20,
      required_fields_present: 9,
      required_fields_total: 9,
      search_demand: { internal_search: 99 },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: false,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 1,
      freshness_ttl_days: 180,
      provenance_valid: true,
      llm_safety_claim: true,
    });
    expect(fail.score).toBeGreaterThanOrEqual(75);
    expect(fail.index_state).toBe("GRAPH_ONLY");
    expect(fail.hard_gates.some((g) => g.id === "not_llm_safety_claim" && !g.passed)).toBe(true);
  });

  it("caps editorial demand and does not treat it as GSC", () => {
    const d = classifyDemand({ seed_research: 90 });
    expect(d.kind).toBe("EDITORIAL_JUDGMENT");
    expect(d.score).toBeLessThanOrEqual(40);
    expect(d.confidence).toBe("LOW");
  });
});

describe("provenance", () => {
  it("refuses promoting AI_INFERRED to OFFICIAL", () => {
    expect(() => assertInferenceCannotBecomeOfficial("AI_INFERRED", "OFFICIAL")).toThrow();
  });
});

describe("FixCode engine", () => {
  it("recalculates 4C after water-supply answers without fake calibrated %", () => {
    const profile = getError("samsung", "washer", "4c");
    expect(profile).toBeTruthy();
    let state = initialState(profile!);
    state = applyAnswer(profile!, state, "4c-tap", "yes");
    const result = diagnose(profile!, state);
    expect(result.causes[0].id).not.toBe("");
    expect(result.next_question?.why).toBeTruthy();
    expect(result.display_probabilities).toBe(false);
    expect(result.causes[0].likelihood_label).toMatch(/likelihood|Possible/);
    expect(result.rule_version).toBe("diagnostic-v3");
    expect(profile!.provenance.length).toBeGreaterThan(0);
  });

  it("covers Bosch dishwasher E15, LG washer OE, and not-draining", () => {
    const e15 = getError("bosch", "dishwasher", "e15")!;
    const oe = getError("lg", "washer", "oe")!;
    const drain = getSymptom("samsung", "washer", "not-draining")!;
    expect(e15.meaning.toLowerCase()).toMatch(/aqua|base|leak/);
    expect(oe.meaning.toLowerCase()).toMatch(/drain/);
    expect(drain.symptom.toLowerCase()).toMatch(/drain/);
    expect(diagnose(e15, initialState(e15)).safety_ceiling).toBeTruthy();
    expect(BRANDS).toHaveLength(4);
  });

  it("maps document priors to labels, not invented percents", () => {
    expect(likelihoodLabel(0.4)).toBe("High likelihood");
    expect(likelihoodLabel(0.2)).toBe("Medium likelihood");
    expect(likelihoodLabel(0.05)).toBe("Possible");
  });
});

describe("ChargeMatch", () => {
  it("matches MacBook Air with 65W and flags Steam Deck on 20W as slow", () => {
    const air = compatibility(getDevice("macbook-air-13-m3")!, getCharger("anker-65w")!);
    expect(air.compatible).toBe(true);
    expect(air.max_power).toBe(65);
    expect(air.safe).toBe(false);
    expect(air.safety_note.toLowerCase()).toMatch(/unknown|certif/);
    const deck = compatibility(getDevice("steam-deck")!, getCharger("apple-20w")!);
    expect(deck.compatible).toBe(true);
    expect(deck.match).toBe("SLOW");
  });

  it("does not treat 100W charger as 100W on every port", () => {
    const chg = getCharger("anker-100w-2c")!;
    const dual = allocate(chg, ["c1", "c2"]);
    expect(dual.watts).toEqual([65, 30]);
    const phone = compatibility(getDevice("iphone-16")!, chg);
    const mba = compatibility(getDevice("macbook-air-13-m3")!, chg);
    expect(phone.max_power).toBeLessThanOrEqual(25);
    expect(mba.max_power).toBeLessThanOrEqual(70);
    const deck100 = compatibility(getDevice("steam-deck")!, chg);
    expect(deck100.max_power).toBe(45);
    const split = compatibility(getDevice("macbook-air-13-m3")!, chg, undefined, ["c1", "c2"]);
    expect(split.max_power).toBe(65);
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
    expect(car.assumptions.some((a) => a.toLowerCase().includes("cash"))).toBe(true);
    const flight = four.modes.find((m) => m.mode === "flight");
    if (flight) expect(flight.minutes_door).toBeGreaterThan(flight.minutes_in_vehicle);
    expect(car4.retrieved_at).toBeTruthy();
    expect(car4.stale).toBe(false);
  });
});

describe("WearThere", () => {
  it("never labels typical climate as a forecast", () => {
    expect(weatherSourceLabel({ hasForecast: false, daysAhead: 60 }).kind).toBe("TYPICAL");
    const tokyo = DESTINATIONS.find((d) => d.slug === "tokyo")!;
    const cap = capsuleFor(tokyo, 1, "classic");
    expect(cap.weather_kind).toBe("TYPICAL");
    expect(cap.weather.month).toBe(1);
    expect(cap.pieces.length).toBeGreaterThan(4);
    expect(cap.coverage.weather_coverage).toBeGreaterThan(0);
    expect(cap.pieces.some((p) => p.layer === "shell" || p.warmth >= 4)).toBe(true);
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
    expect(v.engine_code).toBe("B47D20");
    expect(v.years.length).toBeGreaterThan(1);
    expect(v.market).toContain("EU");
    expect(v.oil.spec).toContain("Longlife-04");
    expect(v.oil.capacity_liters).toBe(5);
    expect(v.battery.type).toBe("AGM");
    expect(v.tyres.pressure_bar_front).toBeGreaterThan(0);
    expect(v.services.length).toBeGreaterThan(3);
    expect(v.recalls.length).toBeGreaterThan(0);
    const fit = checkFitment(v, "oil-ll04-5w30");
    expect("compatible" in fit && fit.compatible).toBe(true);
    const unknown = checkFitment(v, "made-up-filter");
    expect(unknown.compatible).toBe(false);
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
    expect(report.graph.indexable).toBeLessThan(1200);
    expect(report.average_indexable_quality).toBeGreaterThanOrEqual(75);
    expect(globalNoindex()).toBe(true);
    expect(report.public_site_live).toBe(false);
    expect(report.global_noindex).toBe(true);
    expect(report.graph.entities).toBeGreaterThan(200);
    expect(report.graph.relations).toBeGreaterThanOrEqual(2500);
    expect(report.graph.decision_relevant_relations).toBeGreaterThan(2000);
    expect(report.graph.relations_per_entity).toBeGreaterThan(2);
  });

  it("stores more graph relations than indexable URLs for ChargeMatch", () => {
    const store = buildCatalog();
    const stats = store.stats("chargematch");
    expect(stats.relations).toBeGreaterThan(stats.indexable);
    expect(stats.relations).toBeGreaterThan(stats.pages);
    const measured = [...store.relations.values()].filter((r) => r.site === "chargematch" && r.type === "MEASURED_AT" && r.properties.lab === true);
    expect(measured.length).toBe(0);
    const coverage = coverageReport();
    expect(coverage.fixcode.brands).toBe(4);
    expect(coverage.chargematch.lab_measurements).toBe(0);
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

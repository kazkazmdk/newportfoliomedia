import { describe, expect, it } from "vitest";
import { evaluatePageQuality, searchDemandScore, seoRecommendation, classifyDemand, intentFamilyId, qualityDistribution, relationQuality } from "@penta/quality-gate";
import { assertInferenceCannotBecomeOfficial, isFresh, provenance } from "@penta/data-provenance";
import { applyAnswer, diagnose, getError, getSymptom, initialState, likelihoodLabel, BRANDS } from "@penta/fixcode";
import { allocate, compatibility, compatibilityEvidence, getCharger, getDevice } from "@penta/chargematch";
import { compareRoute, getRoute, sanitizeTravellers, timeValueBreakEven } from "@penta/tripcost";
import { capsuleFor, DESTINATIONS, isForecastCurrent, weatherSourceLabel } from "@penta/wearthere";
import { checkFitment, getVehicle, kmUntilNextFromLast, kmUntilNextInterval, nextService, ownershipCoverage, ownershipScore, scheduledIntervalCopy, VEHICLES } from "@penta/autospec";
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
      distinct_reason: "samsung-washer-4c",
      verified_fact_count: 10,
      decision_relation_count: 8,
    });
    expect(ok.score).toBeGreaterThanOrEqual(80);
    expect(ok.index_state).toBe("INDEXABLE");
    expect(ok.why.toLowerCase()).not.toContain("score 82");

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
      verified_fact_count: 12,
      decision_relation_count: 8,
    });
    expect(fail.score).toBeGreaterThanOrEqual(75);
    expect(fail.index_state).not.toBe("INDEXABLE");
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
    expect(air.evidence).not.toBe("MEASURED");
    expect(compatibilityEvidence("PROTOCOL_INFERRED")).toBe("INFERRED");
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
    const expired = compareRoute(route, 4, false, new Date("2026-11-01T00:00:00.000Z"));
    expect(expired.modes.find((m) => m.mode === "train")!.stale).toBe(true);
  });

  it("sanitizes travellers query values to 1–6", () => {
    expect(sanitizeTravellers(undefined)).toBe(2);
    expect(sanitizeTravellers("")).toBe(2);
    expect(sanitizeTravellers("abc")).toBe(2);
    expect(sanitizeTravellers("0")).toBe(1);
    expect(sanitizeTravellers(-3)).toBe(1);
    expect(sanitizeTravellers("9")).toBe(6);
    expect(sanitizeTravellers("3")).toBe(3);
  });
});

describe("WearThere", () => {
  it("never labels typical climate as a forecast", () => {
    expect(weatherSourceLabel({ hasForecast: false, daysAhead: 60 }).kind).toBe("TYPICAL");
    const tokyo = DESTINATIONS.find((d) => d.slug === "tokyo")!;
    const cap = capsuleFor(tokyo, 1, "classic");
    expect(cap.weather_kind).toBe("TYPICAL");
    expect(isForecastCurrent("2026-09-01T00:00:00.000Z", new Date("2026-09-13T00:00:00.000Z"), 6)).toBe(false);
    expect(cap.weather.month).toBe(1);
    expect(cap.pieces.length).toBeGreaterThan(4);
    expect(cap.coverage.weather_coverage).toBeGreaterThan(0);
    expect(cap.pieces.some((p) => p.layer === "shell" || p.warmth >= 4)).toBe(true);
  });

  it("does not treat editorial-only city-month pages as INDEXABLE", async () => {
    const { allWeartherePages } = await import("@penta/wearthere");
    const winter = allWeartherePages().find((p) => p.url === "/wearthere/tokyo/winter/what-to-wear");
    expect(winter).toBeTruthy();
    expect(winter?.index_state).not.toBe("INDEXABLE");
    expect(["SEO_CANDIDATE", "GRAPH_ONLY", "NOINDEX_PRODUCT", "REVIEW_REQUIRED"]).toContain(winter?.index_state);
    expect(allWeartherePages().find((p) => p.url === "/wearthere/tokyo/january/what-to-wear")).toBeUndefined();
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
    const possible = checkFitment(v, "cabin-filter-universal");
    expect(possible.compatible).toBe(false);
    expect("reason" in possible && possible.reason).toBe("Possible fitment — verify.");
    const market = checkFitment(v, "oil-ll01-us");
    expect(market.compatible).toBe(false);
    expect("reason" in market && String(market.reason).toLowerCase()).toMatch(/market/);
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
    const empty = ownershipCoverage({});
    expect(empty.completed).toBe(0);
    expect(empty.ready).toBe(false);
    const mileageOnly = ownershipCoverage({ km: 40000 });
    expect(mileageOnly.completed).toBe(1);
    expect(mileageOnly.ready).toBe(false);
  });

  it("returns 0 km left on exact service interval boundaries", () => {
    const v = getVehicle("bmw", "3-series", "g20", "320d-b47")!;
    const interval = 15000;
    expect(kmUntilNextInterval(0, interval)).toBe(15000);
    expect(kmUntilNextInterval(14999, interval)).toBe(1);
    expect(kmUntilNextInterval(15000, interval)).toBe(0);
    expect(kmUntilNextInterval(15001, interval)).toBe(14999);
    expect(kmUntilNextInterval(29999, interval)).toBe(1);
    expect(kmUntilNextInterval(30000, interval)).toBe(0);
    const atZero = nextService(v, 0);
    expect(atZero.find((s) => s.interval_km === 15000)?.km_left).toBe(15000);
    const at15000 = nextService(v, 15000);
    expect(at15000.find((s) => s.interval_km === 15000)?.km_left).toBe(0);
    const at30000 = nextService(v, 30000);
    expect(at30000.find((s) => s.interval_km === 15000)?.km_left).toBe(0);
    expect(at30000.find((s) => s.interval_km === 30000)?.km_left).toBe(0);
    expect(scheduledIntervalCopy(0)).toMatch(/due now/i);
    expect(kmUntilNextFromLast(52000, 45000, 15000)).toBe(8000);
  });

  it("does not complete tyre coverage without a condition", () => {
    expect(ownershipCoverage({ tyre_checked: false, tyre_ok: undefined }).checks.find((c) => c.id === "tyres")?.done).toBe(false);
    expect(ownershipCoverage({ tyre_checked: true, tyre_ok: undefined }).checks.find((c) => c.id === "tyres")?.done).toBe(false);
    expect(ownershipCoverage({ tyre_checked: true, tyre_ok: true }).checks.find((c) => c.id === "tyres")?.done).toBe(true);
    expect(ownershipCoverage({ tyre_checked: true, tyre_ok: false }).checks.find((c) => c.id === "tyres")?.done).toBe(true);
  });

  it("excludes unknown recalls from ownership score", () => {
    const known = {
      km: 40000,
      last_oil_km: 35000,
      tyre_ok: true,
      brake_pct: 80,
      battery: "GOOD" as const,
    };
    const unknown = ownershipScore({ ...known, open_recalls: null });
    const omitted = ownershipScore(known);
    expect(unknown.recall_included).toBe(false);
    expect(omitted.recall_included).toBe(false);
    expect(unknown.score).toBe(omitted.score);
    expect(unknown.factors.join(" ")).toMatch(/recall status not included/i);
    expect(unknown.factors.join(" ")).not.toMatch(/no open recall/i);
    const verifiedZero = ownershipScore({ ...known, open_recalls: 0 });
    expect(verifiedZero.recall_included).toBe(true);
    expect(verifiedZero.score).toBe(unknown.score);
    expect(verifiedZero.factors.join(" ")).toMatch(/no open recall found in verified check/i);
  });
});

describe("catalog / SEO tests", () => {
  it("keeps indexable pages above threshold with unique titles", () => {
    const issues = programmaticSeoIssues();
    expect(issues).toEqual([]);
    const report = launchReport();
    expect(report.graph.indexable).toBeGreaterThanOrEqual(0);
    expect(report.graph.indexable).toBeLessThan(1200);
    expect(report.graph.seo_candidate ?? 0).toBeGreaterThanOrEqual(0);
    if (report.graph.indexable > 0) {
      expect(report.average_indexable_quality).toBeGreaterThanOrEqual(70);
    }
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
    const hasError = [...store.relations.values()].filter((r) => r.site === "fixcode" && r.type === "HAS_ERROR");
    expect(hasError.length).toBeGreaterThan(0);
    const safety = [...store.relations.values()].filter((r) => r.site === "fixcode" && r.type === "SAFETY_CLASS");
    expect(safety.length).toBeGreaterThan(0);
    const distance = [...store.relations.values()].filter((r) => r.site === "tripcost" && r.type === "HAS_DISTANCE");
    expect(distance.length).toBeGreaterThan(0);
    const climate = store.byType("wearthere", "historical_climate")[0];
    expect(climate.properties.kind).toBe("CLIMATE_NORMAL");
    expect(climate.properties.period).toBe("1991-2020");
    const measuredEvidence = [...store.relations.values()].filter(
      (r) => r.site === "chargematch" && (r.properties.evidence === "MEASURED" || r.properties.measured === true),
    );
    expect(measuredEvidence.length).toBe(0);
  });
});

describe("quality gate extras", () => {
  it("does not index a page because of word count or unique title", () => {
    const thin = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      unique_fields: 2,
      required_fields_present: 2,
      required_fields_total: 9,
      search_demand: { seed_research: 99 },
      product_cta: false,
      interactive: false,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: false,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 1,
      freshness_ttl_days: 365,
      provenance_valid: true,
      word_count: 900,
      title_unique: true,
      internal_link_count: 40,
      verified_fact_count: 1,
      decision_relation_count: 0,
    });
    expect(thin.index_state).not.toBe("INDEXABLE");
  });

  it("groups oil keyword variants into one intent family", () => {
    const a = intentFamilyId({
      site: "autospec",
      family: "oil-type",
      title: "BMW 320d oil",
      structured_payload: { vehicle: "veh:bmw:3-series:g20:320d-b47" },
    });
    const b = intentFamilyId({
      site: "autospec",
      family: "oil-capacity",
      title: "BMW 320d engine oil",
      structured_payload: { vehicle: "veh:bmw:3-series:g20:320d-b47" },
    });
    const c = intentFamilyId({
      site: "autospec",
      family: "oil-type",
      title: "best oil BMW 320d",
      structured_payload: { vehicle: "veh:bmw:3-series:g20:320d-b47" },
    });
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("spreads quality scores and scores relations", () => {
    const dist = qualityDistribution([
      { quality_score: 42, index_state: "GRAPH_ONLY" },
      { quality_score: 81, index_state: "INDEXABLE" },
      { quality_score: 76, index_state: "INDEXABLE" },
    ]);
    expect(dist.find((row) => row.bucket === "0-49")?.count).toBe(1);
    expect(dist.find((row) => row.bucket === "80-84")?.indexable).toBe(1);
    const relQ = relationQuality({
      id: "x",
      site: "fixcode",
      type: "MAY_BE_CAUSED_BY",
      from_id: "a",
      to_id: "b",
      properties: { prior: 0.4, kind: "document" },
      provenance: [
        provenance({
          source_id: "fixcode-support-corpus",
          source_type: "MANUFACTURER",
          retrieved_at: "2026-08-01T00:00:00.000Z",
          confidence: 80,
          raw_value: "x",
          normalized_value: "x",
          verification_method: "MANUFACTURER_DOC",
        }),
      ],
      confidence: "HIGH",
      index_eligible: false,
      decision_relevant: true,
      inferred: false,
    });
    expect(relQ).toBeGreaterThan(50);
  });

  it("keeps AI_INFERRED from becoming official and marks expired facts", () => {
    expect(() => assertInferenceCannotBecomeOfficial("AI_INFERRED", "OFFICIAL")).toThrow();
    const expired = provenance({
      source_id: "seed-transport-snapshot",
      source_type: "THIRD_PARTY",
      retrieved_at: "2026-08-01T00:00:00.000Z",
      valid_until: "2026-09-01T00:00:00.000Z",
      confidence: 40,
      raw_value: "fare",
      normalized_value: "fare",
      verification_method: "HEURISTIC",
    });
    expect(isFresh(expired, new Date("2026-09-13T00:00:00.000Z"))).toBe(false);
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

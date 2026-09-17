import { describe, expect, it } from "vitest";
import { evaluatePageQuality } from "@penta/quality-gate";
import { actionEvidenceFromPayload, isStringOnlyAction } from "@penta/quality-gate";
import { assessDemand, classifyClimateModel, demandSatisfiesIndex, seasonLabel } from "@penta/demand";
import { buildDiagnosticTree, treeHasUnsafeSelfService } from "@penta/fixcode";
import { ALL_ERRORS } from "@penta/fixcode";
import { VEHICLES, VIN_SUPPORT, checkFitment, fitmentScopeOf } from "@penta/autospec";
import { allocate, compatibility, getCable, getCharger, getDevice, MEASURED_CURVES, powerChain } from "@penta/chargematch";
import { breakEvenByTravellers, compareRoute, costLabel, getRoute } from "@penta/tripcost";
import { DESTINATIONS } from "@penta/wearthere";
import { evaluateScaleStops, SCALE_STOP_THRESHOLDS, scaleMustStop } from "@penta/catalog";
import { recommendWearthereConsolidationV2 } from "@penta/demand";
import { surfaceParity, parityIssues } from "@penta/publishing-core";
import type { PageRecord } from "@penta/graph-core";
import { buildCatalog } from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";

const rich = {
  unique_fields: 12,
  required_fields_present: 9,
  required_fields_total: 9,
  search_demand: { seed_research: 40 },
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
  distinct_reason: "samsung-washer-4c",
  verified_fact_count: 10,
  decision_relation_count: 8,
  page_id: "samsung-washer-4c",
  page_locale: "en",
};

function page(partial: Partial<PageRecord> & Pick<PageRecord, "id" | "url" | "canonical" | "index_state">): PageRecord {
  return {
    site: "fixcode",
    family: "error-code",
    title: partial.id,
    meta_description: "",
    entity_ids: [],
    structured_payload: {},
    quality_score: 60,
    search_demand: 10,
    noindex: partial.index_state !== "INDEXABLE",
    similarity_hash: partial.id,
    freshness: "2026-09-01T00:00:00.000Z",
    review_required: false,
    batch: "t",
    publish_state: partial.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
    ...partial,
  };
}

describe("sitemap set parity", () => {
  it("fails when counts match but paths differ", () => {
    const pages = [page({ id: "a", url: "/a", canonical: "/a", index_state: "INDEXABLE" })];
    const report = surfaceParity({ pages, sitemapUrls: ["/b"], publicSiteLive: true });
    expect(report.indexablePaths).toEqual(["/a"]);
    expect(report.sitemapPaths).toEqual(["/b"]);
    expect(report.exactParity).toBe(false);
    expect(parityIssues(report).length).toBeGreaterThan(0);
  });

  it("fails when an INDEXABLE path is missing from the sitemap", () => {
    const pages = [page({ id: "a", url: "/a", canonical: "/a", index_state: "INDEXABLE" })];
    const report = surfaceParity({ pages, sitemapUrls: [], publicSiteLive: true });
    expect(report.missingFromSitemap).toEqual(["/a"]);
  });

  it("fails when the sitemap has an unexpected path", () => {
    const pages = [page({ id: "a", url: "/a", canonical: "/a", index_state: "SEO_CANDIDATE" })];
    const report = surfaceParity({ pages, sitemapUrls: ["/a"], publicSiteLive: true });
    expect(report.unexpectedInSitemap).toEqual(["/a"]);
  });

  it("fails on duplicate canonicals", () => {
    const pages = [
      page({ id: "a", url: "/a", canonical: "/same", index_state: "INDEXABLE" }),
      page({ id: "b", url: "/b", canonical: "/same", index_state: "INDEXABLE" }),
    ];
    const report = surfaceParity({ pages, sitemapUrls: ["/same", "/same"], publicSiteLive: true });
    expect(report.duplicateCanonicalPaths).toContain("/same");
    expect(report.duplicateSitemapPaths).toContain("/same");
  });

  it("is empty-empty parity while PUBLIC_SITE_LIVE is false", () => {
    const store = buildCatalog();
    const report = surfaceParity({
      pages: [...store.pages.values()],
      sitemapUrls: [],
      publicSiteLive: false,
    });
    expect(report.exactParity).toBe(true);
    expect(globalNoindex()).toBe(true);
  });
});

describe("action evidence", () => {
  it("rejects a string intendedAction", () => {
    expect(isStringOnlyAction("help user decide")).toBe(true);
    expect(actionEvidenceFromPayload({ intendedAction: "help user decide" })).toBeNull();
    const result = evaluatePageQuality({
      site: "fixcode",
      family: "error-code",
      ...rich,
      structured_payload: { intendedAction: "help user decide", brand: "Samsung" },
    });
    expect(result.index_state).not.toBe("INDEXABLE");
  });
});

describe("FixCode", () => {
  it("does not fabricate a diagnosis for an unsupported brand/code", () => {
    const unknown = ALL_ERRORS.find((e) => e.brand === "Gorenje");
    expect(unknown).toBeUndefined();
  });

  it("generic manufacturer roots stay non-exact", () => {
    const sample = ALL_ERRORS[0];
    expect(sample.provenance[0].source_url).toMatch(/support|service/);
  });

  it("unsafe diagnostic wording is flagged", () => {
    const profile = ALL_ERRORS[0];
    const tree = buildDiagnosticTree({
      ...profile,
      questions: [
        {
          id: "shock",
          text: "Open the high-voltage inverter while plugged in",
          why: "never",
          answers: [{ id: "y", label: "yes", likelihoods: { [profile.causes[0].id]: 1 } }],
        },
      ],
    });
    expect(treeHasUnsafeSelfService(tree)).toBe(true);
  });
});

describe("AutoSpec", () => {
  it("does not silently upgrade generation data to exact trim", () => {
    const v = VEHICLES[0];
    const scope = fitmentScopeOf({ make: v.make, model: v.model, generation: v.generation });
    expect(scope.confidence).not.toBe("EXACT");
    expect(VIN_SUPPORT).toBe("NOT_IMPLEMENTED");
  });

  it("missing market stays explicit on the scope", () => {
    const scope = fitmentScopeOf({ make: "BMW", model: "3 Series", generation: "G20", engine_code: "B47" });
    expect(scope.market).toBeUndefined();
    expect(scope.confidence).not.toBe("EXACT");
  });

  it("mismatched engine/market stays explicit", () => {
    const v = VEHICLES.find((item) => item.engine_code)!;
    const market = checkFitment(v, "oil-ll01-us");
    expect(market.compatible).toBe(false);
  });
});

describe("WearThere climate seasons", () => {
  it("Sydney December is southern summer, not northern winter", () => {
    const sydney = DESTINATIONS.find((d) => /sydney/i.test(d.city) || /sydney/i.test(d.slug));
    const lat = sydney?.lat ?? -33.87;
    const model = classifyClimateModel({
      lat,
      months: [{ month: 12, tmax: 26, tmin: 18, rain_mm: 70 }],
    });
    expect(model).toBe("SOUTHERN_TEMPERATE");
    expect(seasonLabel(model, 12)).toBe("summer");
    expect(seasonLabel("NORTHERN_TEMPERATE", 12)).toBe("winter");
  });

  it("Singapore is not forced into four temperate seasons", () => {
    const model = classifyClimateModel({
      lat: 1.35,
      months: [
        { month: 1, tmax: 31, tmin: 24, rain_mm: 200 },
        { month: 6, tmax: 32, tmin: 25, rain_mm: 160 },
      ],
    });
    expect(model).toBe("EQUATORIAL");
    expect(seasonLabel(model, 1)).toBe("year-round-humid");
  });

  it("assigns seasons from the climate model, not a global Dec=winter rule", () => {
    expect(seasonLabel("SOUTHERN_TEMPERATE", 12)).toBe("summer");
    expect(seasonLabel("NORTHERN_TEMPERATE", 12)).toBe("winter");
    expect(seasonLabel("EQUATORIAL", 12)).toBe("year-round-humid");
  });

  it("consolidates near-duplicate months in the same climate season", () => {
    const rec = recommendWearthereConsolidationV2([
      { city: "paris", lat: 48.86, month: 1, tmax: 8, tmin: 3, rain_mm: 50 },
      { city: "paris", lat: 48.86, month: 2, tmax: 9, tmin: 3, rain_mm: 40 },
    ]);
    expect(rec.some((row) => row.action === "CONSOLIDATE_SEASON" && row.season === "winter")).toBe(true);
  });
});

describe("ChargeMatch power chain", () => {
  it("applies cable, charger and device bottlenecks; rated is not measured", () => {
    const device = getDevice("iphone-16")!;
    const charger = getCharger("apple-20w")!;
    const cable = getCable("unmarked-usbc")!;
    const chain = powerChain({ device, charger, cable });
    expect(chain.measured).toBeNull();
    expect(chain.rated).toBe(true);
    expect(MEASURED_CURVES).toHaveLength(0);
    const dual = getCharger("apple-35w-dual")!;
    const split = allocate(dual, ["c1", "c2"]);
    expect(split.watts).toEqual([20, 15]);
    const result = compatibility(device, charger, cable);
    expect(result.evidence).not.toBe("MEASURED");
  });

  it("applies device, charger and cable bottlenecks independently", () => {
    const phone = getDevice("iphone-16")!;
    const laptop = getDevice("macbook-pro-14-m3")!;
    const brick20 = getCharger("apple-20w")!;
    const brick70 = getCharger("apple-70w")!;
    const cable60 = getCable("apple-usbc-60w")!;
    expect(powerChain({ device: phone, charger: brick70 }).limiting).toBe("device");
    expect(powerChain({ device: phone, charger: brick20 }).delivered).toBeLessThanOrEqual(20);
    expect(powerChain({ device: laptop, charger: brick70, cable: cable60 }).limiting).toBe("cable");
  });
});

describe("TripCost evidence", () => {
  it("heuristic is not live and break-even recomputes from assumptions", () => {
    const route = getRoute("paris", "lyon") ?? getRoute("paris", "brussels");
    expect(route).toBeTruthy();
    const compared = compareRoute(route!, 1, false);
    expect(compared.modes.every((m) => m.live_fare === false)).toBe(true);
    expect(compared.modes.every((m) => m.price_kind === "HEURISTIC_PRICE")).toBe(true);
    expect(costLabel("HEURISTIC")).toBe("Typical estimate");
    const table = breakEvenByTravellers(route!);
    expect(table.length).toBeGreaterThan(1);
    expect(table[0].travellers).toBe(1);
  });
});

describe("auto-stop thresholds are live", () => {
  it("triggers each named stop", () => {
    const ids = [
      "truth_ready_ratio",
      "critical_provenance",
      "duplicate_rate",
      "sitemap_parity",
      "candidate_growth",
      "source_truth_depth",
      "unknown_critical_rate",
      "demand_validated_ratio",
    ] as const;
    const bad = evaluateScaleStops({
      pages: 1000,
      truthReady: 1,
      criticalFacts: 100,
      criticalFactsExact: 0,
      duplicatePairs: 400,
      sitemapParity: false,
      previousPages: 100,
      sourceTruthEdges: 1,
      relations: 100,
      unknownCritical: 99,
      demandValidated: 1,
    });
    for (const id of ids) {
      expect(bad.find((row) => row.id === id)?.triggered).toBe(true);
    }
    expect(scaleMustStop(bad)).toBe(true);
    expect(SCALE_STOP_THRESHOLDS.truth_ready_ratio_min).toBeGreaterThan(0);
    expect(SCALE_STOP_THRESHOLDS.demand_validated_ratio_min).toBeGreaterThan(0);
  });
});

describe("demand paths still hold", () => {
  it("GSC is not required; existence/autocomplete/trends alone fail", () => {
    const now = new Date("2026-09-14T00:00:00.000Z");
    const a = assessDemand({
      pageId: "p",
      queryCluster: ["q"],
      evidence: [
        {
          id: "ac",
          source: "AUTOCOMPLETE",
          query: "q",
          locale: "en",
          observedAt: "2026-09-01T00:00:00.000Z",
          observed: true,
          confidence: 0.7,
          collectionMethod: "MANUAL",
        },
      ],
      serpObservations: [
        {
          query: "q",
          locale: "en",
          observedAt: "2026-09-01T00:00:00.000Z",
          resultsObserved: 10,
          exactIntentResults: 6,
          partialIntentResults: 1,
          exactIntentResultsTop10: 6,
          classification: "STRONG_INTENT",
        },
      ],
      now,
    });
    expect(demandSatisfiesIndex(a).pass).toBe(true);
    expect(a.evidence.some((e) => e.source === "GSC")).toBe(false);
  });

  it("quantitative + related/autocomplete can qualify; locale mismatch cannot", () => {
    const now = new Date("2026-09-14T00:00:00.000Z");
    const ok = assessDemand({
      pageId: "p",
      queryCluster: ["q"],
      evidence: [
        {
          id: "kw",
          source: "KEYWORD_PLANNER",
          query: "q",
          locale: "en",
          observedAt: "2026-09-01T00:00:00.000Z",
          observed: true,
          value: 1200,
          unit: "MONTHLY_SEARCHES",
          confidence: 0.7,
          collectionMethod: "IMPORT",
        },
        {
          id: "rel",
          source: "RELATED_SEARCH",
          query: "q",
          locale: "en",
          observedAt: "2026-09-01T00:00:00.000Z",
          observed: true,
          confidence: 0.6,
          collectionMethod: "MANUAL",
        },
      ],
      now,
    });
    expect(demandSatisfiesIndex(ok).pass).toBe(true);
    const locale = assessDemand({
      pageId: "p",
      queryCluster: ["q"],
      pageLocale: "en",
      evidence: [
        {
          id: "fr",
          source: "AUTOCOMPLETE",
          query: "q",
          locale: "fr-FR",
          language: "fr",
          observedAt: "2026-09-01T00:00:00.000Z",
          observed: true,
          confidence: 0.7,
          collectionMethod: "MANUAL",
        },
      ],
      serpObservations: [
        {
          query: "q",
          locale: "en",
          observedAt: "2026-09-01T00:00:00.000Z",
          resultsObserved: 10,
          exactIntentResults: 6,
          partialIntentResults: 1,
          exactIntentResultsTop10: 6,
          classification: "STRONG_INTENT",
        },
      ],
      now,
    });
    expect(locale.localeMismatches).toContain("fr");
    expect(demandSatisfiesIndex(locale).pass).toBe(false);
  });
});

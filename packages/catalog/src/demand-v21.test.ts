import { describe, expect, it } from "vitest";
import { evaluatePageQuality, type PageQualityInput } from "@penta/quality-gate";
import { assessDemand, demandSatisfiesIndex, type DemandEvidence, type SerpObservation } from "@penta/demand";
import { buildCatalog } from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";

const rich: PageQualityInput = {
  site: "fixcode",
  family: "error-code",
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
  confidence: "HIGH",
  freshness_days: 10,
  freshness_ttl_days: 365,
  provenance_valid: true,
  distinct_reason: "samsung-washer-4c",
  verified_fact_count: 10,
  decision_relation_count: 8,
  page_id: "samsung-washer-4c",
  page_locale: "en",
};

function ev(partial: Partial<DemandEvidence> & Pick<DemandEvidence, "source" | "query">): DemandEvidence {
  return {
    id: partial.id ?? `${partial.source}:${partial.query}`,
    locale: "en",
    observedAt: "2026-09-01T00:00:00.000Z",
    observed: true,
    value: null,
    confidence: 0.7,
    collectionMethod: "MANUAL",
    pageId: "samsung-washer-4c",
    ...partial,
  };
}

const strongSerp: SerpObservation = {
  query: "samsung 4c error",
  locale: "en",
  observedAt: "2026-09-01T00:00:00.000Z",
  resultsObserved: 10,
  exactIntentResults: 6,
  partialIntentResults: 2,
  exactIntentResultsTop10: 6,
  classification: "STRONG_INTENT",
  composition: { official: 3, editorial: 4, forums: 2, ecommerce: 1 },
  pageId: "samsung-washer-4c",
};

const prelaunchEvidence: DemandEvidence[] = [ev({ source: "AUTOCOMPLETE", query: "samsung washer 4c" })];

describe("Truth × demand V2.1", () => {
  it("editorial-only cannot index", () => {
    const result = evaluatePageQuality(rich);
    expect(result.index_state).toBe("SEO_CANDIDATE");
    expect(result.seo_validation).toBe("NONE");
  });

  it("high demand cannot override a failed truth gate", () => {
    const result = evaluatePageQuality({
      ...rich,
      invented_data: true,
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(result.index_state).not.toBe("INDEXABLE");
    expect(demandSatisfiesIndex(result.demand_assessment!).pass).toBe(true);
  });

  it("high truth + no demand = SEO_CANDIDATE", () => {
    const result = evaluatePageQuality(rich);
    expect(result.index_state).toBe("SEO_CANDIDATE");
    expect(result.seo_validation).toBe("NONE");
  });

  it("high truth + prelaunch demand = INDEXABLE/PRELAUNCH without GSC", () => {
    const result = evaluatePageQuality({
      ...rich,
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(result.index_state).toBe("INDEXABLE");
    expect(result.seo_validation).toBe("PRELAUNCH");
    expect(result.demand_assessment?.evidence.some((row) => row.source === "GSC")).toBe(false);
  });

  it("zero GSC before launch does not block a valid prelaunch candidate", () => {
    const result = evaluatePageQuality({
      ...rich,
      search_demand: { seed_research: 10 },
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(result.index_state).toBe("INDEXABLE");
    expect(result.seo_validation).toBe("PRELAUNCH");
  });

  it("postlaunch GSC can upgrade validation", () => {
    const pre = evaluatePageQuality({
      ...rich,
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(pre.seo_validation).toBe("PRELAUNCH");
    const post = evaluatePageQuality({
      ...rich,
      demand_evidence_v2: [
        ...prelaunchEvidence,
        ev({
          source: "GSC",
          query: "samsung 4c error",
          value: 80,
          unit: "IMPRESSIONS",
          collectionMethod: "API",
          observedAt: "2026-09-12T00:00:00.000Z",
        }),
      ],
      serp_observations: [strongSerp],
    });
    expect(post.index_state).toBe("INDEXABLE");
    expect(post.seo_validation).toBe("POSTLAUNCH");
  });

  it("losing demand validation does not corrupt the truth state", () => {
    const withDemand = evaluatePageQuality({
      ...rich,
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(withDemand.index_state).toBe("INDEXABLE");
    const without = evaluatePageQuality(rich);
    expect(without.index_state).toBe("SEO_CANDIDATE");
    expect(without.blockers.filter((b) => b.startsWith("HARD:")).length).toBe(
      withDemand.blockers.filter((b) => b.startsWith("HARD:")).length,
    );
    expect(without.gate_evidence?.find((g) => g.gate === "required_fields_present")?.status).toBe(true);
  });

  it("TripCost heuristic fares stay SEO_CANDIDATE even with strong demand", () => {
    const result = evaluatePageQuality({
      ...rich,
      site: "tripcost",
      family: "route-car-vs-train",
      structured_payload: {
        route: "paris-lyon",
        modes: ["car", "train"],
        from: "paris",
        to: "lyon",
        price_kind: "HEURISTIC_PRICE",
        live_fare: false,
        distinct_reason: "paris-lyon-corridor",
      },
      demand_evidence_v2: prelaunchEvidence,
      serp_observations: [strongSerp],
    });
    expect(result.index_state).toBe("SEO_CANDIDATE");
    expect(result.seo_validation).toBe("NONE");
  });

  it("AutoSpec more-specific SERP than known scope is REVIEW_REQUIRED", () => {
    const result = evaluatePageQuality({
      ...rich,
      site: "autospec",
      family: "oil-capacity",
      structured_payload: { vehicle: "bmw 3 series", capacity_l: 5, engine: "B47" },
      query_cluster: ["bmw 320d 2019 g20 oil capacity"],
      demand_evidence_v2: [
        ev({ source: "AUTOCOMPLETE", query: "bmw 320d 2019 g20 oil capacity" }),
      ],
      serp_observations: [{ ...strongSerp, query: "bmw 320d 2019 g20 oil capacity" }],
    });
    expect(result.index_state).toBe("REVIEW_REQUIRED");
  });
});

describe("catalog cold start honesty", () => {
  it("does not invent demand and keeps the public sitemap empty", () => {
    const store = buildCatalog();
    const indexable = [...store.pages.values()].filter((page) => page.index_state === "INDEXABLE");
    expect(indexable).toHaveLength(0);
    expect([...store.pages.values()].every((page) => (page.seo_validation ?? "NONE") === "NONE")).toBe(true);
    expect(globalNoindex()).toBe(true);
    expect(process.env.PUBLIC_SITE_LIVE === "true").toBe(false);
  });
});

describe("assessment helper", () => {
  it("does not treat Path D GSC=0 as post-launch validation", () => {
    const a = assessDemand({
      pageId: "x",
      queryCluster: ["q"],
      evidence: [
        ev({ source: "GSC", query: "q", value: 0, unit: "IMPRESSIONS", observed: false }),
      ],
    });
    expect(demandSatisfiesIndex(a).pass).toBe(false);
  });
});

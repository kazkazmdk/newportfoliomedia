import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assessDemand,
  buildPrelaunchBatch,
  coldStartEligible,
  demandSatisfiesIndex,
  gscRowsToEvidence,
  queryClusterFor,
  reassessDemandAfterLaunch,
  recommendWearthereConsolidation,
  validateEvidence,
} from "./index";
import { importDemandDir } from "./import";
import type { DemandEvidence, SerpObservation } from "./types";

const NOW = new Date("2026-09-14T00:00:00.000Z");

function ev(partial: Partial<DemandEvidence> & Pick<DemandEvidence, "source" | "query">): DemandEvidence {
  return {
    id: partial.id ?? `${partial.source}:${partial.query}`,
    locale: "en",
    observedAt: "2026-09-01T00:00:00.000Z",
    observed: true,
    value: null,
    unit: null,
    confidence: 0.7,
    collectionMethod: "MANUAL",
    pageId: "page-1",
    ...partial,
  };
}

function strongSerp(query = "samsung 4c error"): SerpObservation {
  return {
    query,
    locale: "en",
    observedAt: "2026-09-01T00:00:00.000Z",
    resultsObserved: 10,
    exactIntentResults: 7,
    partialIntentResults: 2,
    exactIntentResultsTop10: 7,
    domains: ["samsung.com", "repairclinic.com"],
    classification: "STRONG_INTENT",
    composition: { official: 2, editorial: 5, forums: 2, ecommerce: 1 },
    pageId: "page-1",
  };
}

describe("DemandEvidence V2", () => {
  it("keeps unknown volume as null and refuses invented volumes on import", () => {
    const row = validateEvidence(
      ev({ source: "KEYWORD_PROVIDER", query: "samsung 4c error", value: null }),
    );
    expect(row.value).toBeNull();
    expect(() =>
      validateEvidence(ev({ source: "KEYWORD_PROVIDER", query: "x", value: -12 })),
    ).toThrow(/non-negative/);
  });

  it("preserves manual source, date and locale", () => {
    const row = validateEvidence(
      ev({
        source: "AUTOCOMPLETE",
        query: "samsung washer 4c",
        rawLabel: "samsung washer 4c error",
        collectionMethod: "MANUAL",
        locale: "en-US",
        country: "US",
      }),
    );
    expect(row.collectionMethod).toBe("MANUAL");
    expect(row.source).toBe("AUTOCOMPLETE");
    expect(row.rawLabel).toBe("samsung washer 4c error");
    expect(row.locale).toBe("en-US");
  });

  it("rejects unknown sources and invalid dates", () => {
    expect(() => validateEvidence(ev({ source: "MADE_UP" as DemandEvidence["source"], query: "x" }))).toThrow(
      /unknown source/,
    );
    expect(() => validateEvidence(ev({ source: "SERP", query: "x", observedAt: "yesterday" }))).toThrow(/invalid observedAt/);
  });
});

describe("pre-launch demand paths", () => {
  it("editorial-only cannot satisfy index demand", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [ev({ source: "EDITORIAL", query: "samsung 4c error" })],
      now: NOW,
    });
    expect(demandSatisfiesIndex(a).pass).toBe(false);
    expect(a.seoEligibility).toBe("NONE");
  });

  it("GSC is not required for a strong SERP + autocomplete path", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [ev({ source: "AUTOCOMPLETE", query: "samsung washer 4c", rawLabel: "samsung washer 4c" })],
      serpObservations: [strongSerp()],
      now: NOW,
    });
    expect(a.pathA).toBe(true);
    expect(a.evidence.some((row) => row.source === "GSC")).toBe(false);
    const decision = demandSatisfiesIndex(a);
    expect(decision.pass).toBe(true);
    expect(decision.seoValidation).toBe("PRELAUNCH");
  });

  it("SERP existence alone cannot index", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [ev({ source: "SERP", query: "samsung 4c error" })],
      serpObservations: [
        {
          ...strongSerp(),
          classification: "WEAK_INTENT",
          exactIntentResults: 0,
          exactIntentResultsTop10: 0,
        },
      ],
      now: NOW,
    });
    expect(a.serpObserved).toBe(true);
    expect(a.intentMatchObserved).toBe(false);
    expect(demandSatisfiesIndex(a).pass).toBe(false);
    expect(demandSatisfiesIndex(a).reason).toMatch(/SERP existence/);
  });

  it("autocomplete alone cannot index", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [ev({ source: "AUTOCOMPLETE", query: "samsung washer 4c" })],
      now: NOW,
    });
    expect(a.autocompleteObserved).toBe(true);
    expect(demandSatisfiesIndex(a).pass).toBe(false);
  });

  it("Trends alone cannot index and is never converted to monthly volume", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [ev({ source: "GOOGLE_TRENDS", query: "samsung 4c error", value: 37, unit: "RELATIVE_INDEX" })],
      now: NOW,
    });
    expect(a.trendsObserved).toBe(true);
    expect(a.quantitativeVolumeObserved).toBe(false);
    expect(demandSatisfiesIndex(a).pass).toBe(false);
  });

  it("keyword volume + autocomplete is Path C", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [
        ev({ source: "KEYWORD_PLANNER", query: "samsung 4c error", value: 2400, unit: "MONTHLY_SEARCHES" }),
        ev({ source: "AUTOCOMPLETE", query: "samsung washer 4c" }),
      ],
      now: NOW,
    });
    expect(a.pathC).toBe(true);
    expect(demandSatisfiesIndex(a).pass).toBe(true);
  });

  it("expired evidence does not count and locale mismatch is detected", () => {
    const a = assessDemand({
      pageId: "page-1",
      queryCluster: ["samsung 4c error"],
      evidence: [
        ev({
          id: "old-serp",
          source: "AUTOCOMPLETE",
          query: "samsung 4c error",
          observedAt: "2024-01-01T00:00:00.000Z",
        }),
        ev({
          id: "fr-row",
          source: "AUTOCOMPLETE",
          query: "erreur samsung 4c",
          locale: "fr-FR",
          language: "fr",
        }),
      ],
      serpObservations: [strongSerp()],
      pageLocale: "en",
      now: NOW,
    });
    expect(a.expiredEvidenceIds).toContain("old-serp");
    expect(a.localeMismatches).toContain("fr-row");
    expect(a.pathA).toBe(false);
  });
});

describe("GSC post-launch", () => {
  it("maps GSC rows and does not treat a 3-day-old page as WEAK", () => {
    const rows = gscRowsToEvidence(
      [
        {
          query: "samsung 4c error",
          page: "/fixcode/samsung/washer/4c",
          impressions: 12,
          clicks: 1,
          ctr: 0.08,
          position: 8,
          observedAt: "2026-09-14T00:00:00.000Z",
        },
      ],
      "page-1",
    );
    expect(rows[0].source).toBe("GSC");
    expect(rows[0].unit).toBe("IMPRESSIONS");
    expect(
      reassessDemandAfterLaunch({
        launchedAt: "2026-09-11T00:00:00.000Z",
        now: NOW,
        impressions: 4,
        clicks: 0,
      }),
    ).toBe("DISCOVERY");
  });

  it("zero GSC does not block a valid prelaunch candidate", () => {
    const eligible = coldStartEligible({
      truthReady: true,
      productUseful: true,
      demandPass: true,
      gscObserved: false,
    });
    expect(eligible).toBe(true);
    const batch = buildPrelaunchBatch([
      {
        id: "page-1",
        site: "fixcode",
        url: "/fixcode/samsung/washer/4c",
        index_state: "INDEXABLE",
        seo_validation: "PRELAUNCH",
        demand_assessment: assessDemand({
          pageId: "page-1",
          queryCluster: ["samsung 4c error"],
          evidence: [ev({ source: "AUTOCOMPLETE", query: "samsung washer 4c" })],
          serpObservations: [strongSerp()],
          now: NOW,
        }),
      },
    ]);
    expect(batch.publicSiteLive).toBe(false);
    expect(batch.pages).toHaveLength(1);
  });
});

describe("family query clusters", () => {
  it("builds 3–7 strong queries and does not invent 50 variants", () => {
    const fix = queryClusterFor({
      site: "fixcode",
      family: "error-code",
      title: "Samsung 4C",
      structured_payload: { brand: "Samsung", appliance: "Washer", code: "4C" },
    });
    expect(fix.length).toBeGreaterThanOrEqual(3);
    expect(fix.length).toBeLessThanOrEqual(7);
    expect(fix.some((q) => q.includes("samsung") && q.includes("4c"))).toBe(true);
    const wear = queryClusterFor({
      site: "wearthere",
      family: "wear-month",
      title: "Paris October",
      structured_payload: { city: "Paris", month: 10 },
    });
    expect(wear[0]).toContain("what to wear in paris in october");
  });

  it("recommends seasonal consolidation when months are near-identical", () => {
    const rec = recommendWearthereConsolidation([
      { city: "paris", month: 1, tmax: 8, tmin: 3 },
      { city: "paris", month: 2, tmax: 9, tmin: 3 },
      { city: "paris", month: 3, tmax: 9.5, tmin: 4 },
    ]);
    expect(rec.some((row) => row.action === "CONSOLIDATE_SEASON")).toBe(true);
  });
});

describe("CSV/JSON import", () => {
  it("imports valid rows and rejects malformed files without inventing volumes", () => {
    const dir = mkdtempSync(join(tmpdir(), "demand-"));
    writeFileSync(
      join(dir, "ok.csv"),
      [
        "page_id,query,country,source,observed,value,observed_at,notes",
        "page-1,samsung 4c error,US,AUTOCOMPLETE,true,,2026-09-01,manual check",
      ].join("\n"),
    );
    writeFileSync(
      join(dir, "bad.csv"),
      ["page_id,query,country,source,observed,value,observed_at", "page-1,q,US,NOT_A_SOURCE,true,10,2026-09-01"].join("\n"),
    );
    const result = importDemandDir(dir);
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].value).toBeNull();
    expect(result.evidence[0].source).toBe("AUTOCOMPLETE");
    expect(result.rejected.length).toBeGreaterThan(0);
  });
});

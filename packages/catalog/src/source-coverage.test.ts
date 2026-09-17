import { describe, expect, it } from "vitest";
import type { PageRecord } from "@penta/graph-core";
import {
  coverageFromFacts,
  sourceCoverageOf,
  type DecisionFact,
} from "./source-coverage";

function page(partial: Partial<PageRecord> = {}): PageRecord {
  return {
    id: "p1",
    site: "fixcode",
    family: "error-code",
    url: "/fixcode/x",
    canonical: "/fixcode/x",
    title: "x",
    meta_description: "x",
    entity_ids: ["a", "b", "c", "d"],
    structured_payload: {},
    quality_score: 81,
    search_demand: 32,
    index_state: "SEO_CANDIDATE",
    noindex: true,
    similarity_hash: "x",
    freshness: "2026-01-01T00:00:00.000Z",
    review_required: false,
    batch: "t",
    publish_state: "READY",
    ...partial,
  };
}

describe("real source coverage", () => {
  it("never derives 0.90 from a quality score of 81 and four entities", () => {
    const coverage = sourceCoverageOf(page());
    expect(coverage).toBe(0);
    expect(coverage).not.toBeCloseTo(0.9);
  });

  it("is weighted decision facts with qualifying evidence over weighted facts", () => {
    const facts: DecisionFact[] = [
      { key: "meaning", role: "critical", evidenceLevel: "PRIMARY_GENERAL" },
      { key: "causes", role: "critical", evidenceLevel: "PRIMARY_EXACT" },
      { key: "models", role: "supporting", evidenceLevel: "PRIMARY_GENERAL" },
      { key: "title_color", role: "descriptive", evidenceLevel: "NONE" },
    ];
    const report = coverageFromFacts(facts);
    expect(report.weightedFacts).toBe(3 + 3 + 2 + 0.5);
    expect(report.weightedSourced).toBe(3 + 3 + 2);
    expect(report.sourceCoverage).toBeCloseTo(8 / 8.5, 3);
    expect(report.sourcedDecisionFacts).toBe(3);
  });

  it("does not treat UNKNOWN or AI_INFERRED as qualifying evidence", () => {
    const report = coverageFromFacts([
      { key: "meaning", role: "critical", evidenceLevel: "UNKNOWN" },
      { key: "causes", role: "critical", evidenceLevel: "AI_INFERRED" },
    ]);
    expect(report.sourceCoverage).toBe(0);
    expect(report.sourcedDecisionFacts).toBe(0);
  });

  it("lets labelled MODELLED heuristic evidence qualify, not silent estimates", () => {
    const silent = coverageFromFacts([
      { key: "fuel", role: "critical", evidenceLevel: "DERIVED_HEURISTIC", modelled: true, assumptionsDeclared: false },
    ]);
    const honest = coverageFromFacts([
      { key: "fuel", role: "critical", evidenceLevel: "DERIVED_HEURISTIC", modelled: true, assumptionsDeclared: true },
    ]);
    expect(silent.sourceCoverage).toBe(0);
    expect(honest.sourceCoverage).toBe(1);
  });

  it("reads stored decision_facts and ignores quality_score", () => {
    const result = sourceCoverageOf(
      page({
        quality_score: 99,
        structured_payload: {
          decision_facts: [
            { key: "meaning", role: "critical", evidenceLevel: "PRIMARY_GENERAL" },
            { key: "note", role: "descriptive", evidenceLevel: "NONE" },
          ],
        },
      }),
    );
    expect(result).toBeCloseTo(3 / 3.5, 3);
  });
});

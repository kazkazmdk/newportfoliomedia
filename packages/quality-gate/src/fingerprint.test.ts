import { describe, expect, it } from "vitest";
import {
  climateFingerprint,
  decisionFingerprint,
  evaluatePageQuality,
  fingerprintFromPage,
  rainBand,
  scaleQualityBand,
  tempBand,
} from "@penta/quality-gate";

describe("decisionFingerprint", () => {
  it("is stable for the same decision and changes when the limiter changes", () => {
    const base = {
      graphPath: "can-charger-charge",
      recommendation: "WORKS",
      limitingFactors: { max_power: 25, bottleneck: "device input limit", ports: 1 },
      evidenceIds: ["SPEC_VERIFIED"],
    };
    expect(decisionFingerprint(base)).toBe(decisionFingerprint({ ...base }));
    expect(decisionFingerprint(base)).not.toBe(
      decisionFingerprint({
        ...base,
        limitingFactors: { max_power: 20, bottleneck: "charger port allocation", ports: 1 },
      }),
    );
  });

  it("ignores entity names so Tokyo and Osaka collapse when the climate decision is identical", () => {
    const tokyo = climateFingerprint({
      tempBand: tempBand(12, 18),
      rainBand: rainBand(8),
      wind: 4,
      humidity: 70,
      capsule: ["coat", "knit"],
    });
    const osaka = climateFingerprint({
      tempBand: tempBand(12, 18),
      rainBand: rainBand(8),
      wind: 4,
      humidity: 70,
      capsule: ["coat", "knit"],
    });
    expect(tokyo).toBe(osaka);
    expect(tempBand(-6, -2)).toBe("freezing");
    expect(rainBand(14)).toBe("wet");
  });

  it("does not use word count as a quality signal", () => {
    const base = {
      site: "fixcode" as const,
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
      confidence: "HIGH" as const,
      freshness_days: 10,
      freshness_ttl_days: 365,
      provenance_valid: true,
      distinct_reason: "samsung-washer-4c",
      verified_fact_count: 10,
      decision_relation_count: 8,
    };
    const short = evaluatePageQuality({ ...base, word_count: 350 });
    const long = evaluatePageQuality({ ...base, word_count: 1500 });
    expect(short.score).toBe(long.score);
    expect(scaleQualityBand(91)).toBe("90+");
    expect(scaleQualityBand(59)).toBe("<60");
  });

  it("fingerprints a ChargeMatch pair from the decision fields, not the slug", () => {
    const a = fingerprintFromPage({
      site: "chargematch",
      family: "can-charger-charge",
      entity_ids: ["dev:iphone-16", "chg:anker-65w"],
      structured_payload: {
        match: "WORKS",
        max_power: 25,
        bottleneck: "device input limit",
        evidence: "SPEC_VERIFIED",
        device: "iphone-16",
        charger: "anker-65w",
      },
    });
    const b = fingerprintFromPage({
      site: "chargematch",
      family: "can-charger-charge",
      entity_ids: ["dev:iphone-16", "chg:apple-70w"],
      structured_payload: {
        match: "WORKS",
        max_power: 25,
        bottleneck: "device input limit",
        evidence: "SPEC_VERIFIED",
        device: "iphone-16",
        charger: "apple-70w",
      },
    });
    expect(a).toBe(b);
    const galaxy = fingerprintFromPage({
      site: "chargematch",
      family: "can-charger-charge",
      entity_ids: ["dev:galaxy-s24", "chg:anker-65w"],
      structured_payload: {
        match: "WORKS",
        max_power: 25,
        bottleneck: "device input limit",
        evidence: "SPEC_VERIFIED",
        device: "galaxy-s24",
        charger: "anker-65w",
      },
    });
    expect(galaxy).not.toBe(a);
  });
});

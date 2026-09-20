import { classifyIntent, type ClassifiedIntent } from "./intent";
import type { SiteId } from "./sites";

export const INTENT_CLASSES = [
  "INFORMATIONAL",
  "DECISION",
  "COMMERCIAL",
  "TRANSACTIONAL",
  "LEAD",
  "REPEAT",
  "DATA_PRODUCT",
  "B2B_OPERATOR",
] as const;

export type IntentClass = (typeof INTENT_CLASSES)[number];

export const SUITABILITY = ["NONE", "CONDITIONAL", "HIGH", "HIGH_WHEN_OFFERS_EXIST"] as const;
export type Suitability = (typeof SUITABILITY)[number];

export type IntentProfile = ClassifiedIntent & {
  class: IntentClass;
  adSuitability: Suitability;
  affiliateSuitability: Suitability;
  leadSuitability: Suitability;
  repeatPotential: Suitability;
  dataValue: Suitability;
  b2bRelevance: Suitability;
  commerceSurface: "none" | "official_outbound" | "offer_when_fresh" | "operator";
};

export function classifyIntentV2(input: { path: string }): IntentProfile {
  const base = classifyIntent(input);
  const site = base.site === "unknown" ? "unknown" : (base.site as SiteId);
  if (base.kind === "operator") {
    return {
      ...base,
      class: "B2B_OPERATOR",
      adSuitability: "NONE",
      affiliateSuitability: "NONE",
      leadSuitability: "HIGH",
      repeatPotential: "HIGH",
      dataValue: "HIGH",
      b2bRelevance: "HIGH",
      commerceSurface: "operator",
    };
  }
  if (site === "fixcode" && base.kind === "diagnose") {
    return {
      ...base,
      class: "DECISION",
      adSuitability: "CONDITIONAL",
      affiliateSuitability: "CONDITIONAL",
      leadSuitability: "HIGH",
      repeatPotential: "CONDITIONAL",
      dataValue: "HIGH",
      b2bRelevance: "HIGH",
      commerceSurface: "official_outbound",
    };
  }
  if (site === "chargematch" && base.kind === "check_compatibility") {
    return {
      ...base,
      class: "COMMERCIAL",
      adSuitability: "CONDITIONAL",
      affiliateSuitability: "HIGH_WHEN_OFFERS_EXIST",
      leadSuitability: "CONDITIONAL",
      repeatPotential: "HIGH",
      dataValue: "HIGH",
      b2bRelevance: "HIGH",
      commerceSurface: "offer_when_fresh",
    };
  }
  if (site === "tripcost" && base.kind === "compare_route") {
    return {
      ...base,
      class: "TRANSACTIONAL",
      adSuitability: "CONDITIONAL",
      affiliateSuitability: "CONDITIONAL",
      leadSuitability: "NONE",
      repeatPotential: "HIGH",
      dataValue: "CONDITIONAL",
      b2bRelevance: "HIGH",
      commerceSurface: "offer_when_fresh",
    };
  }
  if (site === "autospec" && base.kind === "inspect_vehicle") {
    return {
      ...base,
      class: "DECISION",
      adSuitability: "NONE",
      affiliateSuitability: "CONDITIONAL",
      leadSuitability: "HIGH",
      repeatPotential: "HIGH",
      dataValue: "HIGH",
      b2bRelevance: "HIGH",
      commerceSurface: "official_outbound",
    };
  }
  if (site === "wearthere" && base.kind === "pack_trip") {
    return {
      ...base,
      class: "DECISION",
      adSuitability: "CONDITIONAL",
      affiliateSuitability: "HIGH_WHEN_OFFERS_EXIST",
      leadSuitability: "NONE",
      repeatPotential: "HIGH",
      dataValue: "CONDITIONAL",
      b2bRelevance: "CONDITIONAL",
      commerceSurface: "none",
    };
  }
  return {
    ...base,
    class: "INFORMATIONAL",
    adSuitability: "NONE",
    affiliateSuitability: "NONE",
    leadSuitability: "NONE",
    repeatPotential: "CONDITIONAL",
    dataValue: "NONE",
    b2bRelevance: base.kind === "operator" ? "HIGH" : "NONE",
    commerceSurface: "none",
  };
}

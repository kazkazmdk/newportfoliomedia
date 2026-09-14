import type { DemandAssessmentV2, SeoOpportunityScore } from "./types";

export function seoOpportunityScore(input: {
  assessment: DemandAssessmentV2;
  truthReady: boolean;
  productUtility: boolean;
  truthGatePass: boolean;
}): SeoOpportunityScore {
  const demand = Math.min(35, Math.round((input.assessment.preLaunchScore / 70) * 35));
  const truth = input.truthReady ? 25 : 8;
  const utility = input.productUtility ? 15 : 4;
  const serp =
    input.assessment.serpOpportunity === "HIGH"
      ? 15
      : input.assessment.serpOpportunity === "MEDIUM"
        ? 10
        : input.assessment.serpOpportunity === "LOW"
          ? 4
          : 0;
  const competition =
    input.assessment.serpOpportunity === "HIGH" ? 10 : input.assessment.serpOpportunity === "MEDIUM" ? 6 : 2;
  const total = demand + truth + utility + serp + competition;
  return {
    demand,
    truth_readiness: truth,
    product_utility: utility,
    serp_opportunity: serp,
    competition,
    total,
    indexable: input.truthGatePass && (input.assessment.seoEligibility === "PRELAUNCH_VALIDATED" || input.assessment.seoEligibility === "POSTLAUNCH_VALIDATED"),
    reason: input.truthGatePass
      ? "opportunity score is informational — indexation still requires a demand path"
      : "Truth Gate fail — opportunity score cannot index",
  };
}

export type TruthDemandCell = "HIGH_TRUTH_HIGH_DEMAND" | "HIGH_TRUTH_LOW_DEMAND" | "LOW_TRUTH_HIGH_DEMAND" | "LOW_TRUTH_LOW_DEMAND";

export function truthDemandCell(truthReady: boolean, demandClass: DemandAssessmentV2["class"]): TruthDemandCell {
  const highDemand = demandClass === "HIGH" || demandClass === "VERY_HIGH";
  if (truthReady && highDemand) return "HIGH_TRUTH_HIGH_DEMAND";
  if (truthReady && !highDemand) return "HIGH_TRUTH_LOW_DEMAND";
  if (!truthReady && highDemand) return "LOW_TRUTH_HIGH_DEMAND";
  return "LOW_TRUTH_LOW_DEMAND";
}

export function cellAction(cell: TruthDemandCell): string {
  if (cell === "HIGH_TRUTH_HIGH_DEMAND") return "first launch batch";
  if (cell === "HIGH_TRUTH_LOW_DEMAND") return "product/noindex or long-tail backlog";
  if (cell === "LOW_TRUTH_HIGH_DEMAND") return "DATA PRIORITY";
  return "graph-only / deprioritize";
}

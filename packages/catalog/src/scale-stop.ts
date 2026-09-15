export type ScaleStopId =
  | "truth_ready_ratio"
  | "critical_provenance"
  | "duplicate_rate"
  | "sitemap_parity"
  | "candidate_growth"
  | "source_truth_depth"
  | "unknown_critical_rate"
  | "demand_validated_ratio"
  | "trusted_dataset_exact_rate"
  | "primary_exact_rate";

export const SCALE_STOP_THRESHOLDS = {
  truth_ready_ratio_min: 0.04,
  critical_provenance_min: 0.02,
  duplicate_rate_max: 0.25,
  candidate_growth_max: 4,
  source_truth_depth_min: 0.15,
  unknown_critical_rate_max: 0.85,
  demand_validated_ratio_min: 0.02,
} as const;

export type ScaleSnapshot = {
  pages: number;
  truthReady: number;
  criticalFacts: number;
  criticalFactsExact: number;
  duplicatePairs: number;
  sitemapParity: boolean;
  previousPages?: number;
  sourceTruthEdges: number;
  relations: number;
  unknownCritical: number;
  demandValidated: number;
  trustedDatasetExact?: number;
  primaryExact?: number;
};

export type ScaleStopResult = {
  id: ScaleStopId;
  triggered: boolean;
  value: number;
  threshold: number;
  reason: string;
};

export function evaluateScaleStops(snap: ScaleSnapshot): ScaleStopResult[] {
  const pages = Math.max(1, snap.pages);
  const truthReadyRatio = snap.truthReady / pages;
  const provenanceRatio = snap.criticalFactsExact / Math.max(1, snap.criticalFacts);
  const duplicateRate = snap.duplicatePairs / pages;
  const growth = snap.previousPages ? snap.pages / Math.max(1, snap.previousPages) : 1;
  const sourceTruthDepth = snap.sourceTruthEdges / Math.max(1, snap.relations);
  const unknownCritical = snap.unknownCritical / Math.max(1, snap.criticalFacts);
  const demandValidated = snap.demandValidated / pages;

  return [
    {
      id: "truth_ready_ratio",
      triggered: truthReadyRatio < SCALE_STOP_THRESHOLDS.truth_ready_ratio_min,
      value: truthReadyRatio,
      threshold: SCALE_STOP_THRESHOLDS.truth_ready_ratio_min,
      reason: "Truth Ready ratio collapsed — stop generating pages",
    },
    {
      id: "critical_provenance",
      triggered: provenanceRatio < SCALE_STOP_THRESHOLDS.critical_provenance_min && snap.criticalFacts > 20,
      value: provenanceRatio,
      threshold: SCALE_STOP_THRESHOLDS.critical_provenance_min,
      reason: "Critical exact provenance too low",
    },
    {
      id: "duplicate_rate",
      triggered: duplicateRate > SCALE_STOP_THRESHOLDS.duplicate_rate_max,
      value: duplicateRate,
      threshold: SCALE_STOP_THRESHOLDS.duplicate_rate_max,
      reason: "Duplicate rate too high",
    },
    {
      id: "sitemap_parity",
      triggered: !snap.sitemapParity,
      value: snap.sitemapParity ? 1 : 0,
      threshold: 1,
      reason: "Sitemap/index set parity broken",
    },
    {
      id: "candidate_growth",
      triggered: growth > SCALE_STOP_THRESHOLDS.candidate_growth_max,
      value: growth,
      threshold: SCALE_STOP_THRESHOLDS.candidate_growth_max,
      reason: "Candidate growth exploded vs previous snapshot",
    },
    {
      id: "source_truth_depth",
      triggered: sourceTruthDepth < SCALE_STOP_THRESHOLDS.source_truth_depth_min,
      value: sourceTruthDepth,
      threshold: SCALE_STOP_THRESHOLDS.source_truth_depth_min,
      reason: "SOURCE_TRUTH depth dropped",
    },
    {
      id: "unknown_critical_rate",
      triggered: unknownCritical > SCALE_STOP_THRESHOLDS.unknown_critical_rate_max && snap.criticalFacts > 20,
      value: unknownCritical,
      threshold: SCALE_STOP_THRESHOLDS.unknown_critical_rate_max,
      reason: "Unknown critical facts dominate",
    },
    {
      id: "demand_validated_ratio",
      triggered:
        snap.demandValidated > 0 && demandValidated < SCALE_STOP_THRESHOLDS.demand_validated_ratio_min,
      value: demandValidated,
      threshold: SCALE_STOP_THRESHOLDS.demand_validated_ratio_min,
      reason: "Demand-validated ratio fell after observations existed",
    },
    {
      id: "trusted_dataset_exact_rate",
      triggered: false,
      value: (snap.trustedDatasetExact ?? 0) / Math.max(1, snap.criticalFacts),
      threshold: 0,
      reason: "TRUSTED_DATASET_EXACT rate (in-repo compiled tables do not count)",
    },
    {
      id: "primary_exact_rate",
      triggered: false,
      value: (snap.primaryExact ?? 0) / Math.max(1, snap.criticalFacts),
      threshold: 0,
      reason: "PRIMARY_EXACT rate (separate from trusted dataset exact)",
    },
  ];
}

export function scaleMustStop(results: ScaleStopResult[]): boolean {
  return results.some((row) => row.triggered);
}

export type ScaleCandidate = {
  family: string;
  entityCombination: string[];
  estimatedPotential: number;
  truthCoverageAvailable: number;
  sourceCoverageAvailable: number;
  demandCoverageAvailable: number;
  safeToGenerate: boolean;
  blocker?: string;
};

export function scaleCandidates(): ScaleCandidate[] {
  return [
    {
      family: "error-code",
      entityCombination: ["brand", "appliance", "error"],
      estimatedPotential: 400,
      truthCoverageAvailable: 50,
      sourceCoverageAvailable: 4,
      demandCoverageAvailable: 0,
      safeToGenerate: false,
      blocker: "PRIMARY_EXACT manufacturer articles missing; no new brands without primary corpus",
    },
    {
      family: "wear-month",
      entityCombination: ["city", "justified_season"],
      estimatedPotential: 180,
      truthCoverageAvailable: 30,
      sourceCoverageAvailable: 1,
      demandCoverageAvailable: 0,
      safeToGenerate: false,
      blocker: "Need climate-season distinctness + observed demand before more cities",
    },
    {
      family: "oil-type",
      entityCombination: ["exact_vehicle_fitment", "spec"],
      estimatedPotential: 200,
      truthCoverageAvailable: 20,
      sourceCoverageAvailable: 0,
      demandCoverageAvailable: 0,
      safeToGenerate: false,
      blocker: "OEM handbook locators not exact; VIN still NOT_IMPLEMENTED",
    },
    {
      family: "device-wattage",
      entityCombination: ["device_intent"],
      estimatedPotential: 80,
      truthCoverageAvailable: 20,
      sourceCoverageAvailable: 10,
      demandCoverageAvailable: 0,
      safeToGenerate: false,
      blocker: "SEO only after proven device-level demand; no cartesian pairs",
    },
    {
      family: "route-car-vs-train",
      entityCombination: ["corridor"],
      estimatedPotential: 60,
      truthCoverageAvailable: 10,
      sourceCoverageAvailable: 0,
      demandCoverageAvailable: 0,
      safeToGenerate: false,
      blocker: "Heuristic fares cannot index; need a live fare provider",
    },
  ];
}

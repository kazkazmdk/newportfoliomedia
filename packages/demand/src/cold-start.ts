import type { DemandAssessmentV2, SeoValidation } from "./types";

export type PrelaunchBatchPage = {
  id: string;
  site: string;
  path: string;
  seoValidation: Extract<SeoValidation, "PRELAUNCH" | "POSTLAUNCH">;
  demandEvidenceIds: string[];
  truthDecisionId: string;
  reasons: string[];
};

export type PrelaunchBatch = {
  generatedAt: string;
  publicSiteLive: false;
  strategy: "COLD_START";
  note: string;
  pages: PrelaunchBatchPage[];
};

export function buildPrelaunchBatch(
  pages: Array<{
    id: string;
    site: string;
    url: string;
    index_state: string;
    seo_validation?: SeoValidation;
    demand_assessment?: DemandAssessmentV2;
    quality_why?: string;
  }>,
  generatedAt = new Date().toISOString(),
): PrelaunchBatch {
  return {
    generatedAt,
    publicSiteLive: false,
    strategy: "COLD_START",
    note: "GSC is not required. Only Truth-ready pages with a qualifying pre-launch demand path are included. Empty is honest when no observed evidence exists.",
    pages: pages
      .filter(
        (page) =>
          page.index_state === "INDEXABLE" &&
          (page.seo_validation === "PRELAUNCH" || page.demand_assessment?.seoEligibility === "PRELAUNCH_VALIDATED"),
      )
      .map((page) => ({
        id: page.id,
        site: page.site,
        path: page.url,
        seoValidation: "PRELAUNCH" as const,
        demandEvidenceIds: (page.demand_assessment?.evidence ?? [])
          .filter((row) => row.source !== "EDITORIAL")
          .map((row) => row.id),
        truthDecisionId: page.id,
        reasons: [
          page.demand_assessment?.seoEligibility ?? "PRELAUNCH_VALIDATED",
          page.quality_why ?? "truth + prelaunch demand",
        ],
      })),
  };
}

export function coldStartEligible(input: {
  truthReady: boolean;
  productUseful: boolean;
  demandPass: boolean;
  gscObserved: boolean;
}): boolean {
  return input.truthReady && input.productUseful && input.demandPass;
}

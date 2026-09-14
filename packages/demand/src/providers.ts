import type { DemandEvidence, DemandProvider, DemandProviderContext } from "./types";

export class ManualImportProvider implements DemandProvider {
  name = "MANUAL_IMPORT";
  constructor(private readonly rows: DemandEvidence[]) {}
  async checkQuery(query: string, context: DemandProviderContext): Promise<DemandEvidence[]> {
    return this.rows.filter(
      (row) =>
        row.query.toLowerCase() === query.toLowerCase() &&
        (!context.pageId || row.pageId === context.pageId),
    );
  }
}

export class KeywordPlannerExportProvider implements DemandProvider {
  name = "KEYWORD_PLANNER_EXPORT";
  constructor(private readonly rows: DemandEvidence[]) {}
  async checkQuery(query: string): Promise<DemandEvidence[]> {
    return this.rows.filter((row) => row.source === "KEYWORD_PLANNER" && row.query.toLowerCase() === query.toLowerCase());
  }
}

export class GscProvider implements DemandProvider {
  name = "GSC";
  constructor(private readonly rows: DemandEvidence[]) {}
  async checkQuery(query: string, context: DemandProviderContext): Promise<DemandEvidence[]> {
    return this.rows.filter(
      (row) =>
        row.source === "GSC" &&
        row.query.toLowerCase() === query.toLowerCase() &&
        (!context.pageId || row.pageId === context.pageId),
    );
  }
}

export class FutureSerpApiProvider implements DemandProvider {
  name = "FUTURE_SERP_API";
  async checkQuery(): Promise<DemandEvidence[]> {
    return [];
  }
}

export class FutureKeywordProvider implements DemandProvider {
  name = "FUTURE_KEYWORD_PROVIDER";
  async checkQuery(): Promise<DemandEvidence[]> {
    return [];
  }
}

export const DEMAND_PROVIDERS = {
  MANUAL_IMPORT: ManualImportProvider,
  KEYWORD_PLANNER_EXPORT: KeywordPlannerExportProvider,
  GSC: GscProvider,
  FUTURE_SERP_API: FutureSerpApiProvider,
  FUTURE_KEYWORD_PROVIDER: FutureKeywordProvider,
};

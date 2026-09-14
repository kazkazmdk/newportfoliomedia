import type { DemandEvidence, PostLaunchStatus } from "./types";

export type GscRow = {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  observedAt: string;
};

export function gscRowsToEvidence(rows: GscRow[], pageId: string): DemandEvidence[] {
  return rows.map((row, i) => ({
    id: `gsc:${pageId}:${i}`,
    source: "GSC" as const,
    query: row.query,
    locale: "en",
    observedAt: row.observedAt,
    observed: row.impressions > 0 || row.clicks > 0,
    value: row.impressions,
    unit: "IMPRESSIONS",
    url: row.page,
    confidence: 0.9,
    notes: `clicks=${row.clicks} ctr=${row.ctr} position=${row.position}`,
    collectionMethod: "API" as const,
    pageId,
  }));
}

export function reassessDemandAfterLaunch(input: {
  launchedAt: string;
  now?: Date;
  impressions: number;
  clicks: number;
  previousImpressions?: number;
  windows?: { discoveryDays: number; weakDays: number; decayDays: number };
}): PostLaunchStatus {
  const now = input.now ?? new Date();
  const launched = new Date(input.launchedAt).getTime();
  const ageDays = (now.getTime() - launched) / 86400000;
  const w = input.windows ?? { discoveryDays: 28, weakDays: 90, decayDays: 60 };
  if (ageDays < w.discoveryDays) return "DISCOVERY";
  if (input.previousImpressions != null && input.impressions < input.previousImpressions * 0.6 && ageDays >= w.decayDays) {
    return "DECAYING";
  }
  if (input.clicks > 0 && input.impressions >= 50) return "WINNER";
  if (input.impressions >= 30) return "PROVEN";
  if (ageDays >= w.weakDays && input.impressions < 10) return "WEAK";
  return "DISCOVERY";
}

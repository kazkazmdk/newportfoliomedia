import type { DemandEvidence, LifecycleState, PostLaunchStatus } from "./types";

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

export type GscPerformanceRow = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  indexing_status?: "unknown" | "discovered" | "crawled" | "indexed" | "excluded";
};

export type GscJoinedRow<T extends { url: string; quality?: number; lifecycle?: LifecycleState }> = T & {
  gsc: GscPerformanceRow | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  indexing_status: GscPerformanceRow["indexing_status"] | "unknown";
  lifecycle_hint: LifecycleState;
  post_launch_flags: string[];
};

function lifecycleFromGsc(row: GscPerformanceRow | undefined, fallback: LifecycleState = "new"): LifecycleState {
  if (!row) return fallback;
  if (row.indexing_status === "indexed") {
    if (row.impressions >= 30 && row.clicks === 0) return "underperforming";
    return "indexed";
  }
  if (row.indexing_status === "crawled") return "crawled";
  if (row.indexing_status === "discovered") return "discovered";
  if (row.impressions > 0 || row.clicks > 0) return "indexed";
  return fallback;
}

export function joinGscToReleaseManifest<T extends { url: string; quality?: number; lifecycle?: LifecycleState }>(
  rows: T[],
  gsc: GscPerformanceRow[] = [],
): Array<GscJoinedRow<T>> {
  const byUrl = new Map(gsc.map((row) => [row.url, row]));
  return rows.map((row) => {
    const hit = byUrl.get(row.url);
    const flags: string[] = [];
    if (hit && (row.quality ?? 0) >= 80 && hit.impressions === 0) {
      flags.push("strong-page-ignored-by-google");
    }
    if (hit && (row.quality ?? 0) < 70 && hit.indexing_status === "indexed") {
      flags.push("weak-page-indexed");
    }
    return {
      ...row,
      gsc: hit ?? null,
      clicks: hit?.clicks ?? null,
      impressions: hit?.impressions ?? null,
      ctr: hit?.ctr ?? null,
      position: hit?.position ?? null,
      indexing_status: hit?.indexing_status ?? "unknown",
      lifecycle_hint: lifecycleFromGsc(hit, row.lifecycle ?? "new"),
      post_launch_flags: flags,
    };
  });
}

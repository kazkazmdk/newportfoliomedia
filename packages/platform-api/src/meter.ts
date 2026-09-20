import type { SiteId } from "@penta/monetization";

export type MeterBucket = {
  keyId: string;
  site: SiteId;
  day: string;
  calls: number;
  lastPath: string;
};

export const LOCAL_SOFT_CAP = 200;

export function meterDay(at = new Date()): string {
  return at.toISOString().slice(0, 10);
}

export function bumpMeter(
  buckets: MeterBucket[],
  input: { keyId: string; site: SiteId; path: string; at?: Date },
): { buckets: MeterBucket[]; current: MeterBucket; exceeded: boolean } {
  const day = meterDay(input.at);
  const next = buckets.map((row) => ({ ...row }));
  let current = next.find((row) => row.keyId === input.keyId && row.day === day);
  if (!current) {
    current = { keyId: input.keyId, site: input.site, day, calls: 0, lastPath: input.path };
    next.push(current);
  }
  current.calls += 1;
  current.lastPath = input.path;
  return { buckets: next, current, exceeded: current.calls > LOCAL_SOFT_CAP };
}

export function meterView(bucket: MeterBucket) {
  return {
    keyId: bucket.keyId,
    site: bucket.site,
    day: bucket.day,
    calls: bucket.calls,
    softCap: LOCAL_SOFT_CAP,
    exceeded: bucket.calls > LOCAL_SOFT_CAP,
    price: null as null,
    note: "Local soft cap only. No commercial rate card is published.",
  };
}

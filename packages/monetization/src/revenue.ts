import type { SiteId } from "./sites";

export const REVENUE_CHANNELS = [
  "ADS",
  "AFFILIATE",
  "LEAD",
  "API",
  "WIDGET",
  "DATA_LICENSE",
  "SPONSORSHIP",
] as const;

export type RevenueChannel = (typeof REVENUE_CHANNELS)[number];

export type RevenueEvent = {
  id: string;
  channel: RevenueChannel;
  site: SiteId;
  organizationId?: string;
  amount: number;
  currency: string;
  source?: string;
  externalReference?: string;
  occurredAt: string;
};

export function assertNoSeededProductionRevenue(events: RevenueEvent[], env = process.env.NODE_ENV): void {
  if (env === "production" && events.length > 0) {
    throw new Error("Production must not seed revenue events.");
  }
}

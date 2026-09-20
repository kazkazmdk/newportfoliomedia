import type { SiteId } from "@penta/monetization";

export const ENTITLEMENT_FEATURES = [
  "api_calls",
  "widget_checks",
  "data_exports",
  "seats",
  "lead_routing",
  "unbranded_widget",
] as const;

export type EntitlementFeature = (typeof ENTITLEMENT_FEATURES)[number];

export const PLAN_IDS = ["FREE", "STARTER", "PRO", "BUSINESS", "ENTERPRISE"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type Entitlement = {
  id: string;
  organizationId: string;
  site: SiteId | "*";
  feature: EntitlementFeature;
  limit: number;
  period: "minute" | "month" | "forever";
  startsAt: string;
  endsAt: string | null;
};

export type UsageCounter = {
  organizationId: string;
  site: SiteId;
  feature: EntitlementFeature;
  periodStart: string;
  used: number;
};

export type QuotaDecision =
  | { ok: true; remaining: number; limit: number; used: number }
  | { ok: false; code: "quota_exceeded"; remaining: 0; limit: number; used: number };

export function periodStart(period: Entitlement["period"], at = new Date()): string {
  if (period === "minute") {
    return new Date(at.getFullYear(), at.getMonth(), at.getDate(), at.getHours(), at.getMinutes()).toISOString();
  }
  if (period === "month") return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return "forever";
}

export function entitlementApplies(row: Entitlement, site: SiteId, at = new Date()): boolean {
  if (row.site !== "*" && row.site !== site) return false;
  if (new Date(row.startsAt).getTime() > at.getTime()) return false;
  if (row.endsAt && new Date(row.endsAt).getTime() < at.getTime()) return false;
  return true;
}

export function consumeQuota(input: {
  entitlement: Entitlement | undefined;
  used: number;
  increment?: number;
}): QuotaDecision {
  const increment = input.increment ?? 1;
  if (!input.entitlement) {
    return { ok: true, remaining: Number.POSITIVE_INFINITY, limit: Number.POSITIVE_INFINITY, used: input.used + increment };
  }
  const next = input.used + increment;
  if (next > input.entitlement.limit) {
    return { ok: false, code: "quota_exceeded", remaining: 0, limit: input.entitlement.limit, used: input.used };
  }
  return {
    ok: true,
    remaining: input.entitlement.limit - next,
    limit: input.entitlement.limit,
    used: next,
  };
}

export function defaultDevEntitlement(organizationId: string, site: SiteId | "*"): Entitlement {
  return {
    id: `ent_${organizationId}_api`,
    organizationId,
    site,
    feature: "api_calls",
    limit: 500,
    period: "month",
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: null,
  };
}

export function defaultWidgetEntitlement(organizationId: string, site: SiteId | "*"): Entitlement {
  return {
    id: `ent_${organizationId}_widget`,
    organizationId,
    site,
    feature: "widget_checks",
    limit: 2000,
    period: "month",
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: null,
  };
}

/** Internal plan catalog. No public prices. */
export const PLAN_FEATURES: Record<PlanId, { api_calls: number | null; unbranded_widget: boolean; contactSales: boolean }> = {
  FREE: { api_calls: 200, unbranded_widget: false, contactSales: false },
  STARTER: { api_calls: 2000, unbranded_widget: false, contactSales: true },
  PRO: { api_calls: 20000, unbranded_widget: true, contactSales: true },
  BUSINESS: { api_calls: 100000, unbranded_widget: true, contactSales: true },
  ENTERPRISE: { api_calls: null, unbranded_widget: true, contactSales: true },
};

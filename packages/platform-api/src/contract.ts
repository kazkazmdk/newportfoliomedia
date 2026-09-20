import { SITES, type SiteId } from "@penta/monetization";
import { API_ERROR_CODES } from "./errors";
import { KEY_SCOPES } from "./scopes";

export const API_VERSION = "v1";
export const WIDGET_SCRIPT_VERSION = "v1";

export const ENGINE_ROUTES: Record<SiteId, { method: "POST"; path: string; purpose: string }> = {
  fixcode: {
    method: "POST",
    path: "/api/v1/fixcode/diagnose",
    purpose: "Walk a stored diagnostic tree. Missing brands stay missing.",
  },
  chargematch: {
    method: "POST",
    path: "/api/v1/chargematch/compatibility",
    purpose: "Rated compatibility + limiting component. Not a measured wall draw.",
  },
  tripcost: {
    method: "POST",
    path: "/api/v1/tripcost/compare",
    purpose: "Modelled corridor compare. Not a live fare.",
  },
  autospec: {
    method: "POST",
    path: "/api/v1/autospec/vehicle",
    purpose: "Vehicle identity, interval, optional fitment. No invented SKUs.",
  },
  wearthere: {
    method: "POST",
    path: "/api/v1/wearthere/packing",
    purpose: "Climate-typical capsule. Not a live forecast shop.",
  },
};

export function contractManifest() {
  return {
    version: API_VERSION,
    deprecation: {
      policy: "A version is supported until a successor is documented. No sunset date is published.",
      previous: [] as string[],
    },
    sites: [...SITES],
    engines: ENGINE_ROUTES,
    auth: {
      modes: ["bearer_api_key", "local_dev_session"],
      keyPrefix: "penta_local_|penta_prod_",
      defaultScopes: ["engine:read", "usage:read"],
      scopes: [...KEY_SCOPES],
    },
    errors: {
      envelope: "{ error: { code, message, request_id, details? } }",
      codes: [...API_ERROR_CODES],
    },
    quota: {
      model: "entitlement_per_org_site_feature",
      exceeded: "429 quota_exceeded",
      publishedPrices: false,
    },
    widgets: {
      version: WIDGET_SCRIPT_VERSION,
      script: "/widgets/v1/{site}.js",
      requiresInstallation: true,
      originAllowlist: true,
    },
    features: {
      billing: false,
      stripe: false,
      publicKeyCreate: false,
      partnerNetwork: false,
      affiliatePrograms: false,
    },
    sla: null,
    billing: null,
    rateCard: null,
    hosted: process.env.DATABASE_URL ? "postgres_when_configured" : "dev_fallback",
    note: "No SLA. No public rate card. Keys are hashed. A key is bound to one product.",
  };
}

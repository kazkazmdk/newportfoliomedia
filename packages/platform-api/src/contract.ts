import { SITES, type SiteId } from "@penta/monetization";

export const API_VERSION = "v1";

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

export const PLATFORM_ROUTES = [
  { method: "POST", path: "/api/v1/events", auth: "optional", purpose: "Persist a classified product event locally." },
  { method: "POST", path: "/api/v1/leads", auth: "optional", purpose: "Store an unassigned local lead." },
  { method: "POST", path: "/api/v1/observations", auth: "optional", purpose: "Store USER_REPORTED / USER_OBSERVED feedback." },
  { method: "POST", path: "/api/v1/keys", auth: "none", purpose: "Issue a local key. Token shown once." },
  { method: "GET", path: "/api/v1/keys", auth: "bearer", purpose: "List prefixes for the calling key's site." },
  { method: "GET", path: "/api/v1/meter", auth: "bearer", purpose: "Local call counts. No price." },
  { method: "GET", path: "/api/v1/ops/readiness", auth: "none", purpose: "Internal winner signal from in-repo metrics." },
] as const;

export function contractManifest() {
  return {
    version: API_VERSION,
    sites: [...SITES],
    engines: ENGINE_ROUTES,
    platform: PLATFORM_ROUTES,
    billing: null,
    rateCard: null,
    hosted: "local_only",
    note: "Keys and meter live in data/platform on this machine. Nothing is billed.",
  };
}

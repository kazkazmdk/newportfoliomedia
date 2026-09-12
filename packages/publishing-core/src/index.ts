import type { IndexState, PageRecord, SiteId } from "@penta/graph-core";

export const PUBLIC_SITE_LIVE = process.env.PUBLIC_SITE_LIVE === "true";
export const IS_PREVIEW =
  process.env.VERCEL_ENV === "preview" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export function globalNoindex(): boolean {
  return !PUBLIC_SITE_LIVE || IS_PREVIEW;
}

export function robotsForSite(site: SiteId): string {
  if (globalNoindex()) {
    return `User-agent: *\nDisallow: /\n`;
  }
  return `User-agent: *\nAllow: /\nDisallow: /trip/\nDisallow: /garage\nDisallow: /kit\nDisallow: /compare\nDisallow: /ops\nDisallow: /api/\nSitemap: https://${site}.example.com/sitemap.xml\n`;
}

export function shouldIndexPage(page: PageRecord): boolean {
  if (globalNoindex()) return false;
  return page.index_state === "INDEXABLE" && page.publish_state === "PUBLISHED" && !page.noindex;
}

export const SITEMAP_FAMILIES: Record<SiteId, string[]> = {
  fixcode: ["errors", "symptoms", "guides", "hubs"],
  autospec: ["oil", "maintenance", "tyres", "battery", "problems", "hubs"],
  wearthere: ["wear-month", "packing", "destinations"],
  chargematch: ["wattage", "compatibility", "hubs"],
  tripcost: ["routes", "calculators"],
};

export function sitemapPages(pages: PageRecord[], family?: string): PageRecord[] {
  return pages.filter((page) => {
    if (!shouldIndexPage(page)) return false;
    if (!family) return true;
    return sitemapFamily(page) === family;
  });
}

export function sitemapFamily(page: PageRecord): string {
  if (page.site === "fixcode") {
    if (page.family === "error-code") return "errors";
    if (page.family === "symptom") return "symptoms";
    if (page.family === "repair-guide") return "guides";
    return "hubs";
  }
  if (page.site === "autospec") {
    if (page.family.includes("oil")) return "oil";
    if (page.family === "maintenance-schedule") return "maintenance";
    if (page.family === "tyre-pressure") return "tyres";
    if (page.family === "battery") return "battery";
    if (page.family === "common-problems" || page.family === "recalls") return "problems";
    return "hubs";
  }
  if (page.site === "wearthere") {
    if (page.family === "wear-month") return "wear-month";
    if (page.family === "packing-month") return "packing";
    return "destinations";
  }
  if (page.site === "chargematch") {
    if (page.family === "device-wattage") return "wattage";
    if (page.family.includes("charger") || page.family === "can-charger-charge") {
      return "compatibility";
    }
    return "hubs";
  }
  if (page.family === "travel-calculator") return "calculators";
  return "routes";
}

export function canonicalFor(page: PageRecord): string {
  return page.canonical;
}

export function batchPages(pages: PageRecord[], size: number): PageRecord[][] {
  const batches: PageRecord[][] = [];
  for (let i = 0; i < pages.length; i += size) {
    batches.push(pages.slice(i, i + size));
  }
  return batches;
}

export function scaleGuard(input: {
  previous_pages: number;
  previous_impressions: number;
  next_pages: number;
  next_impressions: number;
}): { ok: boolean; impressions_per_page_delta: number; reason: string } {
  const prev = input.previous_impressions / Math.max(1, input.previous_pages);
  const next = input.next_impressions / Math.max(1, input.next_pages);
  const delta = next - prev;
  if (next < prev * 0.35 && input.next_pages > input.previous_pages) {
    return {
      ok: false,
      impressions_per_page_delta: delta,
      reason: "Marginal yield collapsed. Stop scaling this template.",
    };
  }
  return { ok: true, impressions_per_page_delta: delta, reason: "Yield acceptable" };
}

export type IndexDecision = {
  url: string;
  state: IndexState;
  quality: number;
  demand: number;
};

export const PRELAUNCH_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
};

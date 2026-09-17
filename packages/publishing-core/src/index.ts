import type { GraphEntity, GraphRelation, GraphStore, IndexState, PageRecord, SiteId } from "@penta/graph-core";

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

export const CATALOG_TIERS = ["A", "B", "C"] as const;
export type CatalogTier = (typeof CATALOG_TIERS)[number];
export const SITEMAP_SITES: SiteId[] = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];

export function sitemapSegmentId(site: SiteId, tier: CatalogTier): string {
  return `${site}-${tier.toLowerCase()}`;
}

export const SITEMAP_SEGMENT_IDS = SITEMAP_SITES.flatMap((site) =>
  CATALOG_TIERS.map((tier) => sitemapSegmentId(site, tier)),
);

export function parseSitemapSegmentId(id: string): { site: SiteId; tier: CatalogTier } | null {
  const clean = id.replace(/\.xml$/i, "");
  const match = clean.match(/^(fixcode|autospec|wearthere|chargematch|tripcost)-(a|b|c)$/i);
  if (!match) return null;
  return { site: match[1] as SiteId, tier: match[2].toUpperCase() as CatalogTier };
}

/** Sitemap may contain PUBLISHABLE+INDEXABLE only. Never LIMITED / NOINDEX / BLOCKED. */
export function sitemapEligible(page: PageRecord): boolean {
  if (!shouldIndexPage(page)) return false;
  if (page.catalog_publish_state && page.catalog_publish_state !== "PUBLISHABLE") return false;
  return true;
}

export function sitemapSegmentPages(pages: PageRecord[], id: string): PageRecord[] {
  const parsed = parseSitemapSegmentId(id);
  if (!parsed) return [];
  return pages.filter(
    (page) => sitemapEligible(page) && page.site === parsed.site && page.catalog_tier === parsed.tier,
  );
}

function parseStamp(value?: string | null): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/** Latest source / entity / relation / decision update. Never Date.now() per build. */
export function lastmodFromGraph(store: GraphStore, page: PageRecord): string {
  const stamps: number[] = [];
  const push = (value?: string | null) => {
    const t = parseStamp(value);
    if (t != null) stamps.push(t);
  };
  push(page.freshness);
  push(typeof page.structured_payload.lastmod === "string" ? page.structured_payload.lastmod : null);
  for (const id of page.entity_ids) {
    const entity: GraphEntity | undefined = store.get(id);
    if (!entity) continue;
    push(entity.updated_at);
    push(entity.created_at);
    for (const rec of entity.provenance) {
      push(rec.retrieved_at);
      push(rec.verified_at);
    }
  }
  const related: GraphRelation[] = page.entity_ids.flatMap((id) => store.related(id));
  for (const rel of related) {
    push(rel.verified_at);
    for (const rec of rel.provenance) {
      push(rec.retrieved_at);
      push(rec.verified_at);
    }
  }
  if (!stamps.length) {
    return page.freshness || "2026-01-01T00:00:00.000Z";
  }
  return new Date(Math.max(...stamps)).toISOString();
}

export function urlsetXml(entries: Array<{ loc: string; lastmod?: string }>): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${entry.loc}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexXml(locs: string[]): string {
  const items = locs
    .map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
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

export { surfaceParity, parityIssues } from "./parity";
export type { SurfaceParityReport } from "./parity";

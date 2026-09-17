import { buildCatalog } from "@penta/catalog";
import { globalNoindex, sitemapEligible } from "@penta/publishing-core";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (globalNoindex()) return [];
  return [...buildCatalog().pages.values()].filter((page) => sitemapEligible(page)).map((page) => ({
    url: page.canonical,
    lastModified: page.freshness || undefined,
  }));
}

import { buildCatalog } from "@penta/catalog";
import { shouldIndexPage } from "@penta/publishing-core";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = buildCatalog();
  return [...catalog.pages.values()]
    .filter(shouldIndexPage)
    .map((page) => ({
      url: page.canonical,
      lastModified: page.freshness || undefined,
    }));
}

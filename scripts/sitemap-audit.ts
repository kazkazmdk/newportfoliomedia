import { buildCatalog, resetCatalogCache } from "@penta/catalog";
import { SITEMAP_SEGMENT_IDS, parityIssues, shouldIndexPage, sitemapSegmentPages, surfaceParity } from "@penta/publishing-core";

resetCatalogCache();
const store = buildCatalog();
const pages = [...store.pages.values()];
const live = process.env.PUBLIC_SITE_LIVE === "true";
const sitemapUrls = live ? pages.filter(shouldIndexPage).map((page) => page.canonical) : [];
const report = surfaceParity({ pages, sitemapUrls, publicSiteLive: live });
const issues = parityIssues(report);

for (const id of SITEMAP_SEGMENT_IDS) {
  const extra = sitemapSegmentPages(pages, id).filter((page) => !shouldIndexPage(page));
  if (extra.length) {
    issues.push(`segment ${id} contains non-indexable URLs`);
  }
}

if (issues.length) {
  console.error(JSON.stringify({ ok: false, issues, report }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      exactParity: report.exactParity,
      public_site_live: live,
      indexablePaths: report.indexablePaths.length,
      sitemapPaths: report.sitemapPaths.length,
    },
    null,
    2,
  ),
);

import { buildCatalog, resetCatalogCache } from "@penta/catalog";
import { parityIssues, shouldIndexPage, surfaceParity } from "@penta/publishing-core";

resetCatalogCache();
const store = buildCatalog();
const pages = [...store.pages.values()];
const live = process.env.PUBLIC_SITE_LIVE === "true";
const sitemapUrls = live ? pages.filter(shouldIndexPage).map((page) => page.canonical) : [];
const report = surfaceParity({ pages, sitemapUrls, publicSiteLive: live });
const issues = parityIssues(report);

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

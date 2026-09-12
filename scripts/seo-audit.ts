import { programmaticSeoIssues, sitemapConsistencyIssues, launchReport } from "@penta/catalog";
import { globalNoindex } from "@penta/publishing-core";

const issues = programmaticSeoIssues();
const sitemap = sitemapConsistencyIssues();
const report = launchReport();

if (report.public_site_live) {
  issues.push("PUBLIC_SITE_LIVE must stay false on this pass");
}
if (!globalNoindex()) {
  issues.push("global noindex expected during prelaunch");
}
if (sitemap.issues.length) issues.push(...sitemap.issues);

if (issues.length) {
  console.error(JSON.stringify({ ok: false, issues, sitemap }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      public_site_live: report.public_site_live,
      global_noindex: report.global_noindex,
      indexable: report.graph.indexable,
      sitemap: sitemap.note,
    },
    null,
    2,
  ),
);

import type { PageRecord } from "@penta/graph-core";

export type SurfaceParityReport = {
  indexablePaths: string[];
  sitemapPaths: string[];
  missingFromSitemap: string[];
  unexpectedInSitemap: string[];
  duplicateSitemapPaths: string[];
  duplicateCanonicalPaths: string[];
  canonicalMismatches: Array<{ pageId: string; expected: string; actual: string }>;
  exactParity: boolean;
};

function pathOf(value: string): string {
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).pathname;
    }
  } catch {
    /* keep raw */
  }
  return value;
}

export function surfaceParity(input: {
  pages: PageRecord[];
  sitemapUrls: string[];
  publicSiteLive?: boolean;
}): SurfaceParityReport {
  const live = input.publicSiteLive ?? process.env.PUBLIC_SITE_LIVE === "true";
  const indexable = input.pages.filter((page) => page.index_state === "INDEXABLE");
  const indexablePaths = live
    ? indexable
        .filter((page) => page.publish_state === "PUBLISHED" && !page.noindex)
        .map((page) => pathOf(page.canonical))
        .sort()
    : [];
  const sitemapPaths = input.sitemapUrls.map(pathOf).sort();

  const sitemapSet = new Set(sitemapPaths);
  const indexSet = new Set(indexablePaths);
  const missingFromSitemap = indexablePaths.filter((p) => !sitemapSet.has(p));
  const unexpectedInSitemap = sitemapPaths.filter((p) => !indexSet.has(p));

  const sitemapCounts = new Map<string, number>();
  for (const p of sitemapPaths) sitemapCounts.set(p, (sitemapCounts.get(p) ?? 0) + 1);
  const duplicateSitemapPaths = [...sitemapCounts.entries()].filter(([, n]) => n > 1).map(([p]) => p);

  const canonCounts = new Map<string, string[]>();
  for (const page of indexable) {
    const key = pathOf(page.canonical);
    const list = canonCounts.get(key) ?? [];
    list.push(page.id);
    canonCounts.set(key, list);
  }
  const duplicateCanonicalPaths = [...canonCounts.entries()].filter(([, ids]) => ids.length > 1).map(([p]) => p);

  const canonicalMismatches = indexable
    .filter((page) => pathOf(page.canonical) !== pathOf(page.url))
    .map((page) => ({ pageId: page.id, expected: page.url, actual: page.canonical }));

  const exactParity =
    missingFromSitemap.length === 0 &&
    unexpectedInSitemap.length === 0 &&
    duplicateSitemapPaths.length === 0 &&
    duplicateCanonicalPaths.length === 0 &&
    canonicalMismatches.length === 0;

  return {
    indexablePaths,
    sitemapPaths,
    missingFromSitemap,
    unexpectedInSitemap,
    duplicateSitemapPaths,
    duplicateCanonicalPaths,
    canonicalMismatches,
    exactParity,
  };
}

export function parityIssues(report: SurfaceParityReport): string[] {
  const issues: string[] = [];
  for (const p of report.missingFromSitemap) issues.push(`INDEXABLE missing from sitemap: ${p}`);
  for (const p of report.unexpectedInSitemap) issues.push(`unexpected sitemap path: ${p}`);
  for (const p of report.duplicateSitemapPaths) issues.push(`duplicate sitemap path: ${p}`);
  for (const p of report.duplicateCanonicalPaths) issues.push(`duplicate canonical: ${p}`);
  for (const row of report.canonicalMismatches) {
    issues.push(`canonical mismatch ${row.pageId}: expected ${row.expected} got ${row.actual}`);
  }
  return issues;
}

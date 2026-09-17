import { describe, expect, it } from "vitest";
import {
  applyAutoQaSample,
  buildCatalog,
  catalogPublishState,
  qaReviewQueue,
  resetCatalogCache,
  scaleReport,
} from "@penta/catalog";
import {
  absoluteSitemapLoc,
  isPublicSiteLive,
  publicSiteOrigin,
  sitemapEligible,
  sitemapIndexXml,
  sitemapSegmentPages,
  SITEMAP_SEGMENT_IDS,
  urlsetXml,
} from "@penta/publishing-core";
import { allCalculablePairs, allChargematchPages, seoSurfacePairs } from "@penta/chargematch";

describe("sitemap live simulation (PUBLIC_SITE_LIVE not flipped)", () => {
  it("builds absolute locs under a simulated live env without changing process.env", () => {
    expect(process.env.PUBLIC_SITE_LIVE === "true").toBe(false);
    const env = {
      ...process.env,
      PUBLIC_SITE_LIVE: "true",
      PUBLIC_SITE_ORIGIN: "https://penta.example.com",
    };
    expect(isPublicSiteLive(env)).toBe(true);
    expect(isPublicSiteLive(process.env)).toBe(false);
    expect(publicSiteOrigin(env)).toBe("https://penta.example.com");
    expect(absoluteSitemapLoc("/fixcode/samsung/washer/4e-error", env)).toBe(
      "https://penta.example.com/fixcode/samsung/washer/4e-error",
    );
    const index = sitemapIndexXml(SITEMAP_SEGMENT_IDS.map((id) => absoluteSitemapLoc(`/sitemaps/${id}.xml`, env)));
    expect(index).toContain("<loc>https://penta.example.com/sitemaps/fixcode-a.xml</loc>");
    expect(index).not.toMatch(/<loc>\/sitemaps\//);
  });

  it("simulated live urlset only lists PUBLISHABLE + INDEXABLE absolute URLs with tier parity", () => {
    resetCatalogCache();
    const store = buildCatalog();
    const env = { ...process.env, PUBLIC_SITE_LIVE: "true", PUBLIC_SITE_ORIGIN: "https://penta.example.com" };
    const fakeIndexable = [...store.pages.values()].filter((page) => catalogPublishState(page) === "PUBLISHABLE").slice(0, 3);
    for (const page of fakeIndexable) {
      page.index_state = "INDEXABLE";
      page.publish_state = "PUBLISHED";
      page.noindex = false;
    }
    for (const id of SITEMAP_SEGMENT_IDS) {
      const pages = sitemapSegmentPages([...store.pages.values()], id, env);
      for (const page of pages) {
        expect(catalogPublishState(page)).toBe("PUBLISHABLE");
        expect(page.index_state).toBe("INDEXABLE");
        expect(page.catalog_tier).toBe(id.split("-").pop()?.toUpperCase());
      }
      const xml = urlsetXml(
        pages.map((page) => ({ loc: absoluteSitemapLoc(page.canonical, env), lastmod: page.freshness })),
      );
      if (pages.length) {
        expect(xml).toMatch(/<loc>https:\/\/penta\.example\.com\//);
        expect(xml).not.toMatch(/<loc>\//);
      }
    }
    expect(sitemapEligible(fakeIndexable[0], process.env)).toBe(false);
  });
});

describe("ChargeMatch pair kinds", () => {
  it("keeps calculable pairs larger than the SEO surface set", () => {
    const calculable = allCalculablePairs();
    const seo = seoSurfacePairs();
    const pages = allChargematchPages().filter((page) => page.family === "can-charger-charge");
    expect(calculable.length).toBeGreaterThan(seo.length);
    expect(calculable.some((row) => row.kind === "CALCULABLE_PAIR")).toBe(true);
    expect(calculable.some((row) => row.kind === "SEO_SURFACE_CANDIDATE")).toBe(true);
    expect(pages.length).toBe(new Set(seo.map(([d, c]) => `${d}:${c}`)).size);
    expect(pages.every((page) => page.structured_payload.pair_kind === "SEO_SURFACE_CANDIDATE")).toBe(true);
  });
});

describe("QA honesty and orphans", () => {
  it("auto QA never claims MANUAL_PASS or MANUAL_FAIL", () => {
    resetCatalogCache();
    const store = buildCatalog();
    const queue = applyAutoQaSample(store);
    expect(queue.length).toBeGreaterThanOrEqual(100);
    expect(queue.length).toBeLessThanOrEqual(130);
    expect(queue.every((row) => row.qaStatus === "NOT_REVIEWED" || row.qaStatus === "AUTO_VERIFIED")).toBe(true);
    expect(queue.some((row) => row.qaStatus === "MANUAL_PASS")).toBe(false);
    expect(qaReviewQueue(store).every((row) => row.qaStatus !== "MANUAL_PASS")).toBe(true);
  });

  it("has zero PUBLISHABLE orphans", () => {
    resetCatalogCache();
    const store = buildCatalog();
    const report = scaleReport(store);
    const orphans = [...store.pages.values()].filter((page) => {
      if (catalogPublishState(page) !== "PUBLISHABLE") return false;
      return page.structured_payload.has_internal_link !== true;
    });
    expect(orphans.map((page) => page.url)).toEqual([]);
    expect(report.publishable).toBeGreaterThan(0);
  });
});

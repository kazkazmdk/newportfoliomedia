import { describe, expect, it } from "vitest";
import { buildCatalog, qaSample, releaseCandidates, scaleReport } from "@penta/catalog";
import { joinGscToReleaseManifest } from "@penta/demand";
import {
  globalNoindex,
  lastmodFromGraph,
  parseSitemapSegmentId,
  shouldIndexPage,
  sitemapEligible,
  sitemapSegmentPages,
  SITEMAP_SEGMENT_IDS,
} from "@penta/publishing-core";

describe("data + distribution", () => {
  it("keeps INDEXABLE at zero while PUBLIC_SITE_LIVE is false", () => {
    const store = buildCatalog();
    const indexable = [...store.pages.values()].filter((page) => page.index_state === "INDEXABLE");
    expect(indexable).toHaveLength(0);
    expect(globalNoindex()).toBe(true);
    expect(process.env.PUBLIC_SITE_LIVE === "true").toBe(false);
    expect([...store.pages.values()].every((page) => !shouldIndexPage(page))).toBe(true);
    expect([...store.pages.values()].every((page) => !sitemapEligible(page))).toBe(true);
  });

  it("assigns fingerprints, lastmod from the graph, and A/B/C only on publishable pages", () => {
    const store = buildCatalog();
    const report = scaleReport(store);
    expect(report.generated).toBe([...store.pages.values()].length);
    expect(report.publishable + report.limited + report.noindex + report.blocked).toBe(report.generated);
    for (const page of store.pages.values()) {
      expect(page.decision_fingerprint).toMatch(/^df1:/);
      expect(page.freshness).toBeTruthy();
      expect(Date.parse(page.freshness)).not.toBeNaN();
      const lastmod = lastmodFromGraph(store, page);
      expect(lastmod).toBe(page.freshness);
      if (page.catalog_publish_state === "PUBLISHABLE") {
        expect(["A", "B", "C"]).toContain(page.catalog_tier);
      } else {
        expect(page.catalog_tier).toBeNull();
      }
    }
    const candidates = releaseCandidates(store);
    expect(candidates.length).toBe(report.publishable);
    expect(candidates.every((row) => row.publishState === "PUBLISHABLE")).toBe(true);
    for (const site of Object.values(report.byProduct)) {
      expect(site.tierA + site.tierB + site.tierC).toBe(site.publishable);
    }
  });

  it("never puts LIMITED / NOINDEX / BLOCKED URLs in a sitemap segment", () => {
    const store = buildCatalog();
    for (const id of SITEMAP_SEGMENT_IDS) {
      expect(parseSitemapSegmentId(id)).not.toBeNull();
      const pages = sitemapSegmentPages([...store.pages.values()], id);
      expect(pages).toEqual([]);
    }
    for (const page of store.pages.values()) {
      if (page.catalog_publish_state !== "PUBLISHABLE") {
        expect(sitemapEligible(page)).toBe(false);
      }
    }
  });

  it("builds a representative QA sample and a GSC join scaffold without live GSC", () => {
    const store = buildCatalog();
    const sample = qaSample(store, 20);
    expect(sample.length).toBeGreaterThanOrEqual(80);
    expect(sample.length).toBeLessThanOrEqual(110);
    const products = new Set(sample.map((row) => row.product));
    expect(products.size).toBe(5);
    const joined = joinGscToReleaseManifest(releaseCandidates(store), []);
    expect(joined.every((row) => row.gsc === null && row.lifecycle_hint === "new")).toBe(true);
  });

  it("does not invent ChargeMatch pairs: every pair page maps to a real device and charger", async () => {
    const { allChargematchPages, getCharger, getDevice } = await import("@penta/chargematch");
    const pairs = allChargematchPages().filter((page) => page.family === "can-charger-charge");
    expect(pairs.length).toBeGreaterThan(40);
    for (const page of pairs) {
      const device = getDevice(String(page.structured_payload.device));
      const charger = getCharger(String(page.structured_payload.charger));
      expect(device).toBeTruthy();
      expect(charger).toBeTruthy();
    }
  });
});

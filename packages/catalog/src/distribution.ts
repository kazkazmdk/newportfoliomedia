import type { GraphStore, PageRecord, SiteId } from "@penta/graph-core";
import {
  fingerprintFromPage,
  scaleQualityBand,
  scaleQualityDistribution,
  type ScaleQualityBand,
} from "@penta/quality-gate";
import { joinGscToReleaseManifest, type GscPerformanceRow, type LifecycleState } from "@penta/demand";
import { sourceCoverageOf } from "./source-coverage";

export type QaReviewStatus = "NOT_REVIEWED" | "AUTO_VERIFIED" | "MANUAL_PASS" | "MANUAL_FAIL";
export { sourceCoverageOf } from "./source-coverage";
export type { DecisionFact, SourceCoverageReport } from "./source-coverage";

export const CATALOG_SITES: SiteId[] = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];
export const CATALOG_TIERS = ["A", "B", "C"] as const;
export type CatalogTier = (typeof CATALOG_TIERS)[number];
export type CatalogPublishState = "PUBLISHABLE" | "LIMITED" | "NOINDEX" | "BLOCKED";

export type ReleaseCandidate = {
  url: string;
  product: SiteId;
  intent: string;
  quality: number;
  publishState: CatalogPublishState;
  catalogTier: CatalogTier | null;
  decisionFingerprint: string;
  sourceCoverage: number;
  realSourceCoverage: number;
  decisionFacts: number;
  sourcedDecisionFacts: number;
  indexState: PageRecord["index_state"];
  family: string;
  qualityBand: ScaleQualityBand;
  lifecycle: LifecycleState;
  lastmod: string;
  reasons: string[];
  qaStatus?: QaReviewStatus;
  autoQa?: string[];
};

export type ProductScaleRow = {
  product: SiteId;
  entities: number;
  relations: number;
  generated: number;
  candidateUrls: number;
  publishable: number;
  limited: number;
  noindex: number;
  blocked: number;
  tierA: number;
  tierB: number;
  tierC: number;
  duplicateClustersRemoved: number;
  qualityBands: Record<ScaleQualityBand, number>;
  realSourceCoverage: number;
  sources: number;
};

export type ScaleReport = {
  generated: number;
  publishable: number;
  limited: number;
  noindex: number;
  blocked: number;
  duplicateClustersRemoved: number;
  qualityBands: Record<ScaleQualityBand, number>;
  byProduct: Record<SiteId, ProductScaleRow>;
};

export type MonitorCohort = {
  product: SiteId;
  tier: CatalogTier | "none";
  intentType: string;
  qualityBand: ScaleQualityBand;
  entityType: string;
  urls: number;
  publishable: number;
};

function hardBlockers(page: PageRecord): string[] {
  const raw = page.structured_payload.hard_blockers;
  return Array.isArray(raw) ? raw.map(String) : [];
}

/** Real prioritization: quality + coverage + demand + uniqueness + entity importance. */
export function priorityScore(page: PageRecord): number {
  const coverage = sourceCoverageOf(page);
  const uniqueness = page.structured_payload.duplicate_of ? 0 : 12;
  const importance = Math.min(20, page.entity_ids.length * 3 + (page.family.includes("hub") ? 4 : 0));
  return page.quality_score + coverage * 40 + page.search_demand + uniqueness + importance;
}

function storedCount(page: PageRecord, key: "decision_facts_count" | "sourced_decision_facts"): number {
  const value = page.structured_payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function catalogPublishState(page: PageRecord): CatalogPublishState {
  if (page.catalog_publish_state) return page.catalog_publish_state;
  if (
    page.index_state === "CONFLICTED" ||
    page.index_state === "STALE" ||
    page.index_state === "REMOVED"
  ) {
    return "BLOCKED";
  }
  if (page.index_state === "REVIEW_REQUIRED") return "LIMITED";
  if (page.index_state === "NOINDEX_PRODUCT") return "LIMITED";
  if (page.index_state === "GRAPH_ONLY" || page.index_state === "REDIRECT") return "NOINDEX";
  if (page.index_state === "INDEXABLE" || page.index_state === "SEO_CANDIDATE") return "PUBLISHABLE";
  return "NOINDEX";
}

export function intentTypeOf(page: PageRecord): string {
  if (page.family === "error-code") return "error-code";
  if (page.family === "symptom") return "symptom";
  if (page.family.includes("hub")) return "hub";
  if (page.family.includes("oil")) return "oil";
  if (page.family === "maintenance-schedule") return "service";
  if (page.family === "battery") return "battery";
  if (page.family === "tyre-pressure") return "tyres";
  if (page.family === "common-problems" || page.family === "recalls") return "known-issues";
  if (page.family === "can-charger-charge") return "compatibility";
  if (page.family === "device-wattage" || page.family === "device-hub") return "device";
  if (page.family === "wear-month" || page.family === "packing-month") return "wear-period";
  if (page.family.startsWith("route") || page.family === "travel-calculator") return "corridor";
  return page.family;
}

export function entityTypeOf(page: PageRecord): string {
  if (page.site === "fixcode") return page.family === "symptom" ? "symptom" : "error_code";
  if (page.site === "autospec") return "vehicle_identity";
  if (page.site === "wearthere") return "destination";
  if (page.site === "chargematch") return page.family === "can-charger-charge" ? "device_charger_pair" : "device";
  return "corridor";
}

function candidateReasons(page: PageRecord, duplicateOf?: string): string[] {
  const reasons: string[] = [];
  if (duplicateOf) {
    reasons.push(`duplicate decision fingerprint — consolidated toward ${duplicateOf}`);
    return reasons;
  }
  if (page.index_state === "SEO_CANDIDATE") {
    reasons.push("hard gates / unique decision passed; demand evidence is still editorial so INDEXABLE stays closed");
  }
  if (page.index_state === "INDEXABLE") reasons.push("demand path validated and hard gates passed");
  const distinct = String(page.structured_payload.distinct_reason ?? "");
  if (distinct) reasons.push(`distinct graph key: ${distinct}`);
  if (page.structured_payload.match) reasons.push(`unique compatibility result: ${String(page.structured_payload.match)}`);
  if (page.structured_payload.bottleneck) {
    reasons.push(`limiting component: ${String(page.structured_payload.bottleneck)}`);
  }
  if (page.structured_payload.max_power != null) {
    reasons.push(`expected wattage ${String(page.structured_payload.max_power)}`);
  }
  if (page.structured_payload.evidence) reasons.push(`evidence ${String(page.structured_payload.evidence)}`);
  if (hardBlockers(page).length === 0) reasons.push("no failed hard gate");
  return reasons.slice(0, 6);
}

export function assignDistribution(store: GraphStore): { duplicateClustersRemoved: number } {
  const pages = [...store.pages.values()];
  const byFingerprint = new Map<string, PageRecord[]>();
  for (const page of pages) {
    const fingerprint = page.decision_fingerprint ?? fingerprintFromPage(page);
    page.decision_fingerprint = fingerprint;
    page.structured_payload = {
      ...page.structured_payload,
      decision_fingerprint: fingerprint,
    };
    const list = byFingerprint.get(`${page.site}:${fingerprint}`) ?? [];
    list.push(page);
    byFingerprint.set(`${page.site}:${fingerprint}`, list);
  }

  let duplicateClustersRemoved = 0;
  for (const group of byFingerprint.values()) {
    if (group.length < 2) {
      for (const page of group) {
        page.catalog_publish_state = catalogPublishState({ ...page, catalog_publish_state: undefined });
        page.lifecycle_state = page.lifecycle_state ?? "new";
        page.structured_payload = {
          ...page.structured_payload,
          catalog_publish_state: page.catalog_publish_state,
          source_coverage: sourceCoverageOf(page),
        };
      }
      continue;
    }
    const ranked = [...group].sort((a, b) => {
      const qa = a.quality_score + sourceCoverageOf(a) * 10 + a.search_demand / 100;
      const qb = b.quality_score + sourceCoverageOf(b) * 10 + b.search_demand / 100;
      return qb - qa;
    });
    const winner = ranked[0];
    let removed = 0;
    for (const page of ranked) {
      const base = catalogPublishState({ ...page, catalog_publish_state: undefined });
      if (page === winner) {
        page.catalog_publish_state = base;
        page.lifecycle_state = page.lifecycle_state ?? "new";
      } else if (base === "PUBLISHABLE") {
        page.catalog_publish_state = "NOINDEX";
        page.lifecycle_state = "candidate-consolidation";
        page.structured_payload = {
          ...page.structured_payload,
          duplicate_of: winner.url,
          quality_why: `${page.structured_payload.quality_why ?? ""} Duplicate decision fingerprint of ${winner.url}.`.trim(),
        };
        removed += 1;
      } else {
        page.catalog_publish_state = base;
        page.lifecycle_state = page.lifecycle_state ?? "new";
      }
      page.structured_payload = {
        ...page.structured_payload,
        catalog_publish_state: page.catalog_publish_state,
        source_coverage: sourceCoverageOf(page),
      };
    }
    if (removed) duplicateClustersRemoved += 1;
  }

  for (const site of CATALOG_SITES) {
    const publishable = pages
      .filter((page) => page.site === site && page.catalog_publish_state === "PUBLISHABLE")
      .sort((a, b) => priorityScore(b) - priorityScore(a));
    const n = publishable.length;
    const tierA = Math.max(0, Math.ceil(n * 0.22));
    const tierB = Math.max(0, Math.ceil(n * 0.38));
    publishable.forEach((page, i) => {
      const tier: CatalogTier = i < tierA ? "A" : i < tierA + tierB ? "B" : "C";
      page.catalog_tier = tier;
      page.structured_payload = { ...page.structured_payload, catalog_tier: tier, priority_score: priorityScore(page) };
    });
    for (const page of pages.filter((p) => p.site === site && p.catalog_publish_state !== "PUBLISHABLE")) {
      page.catalog_tier = null;
      page.structured_payload = { ...page.structured_payload, catalog_tier: null };
    }
  }
  return { duplicateClustersRemoved };
}

export function toReleaseCandidate(page: PageRecord): ReleaseCandidate {
  const coverage = sourceCoverageOf(page);
  const qaRaw = page.structured_payload.qa_status;
  const qaStatus: QaReviewStatus | undefined =
    qaRaw === "NOT_REVIEWED" || qaRaw === "AUTO_VERIFIED" || qaRaw === "MANUAL_PASS" || qaRaw === "MANUAL_FAIL"
      ? qaRaw
      : undefined;
  return {
    url: page.url,
    product: page.site,
    intent: intentTypeOf(page),
    quality: page.quality_score,
    publishState: catalogPublishState(page),
    catalogTier: page.catalog_tier ?? null,
    decisionFingerprint: page.decision_fingerprint ?? fingerprintFromPage(page),
    sourceCoverage: coverage,
    realSourceCoverage: coverage,
    decisionFacts: storedCount(page, "decision_facts_count"),
    sourcedDecisionFacts: storedCount(page, "sourced_decision_facts"),
    indexState: page.index_state,
    family: page.family,
    qualityBand: scaleQualityBand(page.quality_score),
    lifecycle: page.lifecycle_state ?? "new",
    lastmod: page.freshness,
    reasons: candidateReasons(page, typeof page.structured_payload.duplicate_of === "string" ? page.structured_payload.duplicate_of : undefined),
    qaStatus,
    autoQa: Array.isArray(page.structured_payload.auto_qa) ? page.structured_payload.auto_qa.map(String) : undefined,
  };
}

export function releaseCandidates(store: GraphStore): ReleaseCandidate[] {
  return [...store.pages.values()]
    .filter((page) => catalogPublishState(page) === "PUBLISHABLE")
    .map(toReleaseCandidate)
    .sort((a, b) => b.quality - a.quality || a.url.localeCompare(b.url));
}

export function allCatalogRows(store: GraphStore): ReleaseCandidate[] {
  return [...store.pages.values()].map(toReleaseCandidate).sort((a, b) => a.url.localeCompare(b.url));
}

function emptyBands(): Record<ScaleQualityBand, number> {
  return { "<60": 0, "60-69": 0, "70-79": 0, "80-89": 0, "90+": 0 };
}

export function scaleReport(store: GraphStore, duplicateClustersRemoved = 0): ScaleReport {
  const pages = [...store.pages.values()];
  const byProduct = Object.fromEntries(
    CATALOG_SITES.map((site) => {
      const subset = pages.filter((page) => page.site === site);
      const publishable = subset.filter((page) => catalogPublishState(page) === "PUBLISHABLE");
      return [
        site,
        {
          product: site,
          entities: [...store.entities.values()].filter((e) => e.site === site).length,
          relations: [...store.relations.values()].filter((r) => r.site === site).length,
          generated: subset.length,
          candidateUrls: subset.filter((page) => page.index_state === "SEO_CANDIDATE" || page.index_state === "INDEXABLE").length,
          publishable: publishable.length,
          limited: subset.filter((page) => catalogPublishState(page) === "LIMITED").length,
          noindex: subset.filter((page) => catalogPublishState(page) === "NOINDEX").length,
          blocked: subset.filter((page) => catalogPublishState(page) === "BLOCKED").length,
          tierA: publishable.filter((page) => page.catalog_tier === "A").length,
          tierB: publishable.filter((page) => page.catalog_tier === "B").length,
          tierC: publishable.filter((page) => page.catalog_tier === "C").length,
          duplicateClustersRemoved: [...new Set(
            subset
              .filter((page) => page.structured_payload.duplicate_of)
              .map((page) => page.decision_fingerprint ?? ""),
          )].filter(Boolean).length,
          qualityBands: scaleQualityDistribution(subset),
          realSourceCoverage:
            subset.length === 0
              ? 0
              : Math.round(
                  (subset.reduce((sum, page) => sum + sourceCoverageOf(page), 0) / subset.length) * 1000,
                ) / 1000,
          sources: [...new Set(
            [...store.entities.values()]
              .filter((e) => e.site === site)
              .flatMap((e) => e.provenance.map((p) => p.source_id)),
          )].length,
        } satisfies ProductScaleRow,
      ];
    }),
  ) as Record<SiteId, ProductScaleRow>;
  return {
    generated: pages.length,
    publishable: pages.filter((page) => catalogPublishState(page) === "PUBLISHABLE").length,
    limited: pages.filter((page) => catalogPublishState(page) === "LIMITED").length,
    noindex: pages.filter((page) => catalogPublishState(page) === "NOINDEX").length,
    blocked: pages.filter((page) => catalogPublishState(page) === "BLOCKED").length,
    duplicateClustersRemoved:
      duplicateClustersRemoved ||
      Object.values(byProduct).reduce((sum, row) => sum + row.duplicateClustersRemoved, 0),
    qualityBands: pages.length ? scaleQualityDistribution(pages) : emptyBands(),
    byProduct,
  };
}

export function monitorCohorts(store: GraphStore): MonitorCohort[] {
  const map = new Map<string, MonitorCohort>();
  for (const page of store.pages.values()) {
    const key = [
      page.site,
      page.catalog_tier ?? "none",
      intentTypeOf(page),
      scaleQualityBand(page.quality_score),
      entityTypeOf(page),
    ].join("|");
    const row =
      map.get(key) ??
      {
        product: page.site,
        tier: (page.catalog_tier ?? "none") as CatalogTier | "none",
        intentType: intentTypeOf(page),
        qualityBand: scaleQualityBand(page.quality_score),
        entityType: entityTypeOf(page),
        urls: 0,
        publishable: 0,
      };
    row.urls += 1;
    if (catalogPublishState(page) === "PUBLISHABLE") row.publishable += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.publishable - a.publishable || b.urls - a.urls);
}

function take(rows: ReleaseCandidate[], n: number, pred: (row: ReleaseCandidate) => boolean): ReleaseCandidate[] {
  return rows.filter(pred).slice(0, n);
}

/** 10 Tier A + 8 B + 4 C + 3 rejected/limited per product. Auto-generation never claims MANUAL_*. */
export function qaReviewQueue(store: GraphStore): ReleaseCandidate[] {
  const picked: ReleaseCandidate[] = [];
  for (const site of CATALOG_SITES) {
    const rows = [...store.pages.values()]
      .filter((page) => page.site === site)
      .map(toReleaseCandidate)
      .sort((a, b) => {
        const tierRank = (tier: CatalogTier | null) => (tier === "A" ? 0 : tier === "B" ? 1 : tier === "C" ? 2 : 3);
        return tierRank(a.catalogTier) - tierRank(b.catalogTier) || b.quality - a.quality;
      });
    const sitePick = [
      ...take(rows, 10, (row) => row.catalogTier === "A" && row.publishState === "PUBLISHABLE"),
      ...take(rows, 8, (row) => row.catalogTier === "B" && row.publishState === "PUBLISHABLE"),
      ...take(rows, 4, (row) => row.catalogTier === "C" && row.publishState === "PUBLISHABLE"),
      ...take(rows, 3, (row) => row.publishState === "LIMITED" || row.publishState === "NOINDEX" || row.publishState === "BLOCKED"),
    ];
    const seen = new Set<string>();
    for (const row of sitePick) {
      if (seen.has(row.url)) continue;
      seen.add(row.url);
      picked.push({ ...row, qaStatus: row.qaStatus ?? "NOT_REVIEWED" });
    }
  }
  return picked;
}

export function qaSample(store: GraphStore, perProduct = 25): ReleaseCandidate[] {
  if (perProduct === 25) return qaReviewQueue(store);
  const picked: ReleaseCandidate[] = [];
  for (const site of CATALOG_SITES) {
    const rows = [...store.pages.values()]
      .filter((page) => page.site === site)
      .map(toReleaseCandidate)
      .sort((a, b) => {
        const tierRank = (tier: CatalogTier | null) => (tier === "A" ? 0 : tier === "B" ? 1 : tier === "C" ? 2 : 3);
        return tierRank(a.catalogTier) - tierRank(b.catalogTier) || b.quality - a.quality;
      });
    picked.push(...rows.slice(0, perProduct).map((row) => ({ ...row, qaStatus: row.qaStatus ?? "NOT_REVIEWED" as QaReviewStatus })));
  }
  return picked;
}

export function joinReleaseManifestToGsc(store: GraphStore, gsc: GscPerformanceRow[] = []) {
  return joinGscToReleaseManifest(allCatalogRows(store), gsc);
}

const AUTO_QA_KEYS = [
  "canonical_or_redirect",
  "robots_matches_index_state",
  "decision_surface",
  "internal_link",
  "fingerprint",
  "evidence_or_modelled",
] as const;

export function autoQaChecks(page: PageRecord): string[] {
  const checks: string[] = [];
  const redirect = page.index_state === "REDIRECT" || Boolean(page.structured_payload.redirect_to);
  if (redirect || (page.canonical === page.url && Boolean(page.canonical))) checks.push("canonical_or_redirect");
  if (page.noindex === (page.index_state !== "INDEXABLE")) checks.push("robots_matches_index_state");
  const payload = page.structured_payload;
  if (
    payload.action_evidence ||
    payload.match != null ||
    payload.meaning ||
    payload.modes ||
    payload.layers ||
    payload.spec ||
    payload.codes
  ) {
    checks.push("decision_surface");
  }
  if (payload.has_internal_link || page.family.includes("hub") || page.entity_ids.length > 1) {
    checks.push("internal_link");
  }
  if (page.decision_fingerprint) checks.push("fingerprint");
  if (
    payload.source_coverage != null ||
    payload.assumptions_declared === true ||
    payload.cost_class === "MODELLED" ||
    Array.isArray(payload.decision_facts)
  ) {
    checks.push("evidence_or_modelled");
  }
  return checks;
}

/** Structural AUTO_VERIFIED only. Never writes MANUAL_PASS / MANUAL_FAIL. */
export function applyAutoQaSample(store: GraphStore): ReleaseCandidate[] {
  const queue = qaReviewQueue(store);
  const byUrl = new Map([...store.pages.values()].map((page) => [page.url, page]));
  return queue.map((row) => {
    const page = byUrl.get(row.url);
    if (!page) return { ...row, qaStatus: "NOT_REVIEWED" as const };
    const checks = autoQaChecks(page);
    const qaStatus: QaReviewStatus = checks.length >= 4 ? "AUTO_VERIFIED" : "NOT_REVIEWED";
    page.structured_payload = { ...page.structured_payload, qa_status: qaStatus, auto_qa: checks };
    return { ...row, qaStatus, autoQa: checks };
  });
}

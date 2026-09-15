import {
  DEMAND_TTL_DAYS,
  GOOGLE_SURFACE_SOURCES,
  POSTLAUNCH_SOURCES,
  QUANTITATIVE_SOURCES,
  SERP_TTL_DAYS,
  type DemandAssessmentV2,
  type DemandClass,
  type DemandEvidence,
  type DemandPhase,
  type SeoEligibility,
  type SerpObservation,
  type SerpOpportunity,
} from "./types";

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}(T|$)/.test(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

export function isDemandFresh(evidence: DemandEvidence, now = new Date()): boolean {
  if (!isValidIsoDate(evidence.observedAt)) return false;
  const ttl = DEMAND_TTL_DAYS[evidence.source];
  const age = (now.getTime() - new Date(evidence.observedAt).getTime()) / 86400000;
  return age >= 0 && age <= ttl;
}

export function languageOf(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() || "en";
}

export function countryOf(locale: string): string | undefined {
  const part = locale.split("-")[1];
  return part ? part.toUpperCase() : undefined;
}

export function localeAgnostic(pageLocale: string): boolean {
  return !countryOf(pageLocale);
}

export function localeCompatible(
  evidenceLocale: string,
  pageLocale = "en",
  evidenceLanguage?: string,
  evidenceCountry?: string,
  agnostic = false,
): boolean {
  if (agnostic || localeAgnostic(pageLocale)) {
    const evLang = (evidenceLanguage ?? languageOf(evidenceLocale)).toLowerCase();
    return evLang === languageOf(pageLocale);
  }
  const evLang = (evidenceLanguage ?? languageOf(evidenceLocale)).toLowerCase();
  const evCountry = (evidenceCountry ?? countryOf(evidenceLocale))?.toUpperCase();
  const pageCountry = countryOf(pageLocale);
  if (evLang !== languageOf(pageLocale)) return false;
  if (pageCountry && evCountry && evCountry !== pageCountry) return false;
  if (pageCountry && !evCountry) return false;
  return true;
}

export function localeMismatch(evidence: DemandEvidence, pageLocale = "en"): boolean {
  return !localeCompatible(evidence.locale, pageLocale, evidence.language, evidence.country);
}

export function isSerpFresh(obs: SerpObservation, now = new Date()): boolean {
  if (!isValidIsoDate(obs.observedAt)) return false;
  const age = (now.getTime() - new Date(obs.observedAt).getTime()) / 86400000;
  return age >= 0 && age <= SERP_TTL_DAYS;
}

export function serpLocaleMismatch(obs: SerpObservation, pageLocale = "en"): boolean {
  return !localeCompatible(obs.locale, pageLocale);
}

export function independentSourceCount(evidence: DemandEvidence[]): number {
  const buckets = new Set<string>();
  for (const row of evidence) {
    if (row.source === "EDITORIAL") continue;
    if (GOOGLE_SURFACE_SOURCES.has(row.source)) buckets.add("google-surface");
    else buckets.add(row.source);
  }
  return buckets.size;
}

function strongestSerp(observations: SerpObservation[]): SerpObservation | undefined {
  if (!observations.length) return undefined;
  return [...observations].sort((a, b) => b.exactIntentResults - a.exactIntentResults)[0];
}

function serpOpportunityFrom(obs: SerpObservation | undefined): SerpOpportunity {
  if (!obs) return "UNKNOWN";
  if (obs.classification === "STRONG_INTENT") {
    const forums = obs.composition?.forums ?? 0;
    const official = obs.composition?.official ?? 0;
    const ecommerce = obs.composition?.ecommerce ?? 0;
    if (forums + ecommerce >= 5 && official <= 1) return "HIGH";
    if (official >= 4) return "LOW";
    return "MEDIUM";
  }
  if (obs.classification === "MIXED_INTENT") return "MEDIUM";
  if (obs.classification === "WEAK_INTENT") return "LOW";
  return "UNKNOWN";
}

export function preLaunchDemandScore(input: {
  evidence: DemandEvidence[];
  serp: SerpObservation[];
}): { score: number; flags: Record<string, boolean>; exactIntentResultsTop10: number } {
  const live = input.evidence.filter((e) => e.observed && !e.expired);
  let score = 0;
  const serp = strongestSerp(input.serp);
  const exact = serp?.exactIntentResultsTop10 ?? serp?.exactIntentResults ?? 0;
  const intentStrong = Boolean(serp && serp.classification === "STRONG_INTENT" && exact >= 3);
  if (intentStrong) score += 25;
  if (live.some((e) => e.source === "AUTOCOMPLETE")) score += 20;
  if (live.some((e) => e.source === "RELATED_SEARCH")) score += 10;
  if (live.some((e) => e.source === "PAA") || serp?.hasPaa) score += 10;
  if (live.some((e) => e.source === "GOOGLE_TRENDS" && e.value != null && e.value > 0 && e.unit === "RELATIVE_INDEX")) {
    score += 10;
  }
  if (live.some((e) => e.source === "KEYWORD_PLANNER" && e.value != null && e.value > 0)) score += 25;
  if (live.some((e) => e.source === "KEYWORD_PROVIDER" && e.value != null && e.value > 0)) score += 25;
  const googleSignals = [
    intentStrong,
    live.some((e) => e.source === "AUTOCOMPLETE"),
    live.some((e) => e.source === "RELATED_SEARCH"),
    live.some((e) => e.source === "PAA") || Boolean(serp?.hasPaa),
    live.some((e) => e.source === "GOOGLE_TRENDS"),
  ].filter(Boolean).length;
  if (googleSignals >= 3) score = Math.min(score, score - 10);
  score = Math.max(0, Math.min(70, score));
  return {
    score,
    exactIntentResultsTop10: exact,
    flags: {
      serpObserved: input.serp.some((s) => s.resultsObserved > 0) || live.some((e) => e.source === "SERP"),
      intentMatchObserved: intentStrong,
      autocompleteObserved: live.some((e) => e.source === "AUTOCOMPLETE"),
      trendsObserved: live.some((e) => e.source === "GOOGLE_TRENDS" && e.observed),
      quantitativeVolumeObserved: live.some(
        (e) => QUANTITATIVE_SOURCES.has(e.source) && e.value != null && e.value > 0,
      ),
      relatedOrPaa:
        live.some((e) => e.source === "RELATED_SEARCH" || e.source === "PAA") || Boolean(serp?.hasPaa),
    },
  };
}

export function postLaunchDemandScore(evidence: DemandEvidence[]): number {
  const live = evidence.filter((e) => e.observed && !e.expired && POSTLAUNCH_SOURCES.has(e.source));
  if (!live.length) return 0;
  let score = 0;
  if (live.some((e) => e.source === "GSC" && (e.value ?? 0) > 0)) score += 40;
  if (live.some((e) => e.source === "INTERNAL_SEARCH")) score += 25;
  if (live.some((e) => e.source === "PRODUCT_USAGE")) score += 20;
  return Math.min(70, score);
}

export function assessDemand(input: {
  pageId: string;
  queryCluster: string[];
  evidence: DemandEvidence[];
  serpObservations?: SerpObservation[];
  pageLocale?: string;
  phase?: DemandPhase;
  now?: Date;
}): DemandAssessmentV2 {
  const now = input.now ?? new Date();
  const locale = input.pageLocale ?? "en";
  const expiredEvidenceIds: string[] = [];
  const localeMismatches: string[] = [];
  const warnings: string[] = [];
  const annotated = input.evidence.map((row) => {
    const expired = !isDemandFresh(row, now);
    if (expired) expiredEvidenceIds.push(row.id);
    if (localeMismatch(row, locale)) {
      localeMismatches.push(row.id);
      warnings.push(`locale mismatch ${row.locale} vs page ${locale}`);
    }
    if (row.source === "GOOGLE_TRENDS" && row.unit && row.unit !== "RELATIVE_INDEX") {
      warnings.push("GOOGLE_TRENDS must use RELATIVE_INDEX — not converted to monthly volume");
    }
    if (row.value == null && QUANTITATIVE_SOURCES.has(row.source)) {
      warnings.push(`${row.source} has no observed volume (null)`);
    }
    return { ...row, expired };
  });
  const usable = annotated.filter((e) => !e.expired && !localeMismatch(e, locale) && e.source !== "EDITORIAL");
  const serp = (input.serpObservations ?? []).filter((s) => {
    const fresh = isSerpFresh(s, now);
    const localeOk = !serpLocaleMismatch(s, locale);
    if (!fresh) expiredEvidenceIds.push(`serp:${s.query}:${s.observedAt}`);
    if (!localeOk) localeMismatches.push(`serp:${s.query}:${s.locale}`);
    return fresh && localeOk;
  });
  const pre = preLaunchDemandScore({ evidence: usable, serp });
  const post = postLaunchDemandScore(usable);
  const pathA = pre.flags.intentMatchObserved && pre.flags.autocompleteObserved;
  const pathB = pre.flags.intentMatchObserved && pre.flags.quantitativeVolumeObserved;
  const pathC = pre.flags.quantitativeVolumeObserved && (pre.flags.relatedOrPaa || pre.flags.autocompleteObserved);
  const pathD = usable.some((e) => POSTLAUNCH_SOURCES.has(e.source) && e.observed);
  const prelaunchPass = pathA || pathB || pathC;
  const editorialOnly = annotated.every((e) => e.source === "EDITORIAL") || annotated.length === 0;
  if (editorialOnly) warnings.push("editorial-only demand cannot validate SEO");
  if (pre.flags.serpObserved && !pre.flags.intentMatchObserved) {
    warnings.push("SERP existence without intent match is not sufficient");
  }

  let seoEligibility: SeoEligibility = "NONE";
  if (pathD && post >= 25) seoEligibility = "POSTLAUNCH_VALIDATED";
  else if (prelaunchPass) seoEligibility = "PRELAUNCH_VALIDATED";
  else if (usable.length > 0 || serp.length > 0) seoEligibility = "DISCOVERED";

  const independent = independentSourceCount(usable);
  let demandClass: DemandClass = "UNKNOWN";
  if (prelaunchPass && pre.score >= 55 && independent >= 2) demandClass = "VERY_HIGH";
  else if (prelaunchPass || pathD) demandClass = pre.score >= 40 || post >= 40 ? "HIGH" : "MEDIUM";
  else if (pre.score >= 25) demandClass = "MEDIUM";
  else if (pre.score > 0 || usable.length) demandClass = "LOW";

  const phase: DemandPhase = pathD && !prelaunchPass ? "POST_LAUNCH" : "PRE_LAUNCH";
  const top = strongestSerp(serp);

  return {
    pageId: input.pageId,
    queryCluster: input.queryCluster,
    evidence: annotated,
    serpObservations: serp,
    preLaunchScore: pre.score,
    postLaunchScore: post || undefined,
    externalEvidenceCount: usable.length,
    independentSourceCount: independent,
    serpObserved: pre.flags.serpObserved,
    intentMatchObserved: pre.flags.intentMatchObserved,
    autocompleteObserved: pre.flags.autocompleteObserved,
    trendsObserved: pre.flags.trendsObserved,
    quantitativeVolumeObserved: pre.flags.quantitativeVolumeObserved,
    exactIntentResultsTop10: pre.exactIntentResultsTop10,
    serpComposition: top?.composition,
    serpOpportunity: serpOpportunityFrom(top),
    phase: input.phase ?? phase,
    class: demandClass,
    seoEligibility,
    pathA,
    pathB,
    pathC,
    pathD,
    expiredEvidenceIds,
    localeMismatches,
    warnings,
  };
}

export function demandSatisfiesIndex(assessment: DemandAssessmentV2): {
  pass: boolean;
  seoValidation: "NONE" | "PRELAUNCH" | "POSTLAUNCH";
  reason: string;
} {
  if (assessment.seoEligibility === "POSTLAUNCH_VALIDATED") {
    return { pass: true, seoValidation: "POSTLAUNCH", reason: "Path D post-launch evidence" };
  }
  if (assessment.seoEligibility === "PRELAUNCH_VALIDATED") {
    return { pass: true, seoValidation: "PRELAUNCH", reason: "Pre-launch path A/B/C" };
  }
  if (assessment.serpObserved && !assessment.intentMatchObserved) {
    return { pass: false, seoValidation: "NONE", reason: "SERP existence alone cannot index" };
  }
  if (assessment.autocompleteObserved && !assessment.pathA && !assessment.pathC) {
    return { pass: false, seoValidation: "NONE", reason: "autocomplete alone cannot index" };
  }
  if (assessment.trendsObserved && !assessment.pathA && !assessment.pathB && !assessment.pathC) {
    return { pass: false, seoValidation: "NONE", reason: "Trends alone cannot index" };
  }
  return { pass: false, seoValidation: "NONE", reason: "no qualifying demand path" };
}

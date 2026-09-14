import {
  COLLECTION_METHODS,
  DEMAND_EVIDENCE_SOURCES,
  SERP_CLASSIFICATIONS,
  type CollectionMethod,
  type DemandEvidence,
  type DemandEvidenceSource,
  type SerpObservation,
} from "./types";
import { isValidIsoDate } from "./score";

function isSource(value: string): value is DemandEvidenceSource {
  return (DEMAND_EVIDENCE_SOURCES as readonly string[]).includes(value);
}

function isMethod(value: string): value is CollectionMethod {
  return (COLLECTION_METHODS as readonly string[]).includes(value);
}

export function validateEvidence(row: Partial<DemandEvidence>, file = "memory"): DemandEvidence {
  if (!row.id) throw new Error(`${file}: missing id`);
  if (!row.source || !isSource(row.source)) throw new Error(`${file}: unknown source ${row.source}`);
  if (!row.query || !String(row.query).trim()) throw new Error(`${file}: missing query`);
  if (!row.locale) throw new Error(`${file}: missing locale`);
  if (!row.observedAt || !isValidIsoDate(row.observedAt)) throw new Error(`${file}: invalid observedAt`);
  if (typeof row.observed !== "boolean") throw new Error(`${file}: observed must be boolean`);
  if (row.value != null && (typeof row.value !== "number" || row.value < 0)) {
    throw new Error(`${file}: value must be null or a non-negative number — invented volumes are forbidden`);
  }
  if (row.confidence == null || row.confidence < 0 || row.confidence > 1) {
    throw new Error(`${file}: confidence must be 0–1`);
  }
  if (!row.collectionMethod || !isMethod(row.collectionMethod)) {
    throw new Error(`${file}: unknown collectionMethod`);
  }
  if (row.source === "GOOGLE_TRENDS" && row.value != null && row.unit !== "RELATIVE_INDEX") {
    throw new Error(`${file}: GOOGLE_TRENDS value requires unit RELATIVE_INDEX`);
  }
  return {
    id: row.id,
    source: row.source,
    query: String(row.query).trim(),
    locale: row.locale,
    country: row.country,
    language: row.language,
    observedAt: row.observedAt,
    observed: row.observed,
    value: row.value ?? null,
    unit: row.unit ?? null,
    url: row.url ?? null,
    rawLabel: row.rawLabel ?? null,
    confidence: row.confidence,
    notes: row.notes,
    collectionMethod: row.collectionMethod,
    pageId: row.pageId,
  };
}

export function validateSerp(row: Partial<SerpObservation>, file = "memory"): SerpObservation {
  if (!row.query) throw new Error(`${file}: SERP missing query`);
  if (!row.locale) throw new Error(`${file}: SERP missing locale`);
  if (!row.observedAt || !isValidIsoDate(row.observedAt)) throw new Error(`${file}: SERP invalid observedAt`);
  if (typeof row.resultsObserved !== "number" || row.resultsObserved < 0) {
    throw new Error(`${file}: resultsObserved must be >= 0`);
  }
  if (typeof row.exactIntentResults !== "number" || row.exactIntentResults < 0) {
    throw new Error(`${file}: exactIntentResults must be >= 0`);
  }
  if (!row.classification || !(SERP_CLASSIFICATIONS as readonly string[]).includes(row.classification)) {
    throw new Error(`${file}: invalid SERP classification`);
  }
  return row as SerpObservation;
}

export function evidenceByPage(rows: DemandEvidence[]): Map<string, DemandEvidence[]> {
  const map = new Map<string, DemandEvidence[]>();
  for (const row of rows) {
    const key = row.pageId ?? "";
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return map;
}

export function serpByPage(rows: SerpObservation[]): Map<string, SerpObservation[]> {
  const map = new Map<string, SerpObservation[]>();
  for (const row of rows) {
    const key = row.pageId ?? "";
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return map;
}

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
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

export type ImportResult = {
  evidence: DemandEvidence[];
  serp: SerpObservation[];
  rejected: Array<{ file: string; reason: string }>;
};

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

function parseCsv(text: string, file: string): DemandEvidence[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const required = ["page_id", "query", "country", "source", "observed", "observed_at"];
  for (const col of required) {
    if (!header.includes(col)) throw new Error(`${file}: CSV missing column ${col}`);
  }
  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const rec: Record<string, string> = {};
    header.forEach((h, idx) => {
      rec[h] = cols[idx] ?? "";
    });
    const observed = rec.observed === "true" || rec.observed === "1";
    const valueRaw = rec.value;
    const value = valueRaw === "" || valueRaw === "null" || valueRaw == null ? null : Number(valueRaw);
    return validateEvidence(
      {
        id: rec.id || `${file}:${i}`,
        source: rec.source as DemandEvidenceSource,
        query: rec.query,
        locale: rec.locale || rec.country || "en",
        country: rec.country,
        language: rec.language,
        observedAt: rec.observed_at,
        observed,
        value,
        unit: rec.unit || null,
        url: rec.url || null,
        rawLabel: rec.raw_label || null,
        confidence: rec.confidence ? Number(rec.confidence) : 0.6,
        notes: rec.notes,
        collectionMethod: (rec.collection_method as CollectionMethod) || "IMPORT",
        pageId: rec.page_id,
      },
      `${file}:${i + 2}`,
    );
  });
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!statSync(dir).isDirectory()) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith(".json") || name.endsWith(".csv")) acc.push(full);
  }
  return acc;
}

export function importDemandDir(root: string): ImportResult {
  const result: ImportResult = { evidence: [], serp: [], rejected: [] };
  let files: string[] = [];
  try {
    files = walk(root);
  } catch {
    return result;
  }
  for (const file of files) {
    try {
      const text = readFileSync(file, "utf8");
      if (file.endsWith(".csv")) {
        result.evidence.push(...parseCsv(text, file));
        continue;
      }
      const parsed = JSON.parse(text) as
        | DemandEvidence
        | DemandEvidence[]
        | { evidence?: DemandEvidence[]; serp?: SerpObservation[] };
      const evidence = Array.isArray(parsed)
        ? parsed
        : "source" in parsed
          ? [parsed as DemandEvidence]
          : parsed.evidence ?? [];
      const serp = !Array.isArray(parsed) && "serp" in parsed ? parsed.serp ?? [] : [];
      for (const row of evidence) result.evidence.push(validateEvidence(row, file));
      for (const row of serp) result.serp.push(validateSerp(row, file));
    } catch (error) {
      result.rejected.push({ file, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  return result;
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

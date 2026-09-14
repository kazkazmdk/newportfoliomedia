import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { type CollectionMethod, type DemandEvidence, type DemandEvidenceSource, type SerpObservation } from "./types";
import { evidenceByPage, serpByPage, validateEvidence, validateSerp } from "./validate";

export type ImportResult = {
  evidence: DemandEvidence[];
  serp: SerpObservation[];
  rejected: Array<{ file: string; reason: string }>;
};

export { evidenceByPage, serpByPage, validateEvidence, validateSerp };

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
  const resolvedRoot = resolve(root);
  for (const file of files) {
    try {
      if (!resolve(file).startsWith(resolvedRoot)) {
        result.rejected.push({ file, reason: "path traversal rejected" });
        continue;
      }
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

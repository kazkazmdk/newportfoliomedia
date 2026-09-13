export const SOURCE_TYPES = [
  "OFFICIAL",
  "MANUFACTURER",
  "REGULATORY",
  "TESTED",
  "TRUSTED_THIRD_PARTY",
  "THIRD_PARTY",
  "USER_OBSERVED",
  "USER_REPORTED",
  "AI_INFERRED",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const CONFIDENCE_LEVELS = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const VERIFICATION_METHODS = [
  "MANUAL_REVIEW",
  "MANUFACTURER_DOC",
  "REGULATORY_LIST",
  "LAB_TEST",
  "CROSS_SOURCE",
  "USER_OUTCOME",
  "HEURISTIC",
  "UNVERIFIED",
] as const;

export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export type ProvenanceRecord = {
  source_id: string;
  source_type: SourceType;
  source_name?: string;
  source_url?: string;
  retrieved_at: string;
  verified_at?: string;
  valid_from?: string;
  valid_until?: string | null;
  confidence: number;
  confidence_level: ConfidenceLevel;
  raw_value: string;
  normalized_value: string;
  verification_method: VerificationMethod;
  notes?: string;
};

export type DataConflict = {
  id: string;
  field: string;
  entity_id: string;
  a: ProvenanceRecord;
  b: ProvenanceRecord;
  resolution: "UNRESOLVED" | "OFFICIAL_WINS" | "TESTED_WINS" | "ADMIN_REVIEW";
};

const SOURCE_RANK: Record<SourceType, number> = {
  OFFICIAL: 100,
  MANUFACTURER: 90,
  REGULATORY: 88,
  TESTED: 80,
  TRUSTED_THIRD_PARTY: 55,
  THIRD_PARTY: 50,
  USER_OBSERVED: 32,
  USER_REPORTED: 30,
  AI_INFERRED: 10,
};

export function sourceRank(type: SourceType): number {
  return SOURCE_RANK[type];
}

export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 80) return "HIGH";
  if (score >= 55) return "MEDIUM";
  if (score >= 25) return "LOW";
  return "UNKNOWN";
}

export function assertInferenceCannotBecomeOfficial(
  from: SourceType,
  to: SourceType,
): void {
  if (from === "AI_INFERRED" && (to === "OFFICIAL" || to === "MANUFACTURER")) {
    throw new Error(
      "AI_INFERRED data cannot be promoted to OFFICIAL or MANUFACTURER.",
    );
  }
}

export function pickPreferredRecord(
  records: ProvenanceRecord[],
): ProvenanceRecord | undefined {
  if (records.length === 0) return undefined;
  return [...records].sort((a, b) => {
    const rankDelta = sourceRank(b.source_type) - sourceRank(a.source_type);
    if (rankDelta !== 0) return rankDelta;
    return b.confidence - a.confidence;
  })[0];
}

export function detectConflicts(
  records: ProvenanceRecord[],
  field: string,
  entityId: string,
): DataConflict[] {
  const preferred = pickPreferredRecord(records);
  if (!preferred) return [];
  return records
    .filter(
      (record) =>
        record.normalized_value !== preferred.normalized_value &&
        Math.abs(sourceRank(record.source_type) - sourceRank(preferred.source_type)) <= 20,
    )
    .map((record, index) => ({
      id: `${entityId}:${field}:${index}`,
      field,
      entity_id: entityId,
      a: preferred,
      b: record,
      resolution: "UNRESOLVED" as const,
    }));
}

export function isFresh(record: ProvenanceRecord, now = new Date()): boolean {
  if (!record.valid_until) return true;
  return new Date(record.valid_until).getTime() >= now.getTime();
}

export function provenance(partial: Omit<ProvenanceRecord, "confidence_level"> & { confidence_level?: ConfidenceLevel }): ProvenanceRecord {
  return {
    ...partial,
    confidence_level:
      partial.confidence_level ?? confidenceLevelFromScore(partial.confidence),
  };
}

export const SOURCE_TYPES = [
  "OFFICIAL",
  "MANUFACTURER",
  "REGULATORY",
  "PRIMARY_DATABASE",
  "TESTED",
  "TESTED_INTERNAL",
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

export type ConfidenceEvidence = {
  kind:
    | "source_rank"
    | "cross_source_agreement"
    | "lab_measurement"
    | "manufacturer_doc"
    | "regulatory_list"
    | "user_outcome"
    | "heuristic"
    | "self_declared_ignored";
  detail: string;
  weight: number;
};

export type FactProvenance = {
  sourceType: SourceType;
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
  reviewedAt?: string;
  validFrom?: string;
  validUntil?: string | null;
  confidence: number;
  verificationMethod: VerificationMethod;
  rawValue: string;
  normalizedValue: string;
  confidenceEvidence: ConfidenceEvidence[];
};

export type ProvenanceRecord = {
  source_id: string;
  source_type: SourceType;
  source_name?: string;
  source_url?: string;
  retrieved_at: string;
  verified_at?: string;
  reviewed_at?: string;
  valid_from?: string;
  valid_until?: string | null;
  confidence: number;
  confidence_level: ConfidenceLevel;
  raw_value: string;
  normalized_value: string;
  verification_method: VerificationMethod;
  notes?: string;
  confidence_evidence?: ConfidenceEvidence[];
};

export type FactConflictCandidate = {
  value: string;
  provenance: ProvenanceRecord;
  sourceRank: number;
};

export type FactConflict = {
  field: string;
  candidates: FactConflictCandidate[];
  sourceRank: number[];
  unresolved: boolean;
  selectedValue?: string;
  resolutionReason?: string;
  critical: boolean;
};

export type DataConflict = {
  id: string;
  field: string;
  entity_id: string;
  a: ProvenanceRecord;
  b: ProvenanceRecord;
  resolution: "UNRESOLVED" | "OFFICIAL_WINS" | "TESTED_WINS" | "ADMIN_REVIEW";
  conflict?: FactConflict;
};

const SOURCE_RANK: Record<SourceType, number> = {
  OFFICIAL: 100,
  MANUFACTURER: 90,
  REGULATORY: 88,
  PRIMARY_DATABASE: 82,
  TESTED: 80,
  TESTED_INTERNAL: 78,
  TRUSTED_THIRD_PARTY: 55,
  THIRD_PARTY: 50,
  USER_OBSERVED: 32,
  USER_REPORTED: 30,
  AI_INFERRED: 10,
};

/** Product-specific source ranking. Higher is better. Never used as INDEX proof alone. */
export const PRODUCT_SOURCE_RANK: Record<
  "fixcode" | "autospec" | "wearthere" | "chargematch" | "tripcost",
  SourceType[]
> = {
  fixcode: ["MANUFACTURER", "OFFICIAL", "PRIMARY_DATABASE", "TRUSTED_THIRD_PARTY", "THIRD_PARTY", "USER_REPORTED", "AI_INFERRED"],
  autospec: ["MANUFACTURER", "REGULATORY", "OFFICIAL", "PRIMARY_DATABASE", "TESTED", "TRUSTED_THIRD_PARTY", "AI_INFERRED"],
  wearthere: ["OFFICIAL", "PRIMARY_DATABASE", "TRUSTED_THIRD_PARTY", "THIRD_PARTY", "AI_INFERRED"],
  chargematch: ["MANUFACTURER", "TESTED_INTERNAL", "TESTED", "PRIMARY_DATABASE", "TRUSTED_THIRD_PARTY", "THIRD_PARTY", "AI_INFERRED"],
  tripcost: ["OFFICIAL", "REGULATORY", "PRIMARY_DATABASE", "THIRD_PARTY", "AI_INFERRED"],
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

const FORBIDDEN_PROMOTIONS: Array<[SourceType, SourceType]> = [
  ["AI_INFERRED", "OFFICIAL"],
  ["AI_INFERRED", "MANUFACTURER"],
  ["AI_INFERRED", "REGULATORY"],
  ["USER_REPORTED", "OFFICIAL"],
  ["USER_REPORTED", "MANUFACTURER"],
  ["USER_OBSERVED", "TESTED"],
  ["USER_OBSERVED", "TESTED_INTERNAL"],
  ["THIRD_PARTY", "MANUFACTURER"],
  ["THIRD_PARTY", "OFFICIAL"],
  ["TRUSTED_THIRD_PARTY", "MANUFACTURER"],
];

export function assertInferenceCannotBecomeOfficial(
  from: SourceType,
  to: SourceType,
): void {
  if (FORBIDDEN_PROMOTIONS.some(([a, b]) => a === from && b === to)) {
    throw new Error(`${from} cannot be promoted to ${to}.`);
  }
  if (from === "AI_INFERRED" && (to === "OFFICIAL" || to === "MANUFACTURER")) {
    throw new Error(
      "AI_INFERRED data cannot be promoted to OFFICIAL or MANUFACTURER.",
    );
  }
}

export function assertEstimatedIsNotTested(estimated: boolean, sourceType: SourceType): void {
  if (estimated && (sourceType === "TESTED" || sourceType === "TESTED_INTERNAL")) {
    throw new Error("ESTIMATED facts cannot be marked TESTED.");
  }
}

export function toFactProvenance(record: ProvenanceRecord): FactProvenance {
  return {
    sourceType: record.source_type,
    sourceName: record.source_name ?? record.source_id,
    sourceUrl: record.source_url,
    retrievedAt: record.retrieved_at,
    reviewedAt: record.reviewed_at ?? record.verified_at,
    validFrom: record.valid_from,
    validUntil: record.valid_until,
    confidence: record.confidence,
    verificationMethod: record.verification_method,
    rawValue: record.raw_value,
    normalizedValue: record.normalized_value,
    confidenceEvidence: record.confidence_evidence ?? [
      {
        kind: record.verification_method === "UNVERIFIED" ? "self_declared_ignored" : "source_rank",
        detail: `${record.source_type} via ${record.verification_method}`,
        weight: sourceRank(record.source_type) / 100,
      },
    ],
  };
}

export function buildFactConflict(
  field: string,
  records: ProvenanceRecord[],
  critical = false,
): FactConflict | null {
  if (records.length < 2) return null;
  const unique = new Map<string, ProvenanceRecord>();
  for (const record of records) {
    const prev = unique.get(record.normalized_value);
    if (!prev || sourceRank(record.source_type) > sourceRank(prev.source_type)) {
      unique.set(record.normalized_value, record);
    }
  }
  if (unique.size < 2) return null;
  const candidates: FactConflictCandidate[] = [...unique.entries()].map(([value, provenance]) => ({
    value,
    provenance,
    sourceRank: sourceRank(provenance.source_type),
  }));
  candidates.sort((a, b) => b.sourceRank - a.sourceRank);
  const top = candidates[0];
  const close = candidates.filter((c) => Math.abs(c.sourceRank - top.sourceRank) <= 20);
  const unresolved = critical || close.length > 1;
  return {
    field,
    candidates,
    sourceRank: candidates.map((c) => c.sourceRank),
    unresolved,
    selectedValue: unresolved ? undefined : top.value,
    resolutionReason: unresolved
      ? critical
        ? "Critical field disagrees across sources — not auto-resolved."
        : "Near-rank sources disagree — not auto-resolved."
      : `Selected ${top.provenance.source_type} (${top.sourceRank}).`,
    critical,
  };
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

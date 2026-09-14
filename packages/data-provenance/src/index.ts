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
  locator?: FieldLocator;
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

export type ProvenanceV3 = {
  sourceId: string;
  sourceClass: string;
  sourceUrl?: string;
  documentTitle?: string;
  documentVersion?: string;
  section?: string;
  page?: string | number;
  locator?: string;
  retrievedAt: string;
  verifiedAt?: string;
  scope?: {
    brand?: string;
    model?: string;
    generation?: string;
    engine?: string;
    country?: string;
    market?: string;
    device?: string;
  };
};

export function toProvenanceV3(record: ProvenanceRecord, extras?: Partial<ProvenanceV3>): ProvenanceV3 {
  return {
    sourceId: record.source_id,
    sourceClass: record.source_type,
    sourceUrl: record.source_url,
    documentTitle: extras?.documentTitle,
    documentVersion: extras?.documentVersion,
    section: extras?.section,
    page: extras?.page,
    locator: extras?.locator,
    retrievedAt: record.retrieved_at,
    verifiedAt: record.verified_at,
    scope: extras?.scope,
  };
}

export function provenance(partial: Omit<ProvenanceRecord, "confidence_level"> & { confidence_level?: ConfidenceLevel }): ProvenanceRecord {
  return {
    ...partial,
    confidence_level:
      partial.confidence_level ?? confidenceLevelFromScore(partial.confidence),
  };
}

export const PROVENANCE_LEVELS = [
  "PRIMARY_EXACT",
  "PRIMARY_GENERAL",
  "REGULATORY_EXACT",
  "TRUSTED_DATASET_EXACT",
  "TRUSTED_THIRD_PARTY",
  "CROSS_SOURCE_CONFIRMED",
  "DERIVED_DETERMINISTIC",
  "DERIVED_HEURISTIC",
  "EDITORIAL",
  "AI_INFERRED",
  "UNKNOWN",
] as const;
export type ProvenanceLevel = (typeof PROVENANCE_LEVELS)[number];

export const AGREEMENT_STATUSES = [
  "SINGLE_SOURCE",
  "MULTI_SOURCE_CONFIRMED",
  "MULTI_SOURCE_CONFLICT",
  "UNVERIFIED",
] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export type FieldLocator = {
  document_title?: string;
  document_version?: string;
  publication_date?: string;
  page?: number | string;
  section?: string;
  table?: string;
  dataset?: string;
  dataset_version?: string;
  station_or_grid?: string;
  period?: string;
};

export type FactObservation = {
  id: string;
  entity_id: string;
  field: string;
  value: string;
  provenance: ProvenanceRecord;
  locator?: FieldLocator;
};

export type CanonicalFact = {
  entity_id: string;
  field: string;
  observations: FactObservation[];
  status: "CONFIRMED" | "CONFLICTED" | "UNRESOLVED" | "ESTIMATED";
  selectedValue?: string;
  resolution?: "NONE" | "EXPLICIT";
};

export type ProvenanceValidation = {
  valid: boolean;
  level: ProvenanceLevel;
  verified_primary: boolean;
  missing_fields: string[];
  warnings: string[];
  evidence_score: number;
  generic_url: boolean;
};

const GENERIC_PATHS = new Set(["", "/", "/us", "/en", "/fr", "/support", "/us/support", "/en/support"]);

export function isGenericSourceUrl(url?: string | null): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (GENERIC_PATHS.has(path.toLowerCase())) return true;
    const parts = path.split("/").filter(Boolean);
    return parts.length < 2;
  } catch {
    return true;
  }
}

export function validateFactProvenance(input: {
  source_type: SourceType;
  source_url?: string;
  source_name?: string;
  retrieved_at?: string;
  verified_at?: string;
  verification_method?: VerificationMethod;
  locator?: FieldLocator;
  inferred?: boolean;
}): ProvenanceValidation {
  const missing: string[] = [];
  const warnings: string[] = [];
  const datasetExact = input.source_type === "PRIMARY_DATABASE" && Boolean(input.locator?.dataset);
  const generic_url = datasetExact ? false : isGenericSourceUrl(input.source_url);
  if (!input.source_url && !datasetExact) missing.push("source_url");
  if (!input.source_name && !input.locator?.document_title && !input.locator?.dataset) {
    missing.push("identifiable_document");
  }
  if (!input.retrieved_at) missing.push("retrieved_at");
  if (input.source_type === "AI_INFERRED" || input.inferred) {
    return {
      valid: false,
      level: "AI_INFERRED",
      verified_primary: false,
      missing_fields: missing,
      warnings: ["AI_INFERRED cannot be VERIFIED_PRIMARY"],
      evidence_score: 5,
      generic_url,
    };
  }
  const hasLocator = Boolean(
    input.locator?.page ||
      input.locator?.section ||
      input.locator?.table ||
      input.locator?.dataset ||
      input.locator?.document_title,
  );
  const primaryType = input.source_type === "MANUFACTURER" || input.source_type === "OFFICIAL";
  const regulatory = input.source_type === "REGULATORY";
  let level: ProvenanceLevel = "UNKNOWN";
  if (primaryType && !generic_url && hasLocator && input.verified_at) level = "PRIMARY_EXACT";
  else if (primaryType && generic_url) level = "PRIMARY_GENERAL";
  else if (primaryType) level = "PRIMARY_GENERAL";
  else if (regulatory && !generic_url && hasLocator) level = "REGULATORY_EXACT";
  else if (input.source_type === "PRIMARY_DATABASE" && input.locator?.dataset && !generic_url) {
    level = "TRUSTED_DATASET_EXACT";
  } else if (input.source_type === "TRUSTED_THIRD_PARTY") level = "TRUSTED_THIRD_PARTY";
  else if (input.verification_method === "CROSS_SOURCE") level = "CROSS_SOURCE_CONFIRMED";
  else if (input.verification_method === "HEURISTIC") level = "DERIVED_HEURISTIC";
  else if (input.source_type === "THIRD_PARTY") level = "TRUSTED_THIRD_PARTY";
  else level = "UNKNOWN";

  if (generic_url) warnings.push("source_url is a generic domain/support root — not PRIMARY_EXACT");
  if (!hasLocator) warnings.push("no document/dataset locator");
  if (!input.verified_at && level === "PRIMARY_EXACT") missing.push("verified_at");

  const verified_primary = level === "PRIMARY_EXACT" || level === "REGULATORY_EXACT";
  const evidence_score =
    (verified_primary ? 70 : level === "TRUSTED_DATASET_EXACT" ? 55 : level === "PRIMARY_GENERAL" ? 25 : 15) +
    (hasLocator ? 15 : 0) +
    (generic_url ? -20 : 10);
  return {
    valid: missing.length === 0 && level !== "UNKNOWN",
    level,
    verified_primary,
    missing_fields: missing,
    warnings,
    evidence_score: Math.max(0, Math.min(100, evidence_score)),
    generic_url,
  };
}

export function agreementStatus(observations: FactObservation[]): AgreementStatus {
  if (observations.length === 0) return "UNVERIFIED";
  const values = new Set(observations.map((o) => o.value));
  if (observations.length === 1) return "SINGLE_SOURCE";
  if (values.size === 1) return "MULTI_SOURCE_CONFIRMED";
  return "MULTI_SOURCE_CONFLICT";
}

export function canonicalizeFact(observations: FactObservation[]): CanonicalFact {
  if (!observations.length) {
    return { entity_id: "", field: "", observations, status: "UNRESOLVED", resolution: "NONE" };
  }
  const status = agreementStatus(observations);
  if (status === "MULTI_SOURCE_CONFLICT") {
    return {
      entity_id: observations[0].entity_id,
      field: observations[0].field,
      observations,
      status: "CONFLICTED",
      resolution: "NONE",
    };
  }
  if (status === "MULTI_SOURCE_CONFIRMED") {
    return {
      entity_id: observations[0].entity_id,
      field: observations[0].field,
      observations,
      status: "CONFIRMED",
      selectedValue: observations[0].value,
      resolution: "EXPLICIT",
    };
  }
  return {
    entity_id: observations[0].entity_id,
    field: observations[0].field,
    observations,
    status: observations[0].provenance.verification_method === "HEURISTIC" ? "ESTIMATED" : "UNRESOLVED",
    selectedValue: observations[0].value,
    resolution: "NONE",
  };
}

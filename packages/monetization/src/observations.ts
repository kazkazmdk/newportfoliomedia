import { assertInferenceCannotBecomeOfficial, type SourceType } from "@penta/data-provenance";
import type { SiteId } from "./sites";

export const OBSERVATION_KINDS = [
  "feedback_correct",
  "feedback_incorrect",
  "user_outcome",
  "user_measurement",
  "correction",
] as const;

export type ObservationKind = (typeof OBSERVATION_KINDS)[number];

export type ObservationRecord = {
  id: string;
  site: SiteId;
  kind: ObservationKind;
  entityId?: string;
  field?: string;
  value: string;
  sourceType: Extract<SourceType, "USER_OBSERVED" | "USER_REPORTED">;
  createdAt: string;
};

export function observationSourceType(kind: ObservationKind): ObservationRecord["sourceType"] {
  return kind === "user_measurement" || kind === "user_outcome" ? "USER_OBSERVED" : "USER_REPORTED";
}

export function createObservation(input: {
  id: string;
  site: SiteId;
  kind: ObservationKind;
  entityId?: string;
  field?: string;
  value: string;
  createdAt?: string;
}): ObservationRecord {
  const sourceType = observationSourceType(input.kind);
  return {
    id: input.id,
    site: input.site,
    kind: input.kind,
    entityId: input.entityId,
    field: input.field,
    value: input.value.trim(),
    sourceType,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function assertObservationNotPromoted(record: ObservationRecord, as: SourceType): void {
  assertInferenceCannotBecomeOfficial(record.sourceType, as);
}

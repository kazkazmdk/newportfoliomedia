export const OBSERVATION_STATES = [
  "RECEIVED",
  "VALIDATING",
  "ACCEPTED_USER_EVIDENCE",
  "REJECTED",
  "MERGED_AS_SIGNAL",
] as const;

export type ObservationState = (typeof OBSERVATION_STATES)[number];

export function assertMergedIsNotOfficial(state: ObservationState): void {
  if (state === "MERGED_AS_SIGNAL") {
    throw new Error("MERGED_AS_SIGNAL is not OFFICIAL");
  }
}

export type FixcodeOutcome = {
  site: "fixcode";
  resolved?: boolean;
  solutionAttempted?: string;
  errorPersisted?: boolean;
  repairType?: string;
};

export type AutospecOutcome = {
  site: "autospec";
  fitmentConfirmed?: boolean;
  specCorrection?: string;
  variantCorrection?: string;
};

export type ChargematchOutcome = {
  site: "chargematch";
  realCompatibility?: boolean;
  cableUsed?: string;
  measuredPower?: number;
  deviceState?: string;
};

export type TripcostOutcome = {
  site: "tripcost";
  actualTripCost?: number;
  actualToll?: number;
  fuelOrEnergyUsed?: number;
  modeChosen?: string;
};

export type WearthereOutcome = {
  site: "wearthere";
  comfortRating?: number;
  itemsUsed?: string[];
  itemsMissing?: string[];
  weatherMismatch?: boolean;
};

export type ProductOutcome =
  | FixcodeOutcome
  | AutospecOutcome
  | ChargematchOutcome
  | TripcostOutcome
  | WearthereOutcome;

export function observationFingerprint(input: { site: string; entityId?: string; kind: string; value: string }): string {
  return [input.site, input.entityId ?? "", input.kind, input.value.trim().toLowerCase()].join("|");
}

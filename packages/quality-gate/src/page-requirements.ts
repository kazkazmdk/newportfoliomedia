import type { PageFamily } from "@penta/graph-core";

export type PageFamilyRequirements = {
  family: string;
  mandatory: string[];
  optional: string[];
  decision_critical: string[];
  provenance_required: string[];
  interaction: {
    needs_user_input: boolean;
    needs_computed_output: boolean;
    cta_is_not_enough: true;
  };
  minimum_unique_information: number;
};

const INTERACTIVE = {
  needs_user_input: true,
  needs_computed_output: true,
  cta_is_not_enough: true as const,
};

const STATIC = {
  needs_user_input: false,
  needs_computed_output: false,
  cta_is_not_enough: true as const,
};

function req(
  family: string,
  mandatory: string[],
  extras: Partial<Omit<PageFamilyRequirements, "family" | "mandatory">> = {},
): PageFamilyRequirements {
  return {
    family,
    mandatory,
    optional: extras.optional ?? [],
    decision_critical: extras.decision_critical ?? [],
    provenance_required: extras.provenance_required ?? [],
    interaction: extras.interaction ?? STATIC,
    minimum_unique_information: extras.minimum_unique_information ?? mandatory.length,
  };
}

export const PAGE_REQUIREMENTS: Record<string, PageFamilyRequirements> = {
  "error-code": req(
    "error-code",
    ["brand", "appliance", "code", "meaning"],
    {
      optional: ["models", "related"],
      decision_critical: ["causes"],
      provenance_required: ["brand", "code", "meaning"],
      interaction: INTERACTIVE,
      minimum_unique_information: 6,
    },
  ),
  "fixcode-error": req("fixcode-error", ["brand", "appliance", "code", "meaning"], {
    decision_critical: ["causes"],
    interaction: INTERACTIVE,
    minimum_unique_information: 6,
  }),
  symptom: req("symptom", ["appliance", "symptom", "meaning"], {
    optional: ["brand"],
    decision_critical: ["causes"],
    interaction: INTERACTIVE,
    minimum_unique_information: 5,
  }),
  "fixcode-symptom": req("fixcode-symptom", ["appliance", "symptom"], {
    decision_critical: ["causes"],
    interaction: INTERACTIVE,
  }),
  "repair-guide": req("repair-guide", ["brand", "appliance", "code"], {
    decision_critical: ["causes"],
    interaction: INTERACTIVE,
  }),
  "appliance-hub": req("appliance-hub", ["brand", "appliance", "codes"], {
    optional: ["distinct_reason"],
    minimum_unique_information: 3,
  }),
  "brand-hub": req("brand-hub", ["brand", "codes"], { minimum_unique_information: 2 }),
  "oil-type": req("oil-type", ["vehicle"], {
    decision_critical: ["spec", "viscosity", "engine"],
    provenance_required: ["spec"],
    interaction: INTERACTIVE,
    minimum_unique_information: 4,
  }),
  "oil-capacity": req("oil-capacity", ["vehicle"], {
    decision_critical: ["capacity_l", "engine"],
    provenance_required: ["capacity_l"],
    interaction: INTERACTIVE,
  }),
  "tyre-pressure": req("tyre-pressure", ["vehicle"], {
    decision_critical: ["pressure_bar_front"],
    interaction: INTERACTIVE,
  }),
  battery: req("battery", ["vehicle"], { decision_critical: ["type"], interaction: INTERACTIVE }),
  wipers: req("wipers", ["vehicle"], { optional: ["size"] }),
  "maintenance-schedule": req("maintenance-schedule", ["vehicle"], {
    decision_critical: ["services"],
    interaction: INTERACTIVE,
  }),
  "common-problems": req("common-problems", ["vehicle"], { optional: ["problems"] }),
  recalls: req("recalls", ["vehicle"], { optional: ["recalls"] }),
  "compatible-component": req("compatible-component", ["vehicle", "component"], {
    decision_critical: ["status"],
    interaction: INTERACTIVE,
  }),
  "vehicle-hub": req("vehicle-hub", ["vehicle"], { optional: ["engine", "generation"] }),
  "autospec-model": req("autospec-model", ["make", "model", "generation"], {
    optional: ["engine"],
    provenance_required: ["generation"],
  }),
  "autospec-engine": req("autospec-engine", ["make", "model", "generation", "engine"], {
    decision_critical: ["spec"],
    provenance_required: ["engine"],
    interaction: INTERACTIVE,
  }),
  "autospec-fitment": req("autospec-fitment", ["vehicle", "component"], {
    decision_critical: ["status"],
    interaction: INTERACTIVE,
  }),
  "wear-month": req("wear-month", ["city", "month", "tmin_c", "tmax_c"], {
    optional: ["rain_days", "rain_mm", "humidity", "wind_kmh"],
    decision_critical: ["tmin_c", "tmax_c"],
    provenance_required: ["tmin_c", "tmax_c", "kind"],
    interaction: INTERACTIVE,
    minimum_unique_information: 6,
  }),
  "wearthere-city-month": req("wearthere-city-month", ["city", "month", "tmin_c", "tmax_c"], {
    decision_critical: ["tmin_c", "tmax_c"],
    interaction: INTERACTIVE,
  }),
  "packing-month": req("packing-month", ["city", "month"], {
    decision_critical: ["layers"],
    interaction: INTERACTIVE,
  }),
  "wearthere-activity": req("wearthere-activity", ["city", "activity"], {
    decision_critical: ["layers"],
    interaction: INTERACTIVE,
  }),
  "season-clothing": req("season-clothing", ["city"], { optional: ["season"] }),
  "destination-hub": req("destination-hub", ["city"], { optional: ["months"] }),
  "device-wattage": req("device-wattage", ["slug", "min", "max"], {
    optional: ["pd"],
    provenance_required: ["max"],
    interaction: INTERACTIVE,
  }),
  "device-hub": req("device-hub", ["slug", "min", "max"], { interaction: INTERACTIVE }),
  "chargematch-device": req("chargematch-device", ["slug", "min", "max"], { interaction: INTERACTIVE }),
  "charger-for-device": req("charger-for-device", ["device", "charger"], {
    decision_critical: ["max_power", "match"],
    interaction: INTERACTIVE,
  }),
  "can-charger-charge": req("can-charger-charge", ["device", "charger", "match"], {
    decision_critical: ["max_power", "bottleneck"],
    provenance_required: ["max_power"],
    interaction: INTERACTIVE,
    minimum_unique_information: 5,
  }),
  "chargematch-scenario": req("chargematch-scenario", ["device", "charger"], {
    decision_critical: ["expected_power", "limiting_component"],
    interaction: INTERACTIVE,
  }),
  "protocol-education": req("protocol-education", ["slug"], { optional: ["protocol"] }),
  "route-driving": req("route-driving", ["route"], {
    decision_critical: ["modes"],
    interaction: INTERACTIVE,
  }),
  "route-toll": req("route-toll", ["route"], { optional: ["tolls"] }),
  "route-car-vs-train": req("route-car-vs-train", ["route"], {
    decision_critical: ["modes"],
    interaction: INTERACTIVE,
  }),
  "route-fuel": req("route-fuel", ["route"], { optional: ["fuel"] }),
  "travel-calculator": req("travel-calculator", ["route"], {
    decision_critical: ["modes"],
    interaction: INTERACTIVE,
  }),
  "tripcost-route": req("tripcost-route", ["from", "to"], {
    decision_critical: ["modes"],
    interaction: INTERACTIVE,
  }),
  "tripcost-mode": req("tripcost-mode", ["route", "mode"], { interaction: INTERACTIVE }),
};

export function requirementsFor(family: string | PageFamily): PageFamilyRequirements | undefined {
  return PAGE_REQUIREMENTS[family];
}

export function requiredFieldKeys(family: string): string[] {
  const spec = PAGE_REQUIREMENTS[family];
  if (!spec) return [];
  return [...new Set([...spec.mandatory, ...spec.decision_critical])];
}

export function inspectPayloadKeys(payload?: Record<string, unknown>): string[] {
  if (!payload) return [];
  const keys = new Set<string>();
  const walk = (value: unknown, depth: number) => {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      for (const item of value.slice(0, 8)) walk(item, depth + 1);
      return;
    }
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        keys.add(k);
        walk(v, depth + 1);
      }
    }
  };
  walk(payload, 0);
  return [...keys];
}

export function inspectRequiredFields(family: string, payload?: Record<string, unknown>) {
  const spec = PAGE_REQUIREMENTS[family];
  const keys = inspectPayloadKeys(payload);
  const required = spec ? [...spec.mandatory, ...spec.decision_critical.filter((k) => !spec.mandatory.includes(k))] : [];
  const present = required.filter((k) => keys.includes(k));
  const missing = required.filter((k) => !keys.includes(k));
  const uniqueOk = !spec || keys.length >= spec.minimum_unique_information;
  return {
    required,
    present,
    missing,
    unique_key_count: keys.length,
    unique_min: spec?.minimum_unique_information ?? 0,
    unique_ok: uniqueOk,
    passed: Boolean(spec) && missing.length === 0 && uniqueOk,
  };
}

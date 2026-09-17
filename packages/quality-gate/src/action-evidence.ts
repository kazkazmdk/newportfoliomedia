export const ACTION_TYPES = [
  "DIAGNOSE",
  "COMPARE",
  "CALCULATE",
  "RECOMMEND",
  "FILTER",
  "VERIFY",
  "PLAN",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export type ActionEvidence = {
  actionType: ActionType;
  inputFields: string[];
  outputFields: string[];
  rendered: boolean;
  executable: boolean;
  decisionFields: string[];
};

const STRING_ONLY = /help user decide|intended action|cta|learn more/i;

export function isStringOnlyAction(value: unknown): boolean {
  return typeof value === "string" && STRING_ONLY.test(value) && value.split(/\s+/).length <= 6;
}

export function actionEvidenceFromPayload(payload?: Record<string, unknown>): ActionEvidence | null {
  if (!payload) return null;
  const stored = payload.action_evidence;
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const rec = stored as Record<string, unknown>;
    if (
      ACTION_TYPES.includes(rec.actionType as ActionType) &&
      Array.isArray(rec.inputFields) &&
      Array.isArray(rec.outputFields) &&
      rec.inputFields.length > 0 &&
      rec.outputFields.length > 0 &&
      (rec.rendered === true || rec.executable === true)
    ) {
      return {
        actionType: rec.actionType as ActionType,
        inputFields: rec.inputFields.map(String),
        outputFields: rec.outputFields.map(String),
        rendered: rec.rendered === true,
        executable: rec.executable === true,
        decisionFields: Array.isArray(rec.decisionFields) ? rec.decisionFields.map(String) : rec.outputFields.map(String),
      };
    }
  }
  if (isStringOnlyAction(payload.intendedAction) || isStringOnlyAction(payload.intended_action)) {
    return null;
  }
  return deriveActionEvidence(payload);
}

export function deriveActionEvidence(payload: Record<string, unknown>): ActionEvidence | null {
  if (Array.isArray(payload.causes) && payload.causes.length && (payload.code || payload.symptom)) {
    return {
      actionType: "DIAGNOSE",
      inputFields: ["brand", "appliance", "code"].filter((k) => payload[k] != null),
      outputFields: ["causes", payload.questions ? "questions" : ""].filter(Boolean),
      rendered: true,
      executable: Boolean(payload.questions) || Boolean(payload.diagnostic_tree),
      decisionFields: ["causes", "safety"],
    };
  }
  if (payload.match != null && payload.max_power != null && payload.device && payload.charger) {
    return {
      actionType: "VERIFY",
      inputFields: ["device", "charger"],
      outputFields: ["match", "max_power", "bottleneck"],
      rendered: true,
      executable: true,
      decisionFields: ["match", "max_power", "bottleneck"],
    };
  }
  if (Array.isArray(payload.layers) && payload.layers.length && payload.city && payload.month != null) {
    return {
      actionType: "RECOMMEND",
      inputFields: ["city", "month"],
      outputFields: ["layers"],
      rendered: true,
      executable: true,
      decisionFields: ["layers", "not_to_pack"].filter((k) => payload[k] != null || k === "layers"),
    };
  }
  if (Array.isArray(payload.modes) && payload.modes.length && (payload.route || payload.from)) {
    return {
      actionType: "COMPARE",
      inputFields: ["route", "from", "to"].filter((k) => payload[k] != null),
      outputFields: ["modes"],
      rendered: true,
      executable: true,
      decisionFields: ["modes", "break_even"],
    };
  }
  if ((payload.capacity_l != null || payload.spec != null) && payload.vehicle && payload.engine) {
    return {
      actionType: "CALCULATE",
      inputFields: ["vehicle", "engine"],
      outputFields: [payload.capacity_l != null ? "capacity_l" : "spec"],
      rendered: true,
      executable: true,
      decisionFields: ["capacity_l", "spec", "viscosity"].filter((k) => payload[k] != null),
    };
  }
  if (payload.pressure_bar_front != null && payload.vehicle) {
    return {
      actionType: "CALCULATE",
      inputFields: ["vehicle"],
      outputFields: ["pressure_bar_front"],
      rendered: true,
      executable: true,
      decisionFields: ["pressure_bar_front", "pressure_bar_rear"],
    };
  }
  if (Array.isArray(payload.services) && payload.services.length && payload.vehicle) {
    return {
      actionType: "PLAN",
      inputFields: ["vehicle"],
      outputFields: ["services"],
      rendered: true,
      executable: true,
      decisionFields: ["services"],
    };
  }
  if ((payload.type != null || payload.ah != null) && payload.vehicle && (payload.family === "battery" || payload.battery_decision === true || payload.ah != null)) {
    return {
      actionType: "CALCULATE",
      inputFields: ["vehicle"],
      outputFields: payload.type != null ? ["type"] : ["ah"],
      rendered: true,
      executable: true,
      decisionFields: ["type", "ah"].filter((k) => payload[k] != null),
    };
  }
  if (Array.isArray(payload.problems) && payload.problems.length && payload.vehicle) {
    return {
      actionType: "RECOMMEND",
      inputFields: ["vehicle"],
      outputFields: ["problems"],
      rendered: true,
      executable: true,
      decisionFields: payload.when_to_stop != null ? ["problems", "when_to_stop"] : ["problems"],
    };
  }
  if (Array.isArray(payload.codes) && payload.codes.length && payload.brand) {
    return {
      actionType: "FILTER",
      inputFields: payload.appliance != null ? ["brand", "appliance"] : ["brand"],
      outputFields: ["codes"],
      rendered: true,
      executable: true,
      decisionFields: ["codes"],
    };
  }
  if (Array.isArray(payload.topics) && payload.topics.length && payload.vehicle) {
    return {
      actionType: "FILTER",
      inputFields: ["vehicle"],
      outputFields: ["topics"],
      rendered: true,
      executable: true,
      decisionFields: payload.engine != null ? ["topics", "engine"] : ["topics"],
    };
  }
  if (Array.isArray(payload.periods) && payload.periods.length && payload.city) {
    return {
      actionType: "RECOMMEND",
      inputFields: ["city"],
      outputFields: ["periods"],
      rendered: true,
      executable: true,
      decisionFields: payload.tmin_c != null ? ["periods", "tmin_c"] : ["periods"],
    };
  }
  if (payload.min != null && payload.max != null && payload.slug) {
    return {
      actionType: "CALCULATE",
      inputFields: ["slug"],
      outputFields: ["min", "max"],
      rendered: true,
      executable: true,
      decisionFields: ["min", "max"],
    };
  }
  if (payload.engine && payload.vehicle && (payload.spec != null || payload.viscosity != null || payload.oil != null)) {
    return {
      actionType: "CALCULATE",
      inputFields: ["vehicle", "engine"],
      outputFields: ["engine"],
      rendered: true,
      executable: true,
      decisionFields: ["engine"],
    };
  }
  return null;
}

export function declaredFieldsPresent(payload: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((field) => payload[field] == null);
}

export function actionEvidencePasses(
  evidence: ActionEvidence | null,
  payload?: Record<string, unknown>,
): boolean {
  if (!evidence) return false;
  if (
    !(
      evidence.inputFields.length > 0 &&
      evidence.outputFields.length > 0 &&
      evidence.decisionFields.length > 0 &&
      (evidence.rendered || evidence.executable)
    )
  ) {
    return false;
  }
  if (payload) {
    const missing = declaredFieldsPresent(payload, [...evidence.outputFields, ...evidence.decisionFields]);
    if (missing.length) return false;
  }
  return true;
}

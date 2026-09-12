import type { ConfidenceLevel } from "@penta/data-provenance";

export type AiTask =
  | "none"
  | "classify"
  | "explain"
  | "vision"
  | "multi_factor";

export type AiRoute = {
  task: AiTask;
  model: "none" | "small" | "quality";
  reason: string;
};

export function routeAiTask(input: {
  deterministicAvailable: boolean;
  needsClassification: boolean;
  needsExplanation: boolean;
  needsVision: boolean;
  multiFactor: boolean;
}): AiRoute {
  if (input.deterministicAvailable && !input.needsExplanation && !input.needsVision) {
    return { task: "none", model: "none", reason: "Structured lookup is sufficient" };
  }
  if (input.needsVision) {
    return { task: "vision", model: "quality", reason: "Image interpretation requested" };
  }
  if (input.multiFactor && input.needsExplanation) {
    return {
      task: "multi_factor",
      model: "quality",
      reason: "Multi-factor reasoning with explanation",
    };
  }
  if (input.needsClassification) {
    return { task: "classify", model: "small", reason: "Classification only" };
  }
  if (input.needsExplanation) {
    return { task: "explain", model: "small", reason: "Explain structured facts" };
  }
  return { task: "none", model: "none", reason: "No model required" };
}

export type ToolCallAudit = {
  id: string;
  at: string;
  tool: string;
  input_entity_ids: string[];
  source_versions: string[];
  confidence: ConfidenceLevel;
  model: AiRoute["model"];
  cost_estimate_usd: number;
};

const audits: ToolCallAudit[] = [];

export function recordToolCall(audit: Omit<ToolCallAudit, "id" | "at">): ToolCallAudit {
  const row: ToolCallAudit = {
    ...audit,
    id: `audit_${audits.length + 1}`,
    at: new Date().toISOString(),
  };
  audits.push(row);
  return row;
}

export function listToolCalls(): ToolCallAudit[] {
  return [...audits];
}

export function explainStructured(input: {
  facts: string[];
  confidence: ConfidenceLevel;
  unknown: string[];
}): string {
  const lines = input.facts.filter(Boolean);
  if (input.confidence === "UNKNOWN" || lines.length === 0) {
    return "I don't know. We don't have verified data for this yet.";
  }
  const body = lines.join(" ");
  const unknown =
    input.unknown.length > 0
      ? ` Unverified: ${input.unknown.join("; ")}.`
      : "";
  const hedge =
    input.confidence === "HIGH"
      ? ""
      : input.confidence === "MEDIUM"
        ? " This is a medium-confidence reading of structured records, not a guarantee."
        : " Treat this as a low-confidence hypothesis.";
  return `${body}${hedge}${unknown}`;
}

export type VisionRequest = {
  kind: "appliance_label" | "error_screen" | "invoice" | "vin" | "garment" | "charger_label";
  image_meta: { width?: number; mime?: string; bytes?: number };
};

export function visionGuard(request: VisionRequest): {
  allowed: boolean;
  reason: string;
} {
  if (!request.image_meta.mime || !request.image_meta.mime.startsWith("image/")) {
    return { allowed: false, reason: "Only image uploads are accepted." };
  }
  if ((request.image_meta.bytes ?? 0) > 8_000_000) {
    return { allowed: false, reason: "Image exceeds 8 MB." };
  }
  return { allowed: true, reason: "Vision utility is in scope." };
}

export const SITE_AI_TOOLS: Record<string, string[]> = {
  fixcode: ["lookup_appliance", "lookup_code", "update_diagnosis", "safety_gate"],
  autospec: ["vehicle_graph", "maintenance_engine", "fitment_engine", "recall_lookup"],
  wearthere: ["climate_lookup", "forecast_lookup", "outfit_engine", "packing_optimizer"],
  chargematch: ["compatibility", "port_allocation", "bottleneck_diagnosis"],
  tripcost: ["route_compare", "car_cost", "time_value"],
};

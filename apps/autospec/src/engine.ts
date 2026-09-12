import type { ConfidenceLevel } from "@penta/data-provenance";
import { explainStructured, recordToolCall, routeAiTask } from "@penta/ai-core";
import { evaluatePageQuality, searchDemandScore } from "@penta/quality-gate";
import type { PageRecord } from "@penta/graph-core";
import { MockVinProvider, VEHICLES, type Fitment, type VehicleIdentity } from "./data";

export function getVehicle(make: string, model: string, generation: string, variant: string) {
  return VEHICLES.find(
    (item) =>
      item.make_slug === make &&
      item.model_slug === model &&
      item.generation_slug === generation &&
      item.variant_slug === variant,
  );
}

export function findVehicles(query: string): VehicleIdentity[] {
  const q = query.trim().toLowerCase();
  if (!q) return VEHICLES;
  return VEHICLES.filter((item) =>
    `${item.make} ${item.model} ${item.generation} ${item.variant} ${item.engine_code}`
      .toLowerCase()
      .includes(q),
  );
}

export function nextService(vehicle: VehicleIdentity, km: number, ageMonths: number) {
  return vehicle.services
    .map((item) => {
      const kmLeft = item.interval_km - (km % item.interval_km);
      const monthsLeft = item.interval_months - (ageMonths % item.interval_months);
      return { ...item, km_left: kmLeft, months_left: monthsLeft };
    })
    .sort((a, b) => a.km_left - b.km_left);
}

export function ownershipScore(input: {
  km: number;
  last_oil_km: number;
  tyre_ok: boolean;
  brake_pct: number;
  battery: "GOOD" | "WEAK" | "UNKNOWN";
  open_recalls: number;
}): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 100;
  const oilAge = input.km - input.last_oil_km;
  if (oilAge > 30000) {
    score -= 25;
    factors.push("Oil interval exceeded");
  } else {
    factors.push("Oil within interval");
  }
  if (!input.tyre_ok) {
    score -= 20;
    factors.push("Tyres need inspection");
  } else factors.push("Tyres flagged OK");
  if (input.brake_pct < 40) {
    score -= 18;
    factors.push("Brake pad estimate under 40%");
  } else factors.push(`Brakes ~${input.brake_pct}%`);
  if (input.battery === "WEAK") {
    score -= 15;
    factors.push("12V battery weak");
  } else if (input.battery === "UNKNOWN") {
    score -= 5;
    factors.push("Battery unknown");
  } else factors.push("Battery good");
  if (input.open_recalls > 0) {
    score -= 12;
    factors.push("Recall check outstanding");
  } else factors.push("No open recall recorded in this profile");
  return { score: Math.max(0, score), factors };
}

export function checkFitment(
  vehicle: VehicleIdentity,
  componentId: string,
): Fitment | { compatible: false; confidence: "UNKNOWN"; reason: string } {
  const hit = vehicle.fitment.find((item) => item.component_id === componentId);
  if (!hit) {
    return {
      compatible: false,
      confidence: "UNKNOWN",
      reason: "No verified fitment row. Similarity is not used as compatibility.",
    };
  }
  return hit;
}

export async function decodeVin(vin: string) {
  return MockVinProvider.decode(vin);
}

export function assistantAnswer(vehicle: VehicleIdentity, question: string): string {
  const q = question.toLowerCase();
  const oil = vehicle.oil.capacity_liters
    ? `Use ${vehicle.oil.viscosity} meeting ${vehicle.oil.spec}. Capacity ${vehicle.oil.capacity_liters} L ${vehicle.oil.with_filter ? "with filter" : ""}.`
    : "This vehicle does not take engine oil.";
  if (q.includes("oil")) {
    recordToolCall({
      tool: "maintenance_engine",
      input_entity_ids: [vehicle.id],
      source_versions: ["oem-handbook"],
      confidence: vehicle.confidence,
      model: "none",
      cost_estimate_usd: 0,
    });
    return oil;
  }
  if (q.includes("1800") || q.includes("km next")) {
    return explainStructured({
      facts: [
        `Road-trip readiness depends on oil, tyres, brakes, and recalls — not a yes from mileage alone.`,
        `Next oil-style service interval on file is ${vehicle.services[0]?.interval_km ?? "unknown"} km.`,
      ],
      confidence: "MEDIUM",
      unknown: ["We do not have your last service date unless you add it."],
    });
  }
  if (q.includes("noise") || q.includes("safe")) {
    const issue = vehicle.issues[0];
    return explainStructured({
      facts: [
        issue?.summary ?? "A noise is not a certain diagnosis.",
        issue?.when_to_stop ?? "If a red warning lamp appears, stop driving.",
      ],
      confidence: "LOW",
      unknown: ["Have a technician inspect if the noise changes with load or comes with a warning lamp."],
    });
  }
  routeAiTask({
    deterministicAvailable: true,
    needsClassification: false,
    needsExplanation: true,
    needsVision: false,
    multiFactor: false,
  });
  return explainStructured({
    facts: [oil, `Tyre pressure on file: ${vehicle.tyres.pressure_bar_front} / ${vehicle.tyres.pressure_bar_rear} bar.`],
    confidence: vehicle.confidence,
    unknown: [],
  });
}

const TOPICS = [
  { slug: "oil", family: "oil-type" as const, demand: 88, title: (v: VehicleIdentity) => `${v.make} ${v.variant} ${v.generation} Oil Type & Capacity` },
  { slug: "tyres", family: "tyre-pressure" as const, demand: 72, title: (v: VehicleIdentity) => `${v.make} ${v.model} ${v.generation} Tyre Pressure` },
  { slug: "battery", family: "battery" as const, demand: 64, title: (v: VehicleIdentity) => `${v.make} ${v.model} ${v.generation} Battery` },
  { slug: "maintenance", family: "maintenance-schedule" as const, demand: 80, title: (v: VehicleIdentity) => `${v.make} ${v.variant} ${v.generation} Maintenance Schedule` },
  { slug: "problems", family: "common-problems" as const, demand: 70, title: (v: VehicleIdentity) => `${v.make} ${v.variant} ${v.generation} Known Issues` },
];

export function vehicleUrl(v: VehicleIdentity, topic?: string) {
  const base = `/autospec/${v.make_slug}/${v.model_slug}/${v.generation_slug}/${v.variant_slug}`;
  return topic ? `${base}/${topic}` : base;
}

export function allAutospecPages(): PageRecord[] {
  const pages: PageRecord[] = [];
  for (const vehicle of VEHICLES) {
    const hubPayload = {
      vehicle: vehicle.id,
      engine: vehicle.engine_code,
      years: vehicle.years,
      generation: vehicle.generation,
    };
    const hubQ = evaluatePageQuality({
      site: "autospec",
      family: "vehicle-hub",
      unique_fields: 10,
      required_fields_present: 9,
      required_fields_total: 9,
      search_demand: { seed_research: 82 },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: false,
      llm_filler: false,
      confidence: vehicle.confidence,
      freshness_days: 60,
      freshness_ttl_days: 365,
      provenance_valid: true,
    });
    pages.push({
      id: vehicle.id,
      site: "autospec",
      family: "vehicle-hub",
      url: vehicleUrl(vehicle),
      canonical: vehicleUrl(vehicle),
      title: `${vehicle.make} ${vehicle.model} ${vehicle.generation} ${vehicle.variant}`,
      meta_description: `${vehicle.engine_code} ownership data: oil, tyres, battery, service intervals. Years ${vehicle.years[0]}–${vehicle.years.at(-1)} share this generation/engine page.`,
      entity_ids: [vehicle.id],
      structured_payload: hubPayload,
      quality_score: hubQ.score,
      search_demand: 82,
      index_state: hubQ.index_state,
      noindex: hubQ.index_state !== "INDEXABLE",
      similarity_hash: vehicle.engine_code,
      freshness: "2026-07-01T00:00:00.000Z",
      review_required: false,
      batch: "autospec-batch-1",
      publish_state: hubQ.index_state === "INDEXABLE" ? "PUBLISHED" : "READY",
    });
    for (const topic of TOPICS) {
      if (topic.slug === "oil" && vehicle.oil.capacity_liters === 0) continue;
      const payload =
        topic.slug === "oil"
          ? { vehicle: vehicle.id, spec: vehicle.oil.spec, visc: vehicle.oil.viscosity, cap: vehicle.oil.capacity_liters }
          : topic.slug === "tyres"
            ? { vehicle: vehicle.id, ...vehicle.tyres }
            : topic.slug === "battery"
              ? { vehicle: vehicle.id, ...vehicle.battery }
              : topic.slug === "maintenance"
                ? { vehicle: vehicle.id, items: vehicle.services.map((s) => s.id) }
                : { vehicle: vehicle.id, issues: vehicle.issues.map((i) => i.id) };
      const quality = evaluatePageQuality({
        site: "autospec",
        family: topic.family,
        unique_fields: Object.keys(payload).length + 5,
        required_fields_present: 8,
        required_fields_total: 8,
        search_demand: { seed_research: topic.demand },
        product_cta: true,
        interactive: true,
        distinct_from_parent: true,
        near_duplicate: false,
        year_only_variant: false,
        city_without_specifics: false,
        obscure_without_demand: false,
        llm_filler: false,
        confidence: vehicle.confidence,
        freshness_days: 60,
        freshness_ttl_days: topic.slug === "problems" ? 90 : 365,
        provenance_valid: true,
        site_rules: () => ({
          delta: 0,
          reasons: [`Canonical engine page — years ${vehicle.years.join(", ")} are not split.`],
          blockers: [],
        }),
      });
      pages.push({
        id: `${vehicle.id}:${topic.slug}`,
        site: "autospec",
        family: topic.family,
        url: vehicleUrl(vehicle, topic.slug),
        canonical: vehicleUrl(vehicle, topic.slug),
        title: topic.title(vehicle),
        meta_description: `${vehicle.make} ${vehicle.generation} ${vehicle.variant} (${vehicle.engine_code}) — structured ${topic.slug} data.`,
        entity_ids: [vehicle.id],
        structured_payload: payload as Record<string, unknown>,
        quality_score: quality.score,
        search_demand: searchDemandScore({ seed_research: topic.demand }),
        index_state: quality.index_state,
        noindex: quality.index_state !== "INDEXABLE",
        similarity_hash: `${vehicle.engine_code}:${topic.slug}`,
        freshness: "2026-07-01T00:00:00.000Z",
        review_required: topic.slug === "problems",
        batch: "autospec-batch-1",
        publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
      });
    }
  }
  return pages;
}

export { VEHICLES };
export type { ConfidenceLevel, VehicleIdentity };

import type { PageRecord, SiteId } from "@penta/graph-core";

export type DecisionFingerprintInput = {
  primaryEntities?: string[];
  graphPath: string;
  recommendation: unknown;
  limitingFactors: unknown;
  evidenceIds?: string[];
};

export type ClimateFingerprintInput = {
  tempBand: string;
  rainBand: string;
  wind?: string | number | null;
  humidity?: string | number | null;
  activity?: string | null;
  capsule?: unknown;
};

function normalize(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = normalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return String(value);
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function stableHash(value: unknown): string {
  const text = stableSerialize(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const prefix = (hash >>> 0).toString(16).padStart(8, "0");
  const body = Buffer.from(text).toString("base64url").slice(0, 28);
  return `${prefix}:${body}`;
}

/** Decision identity — not the URL, not the article wording. */
export function decisionFingerprint(input: DecisionFingerprintInput): string {
  return `df1:${stableHash({
    graphPath: input.graphPath,
    recommendation: input.recommendation ?? null,
    limitingFactors: input.limitingFactors ?? null,
    evidenceIds: [...(input.evidenceIds ?? [])].map(String).sort(),
  })}`;
}

export function tempBand(tmin: number | null | undefined, tmax: number | null | undefined): string {
  const mid = ((tmin ?? 0) + (tmax ?? tmin ?? 0)) / 2;
  if (mid < 0) return "freezing";
  if (mid < 8) return "cold";
  if (mid < 16) return "mild";
  if (mid < 24) return "warm";
  return "hot";
}

export function rainBand(rainDays: number | null | undefined): string {
  const days = rainDays ?? 0;
  if (days < 5) return "dry";
  if (days < 12) return "mixed";
  return "wet";
}

export function climateFingerprint(input: ClimateFingerprintInput): string {
  return `cf1:${stableHash({
    tempBand: input.tempBand,
    rainBand: input.rainBand,
    wind: input.wind ?? null,
    humidity: input.humidity ?? null,
    activity: input.activity ?? null,
    capsule: input.capsule ?? null,
  })}`;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function fingerprintFromPage(page: Pick<PageRecord, "site" | "family" | "entity_ids" | "structured_payload">): string {
  const payload = page.structured_payload ?? {};
  const site = page.site as SiteId;
  if (site === "chargematch" && (page.family === "can-charger-charge" || page.family === "charger-for-device")) {
    const deviceMax = num(payload.device_max);
    const chargerWatts = num(payload.charger_watts);
    return decisionFingerprint({
      graphPath: "can-charger-charge",
      primaryEntities: [String(payload.device ?? "")],
      recommendation: payload.match ?? payload.decision,
      limitingFactors: {
        device: payload.device,
        max_power: payload.max_power,
        bottleneck: payload.bottleneck,
        protocol: payload.protocol ?? payload.pd ?? payload.tag,
        theoretical: payload.theoretical ?? false,
        connector: payload.connector ?? null,
        ports: payload.ports ?? null,
        device_max: deviceMax,
        charger_meets_device: deviceMax != null && chargerWatts != null ? chargerWatts >= deviceMax : null,
      },
      evidenceIds: [String(payload.evidence ?? ""), String(payload.tag ?? "")].filter(Boolean),
    });
  }
  if (site === "wearthere" && (page.family === "wear-month" || page.family === "packing-month")) {
    const tmin = num(payload.tmin_c);
    const tmax = num(payload.tmax_c);
    const rain = num(payload.rain_days);
    const climate = climateFingerprint({
      tempBand: tempBand(tmin, tmax),
      rainBand: rainBand(rain),
      wind: num(payload.wind_ms) ?? num(payload.wind) ?? str(payload.wind),
      humidity: num(payload.humidity) ?? str(payload.humidity),
      activity: str(payload.activity) ?? str(payload.activities),
      capsule: payload.layers ?? payload.capsule ?? payload.pieces ?? payload.answer ?? null,
    });
    return decisionFingerprint({
      graphPath: page.family,
      recommendation: payload.layers ?? payload.capsule ?? payload.answer ?? climate,
      limitingFactors: {
        climate,
        tmin_c: tmin == null ? null : Math.round(tmin),
        tmax_c: tmax == null ? null : Math.round(tmax),
        rain_days: rain == null ? null : Math.round(rain),
        layers: payload.layers ?? null,
      },
      evidenceIds: [climate],
    });
  }
  if (site === "fixcode" && (page.family === "error-code" || page.family === "symptom")) {
    return decisionFingerprint({
      graphPath: page.family,
      recommendation: {
        meaning: payload.meaning ?? payload.symptom,
        causes: payload.causes,
        questions: payload.questions ?? payload.tests,
      },
      limitingFactors: {
        brand: payload.brand,
        appliance: payload.appliance,
        code: payload.code ?? payload.symptom,
        safety: payload.safety ?? payload.diagnostic_tree,
      },
      evidenceIds: page.entity_ids,
    });
  }
  if (site === "autospec") {
    return decisionFingerprint({
      graphPath: page.family,
      recommendation: {
        spec: payload.spec ?? payload.oil ?? null,
        viscosity: payload.viscosity ?? null,
        capacity: payload.capacity_l ?? null,
        services: payload.services ?? null,
        battery: payload.group ?? payload.battery ?? null,
        tyres: payload.size ?? payload.pressure_bar_front ?? null,
        issues: payload.issues ?? payload.problems ?? null,
        engine: payload.engine ?? null,
      },
      limitingFactors: {
        vehicle: payload.vehicle,
        engine: payload.engine,
        market: payload.market_scope,
        fitment: payload.fitment_scope,
      },
      evidenceIds: page.entity_ids,
    });
  }
  if (site === "tripcost") {
    return decisionFingerprint({
      graphPath: page.family,
      recommendation: {
        modes: payload.modes,
        km: payload.km,
        tolls: payload.tolls,
        break_even: payload.break_even,
        price_kind: payload.price_kind,
      },
      limitingFactors: {
        from: payload.from,
        to: payload.to,
        live_fare: payload.live_fare ?? false,
        fare_provider: payload.fare_provider ?? null,
      },
      evidenceIds: page.entity_ids,
    });
  }
  return decisionFingerprint({
    graphPath: `${page.site}:${page.family}`,
    recommendation: payload.decision ?? payload.answer ?? payload.codes ?? payload.slug,
    limitingFactors: payload.distinct_reason ?? page.family,
    evidenceIds: page.entity_ids,
  });
}

export const SCALE_QUALITY_BANDS = ["<60", "60-69", "70-79", "80-89", "90+"] as const;
export type ScaleQualityBand = (typeof SCALE_QUALITY_BANDS)[number];

export function scaleQualityBand(score: number): ScaleQualityBand {
  if (score < 60) return "<60";
  if (score < 70) return "60-69";
  if (score < 80) return "70-79";
  if (score < 90) return "80-89";
  return "90+";
}

export function scaleQualityDistribution(pages: Array<{ quality_score: number }>): Record<ScaleQualityBand, number> {
  const out: Record<ScaleQualityBand, number> = { "<60": 0, "60-69": 0, "70-79": 0, "80-89": 0, "90+": 0 };
  for (const page of pages) out[scaleQualityBand(page.quality_score)] += 1;
  return out;
}

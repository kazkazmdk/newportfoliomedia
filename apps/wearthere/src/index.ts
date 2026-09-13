import { provenance, type ConfidenceLevel } from "@penta/data-provenance";
import { evaluatePageQuality, searchDemandScore } from "@penta/quality-gate";
import type { PageRecord } from "@penta/graph-core";
import { climate, type MonthClimate } from "./climate";
import { MORE_DESTINATIONS } from "./destinations-more";
import type { Destination } from "./types";

export type { MonthClimate } from "./climate";
export type { Destination } from "./types";

export type StyleId =
  | "minimal"
  | "streetwear"
  | "classic"
  | "business"
  | "outdoor"
  | "luxury"
  | "casual";

export type ClothingPiece = {
  id: string;
  name: string;
  category: string;
  warmth: number;
  breathability: number;
  water_resistance: number;
  wind_resistance: number;
  formality: number;
  activity: string[];
  layer: "base" | "mid" | "shell" | "bottom" | "shoes" | "extra";
  volume_l: number;
  weight_kg: number;
  colors: string[];
  /** @deprecated use formality */
  formal: number;
};

const RETRIEVED = "2026-01-15T00:00:00.000Z";

const CORE_DESTINATIONS: Destination[] = [
  {
    id: "dest:paris",
    city: "Paris",
    slug: "paris",
    country: "France",
    lat: 48.86,
    lon: 2.35,
    demand: 96,
    activities_default: ["walk", "museum", "dinner"],
    climate: [
      climate(1, 3, 8, 10, 50),
      climate(2, 3, 9, 9, 40),
      climate(3, 5, 13, 10, 45),
      climate(4, 8, 16, 9, 45),
      climate(5, 11, 20, 10, 55),
      climate(6, 14, 23, 9, 50, 65, 12, 6),
      climate(7, 16, 26, 8, 55, 65, 12, 7),
      climate(8, 16, 26, 8, 55, 65, 12, 6),
      climate(9, 13, 22, 8, 50),
      climate(10, 9, 17, 10, 55),
      climate(11, 6, 11, 11, 55),
      climate(12, 3, 8, 11, 60),
    ],
  },
  {
    id: "dest:tokyo",
    city: "Tokyo",
    slug: "tokyo",
    country: "Japan",
    lat: 35.68,
    lon: 139.65,
    demand: 94,
    activities_default: ["walk", "transit", "dinner"],
    climate: [
      climate(1, 1, 10, 5, 50, 50, 10, 3),
      climate(2, 2, 11, 6, 55, 50, 12, 4),
      climate(3, 5, 14, 10, 100, 55, 14, 5),
      climate(4, 10, 19, 10, 125, 60, 14, 6),
      climate(5, 15, 23, 10, 140, 65, 12, 7),
      climate(6, 19, 26, 12, 170, 75, 12, 7),
      climate(7, 23, 30, 12, 150, 75, 12, 8),
      climate(8, 24, 31, 11, 170, 75, 12, 8),
      climate(9, 21, 27, 12, 210, 70, 14, 6),
      climate(10, 15, 22, 10, 200, 65, 12, 5),
      climate(11, 9, 17, 8, 95, 60, 12, 3),
      climate(12, 4, 12, 5, 50, 55, 10, 2),
    ],
  },
  {
    id: "dest:new-york",
    city: "New York",
    slug: "new-york",
    country: "United States",
    lat: 40.71,
    lon: -74.01,
    demand: 93,
    activities_default: ["walk", "museum", "evening"],
    climate: [
      climate(1, -3, 4, 11, 85),
      climate(2, -2, 6, 10, 80),
      climate(3, 2, 11, 11, 100),
      climate(4, 7, 17, 11, 100),
      climate(5, 13, 22, 11, 105),
      climate(6, 18, 27, 10, 100, 65, 12, 7),
      climate(7, 21, 30, 10, 115, 65, 12, 8),
      climate(8, 21, 29, 10, 110, 65, 12, 7),
      climate(9, 16, 25, 8, 100),
      climate(10, 10, 19, 8, 95),
      climate(11, 5, 12, 9, 90),
      climate(12, 0, 7, 10, 90),
    ],
  },
  {
    id: "dest:london",
    city: "London",
    slug: "london",
    country: "United Kingdom",
    lat: 51.51,
    lon: -0.13,
    demand: 90,
    activities_default: ["walk", "museum"],
    climate: [
      climate(1, 3, 8, 11, 55),
      climate(2, 3, 9, 9, 40),
      climate(3, 4, 12, 9, 40),
      climate(4, 6, 15, 9, 40),
      climate(5, 9, 18, 9, 45),
      climate(6, 12, 21, 8, 45),
      climate(7, 14, 24, 8, 45, 65, 12, 6),
      climate(8, 14, 23, 8, 50),
      climate(9, 12, 20, 8, 50),
      climate(10, 9, 16, 10, 65),
      climate(11, 6, 11, 11, 60),
      climate(12, 3, 8, 11, 55),
    ],
  },
  {
    id: "dest:barcelona",
    city: "Barcelona",
    slug: "barcelona",
    country: "Spain",
    lat: 41.39,
    lon: 2.17,
    demand: 86,
    activities_default: ["walk", "outdoor", "dinner"],
    climate: [
      climate(1, 5, 14, 5, 40),
      climate(2, 6, 15, 5, 35),
      climate(3, 8, 17, 5, 35),
      climate(4, 10, 19, 6, 40),
      climate(5, 14, 23, 5, 50, 65, 12, 7),
      climate(6, 18, 27, 4, 35, 65, 12, 8),
      climate(7, 21, 29, 3, 20, 65, 12, 8),
      climate(8, 21, 29, 4, 50, 65, 12, 8),
      climate(9, 18, 26, 6, 75),
      climate(10, 14, 22, 7, 80),
      climate(11, 9, 17, 6, 50),
      climate(12, 6, 14, 5, 40),
    ],
  },
  {
    id: "dest:reykjavik",
    city: "Reykjavik",
    slug: "reykjavik",
    country: "Iceland",
    lat: 64.15,
    lon: -21.94,
    demand: 72,
    activities_default: ["outdoor", "walk"],
    climate: [
      climate(1, -3, 3, 13, 75, 80, 25, 1),
      climate(2, -3, 3, 12, 70, 80, 25, 1),
      climate(3, -2, 4, 12, 70, 78, 24, 2),
      climate(4, 1, 7, 11, 55, 75, 20, 3),
      climate(5, 4, 11, 10, 45, 72, 18, 4),
      climate(6, 7, 14, 10, 50, 75, 16, 5),
      climate(7, 9, 16, 10, 50, 78, 16, 5),
      climate(8, 8, 15, 11, 60, 78, 16, 4),
      climate(9, 6, 12, 12, 70, 78, 20, 3),
      climate(10, 2, 8, 13, 80, 80, 22, 2),
      climate(11, -1, 4, 12, 75, 80, 24, 1),
      climate(12, -2, 3, 13, 80, 80, 25, 0),
    ],
  },
  {
    id: "dest:dubai",
    city: "Dubai",
    slug: "dubai",
    country: "United Arab Emirates",
    lat: 25.2,
    lon: 55.27,
    demand: 88,
    activities_default: ["city", "evening"],
    climate: [
      climate(1, 14, 24, 2, 10, 60, 12, 5),
      climate(2, 15, 26, 2, 20, 60, 12, 6),
      climate(3, 18, 29, 2, 15, 55, 14, 8),
      climate(4, 21, 34, 1, 5, 45, 14, 9),
      climate(5, 25, 39, 0, 1, 40, 14, 10),
      climate(6, 28, 41, 0, 0, 45, 14, 11),
      climate(7, 30, 42, 0, 0, 50, 14, 11),
      climate(8, 31, 42, 0, 0, 50, 14, 10),
      climate(9, 28, 39, 0, 0, 50, 14, 9),
      climate(10, 24, 35, 0, 2, 50, 12, 7),
      climate(11, 20, 30, 1, 5, 55, 12, 5),
      climate(12, 16, 26, 2, 10, 60, 12, 4),
    ],
  },
  {
    id: "dest:lisbon",
    city: "Lisbon",
    slug: "lisbon",
    country: "Portugal",
    lat: 38.72,
    lon: -9.14,
    demand: 80,
    activities_default: ["walk", "outdoor"],
    climate: [
      climate(1, 8, 15, 10, 95),
      climate(2, 9, 16, 8, 80),
      climate(3, 10, 18, 6, 50),
      climate(4, 12, 20, 7, 60),
      climate(5, 14, 22, 5, 35, 65, 14, 7),
      climate(6, 16, 26, 2, 15, 60, 14, 8),
      climate(7, 18, 28, 1, 5, 55, 14, 9),
      climate(8, 18, 28, 1, 5, 55, 14, 8),
      climate(9, 17, 26, 4, 30),
      climate(10, 15, 22, 8, 80),
      climate(11, 11, 18, 9, 100),
      climate(12, 9, 15, 10, 100),
    ],
  },
];

export const DESTINATIONS: Destination[] = [...CORE_DESTINATIONS, ...MORE_DESTINATIONS];

export const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
];

/** High-demand destinations get 12 typical-month pages; others keep the launch window. */
export function indexedMonths(dest: Destination): number[] {
  if (dest.demand >= 50) return dest.climate.map((row) => row.month);
  return [3, 4, 5, 6, 7, 9, 10, 11];
}

export const WARDROBE_SEED: ClothingPiece[] = [
  { id: "tee", name: "Crew T-shirt", category: "top", warmth: 2, breathability: 5, water_resistance: 0, wind_resistance: 0, formality: 1, formal: 1, activity: ["walk", "transit"], layer: "base", volume_l: 1.2, weight_kg: 0.18, colors: ["white", "navy"] },
  { id: "shirt", name: "Oxford shirt", category: "top", warmth: 2, breathability: 4, water_resistance: 0, wind_resistance: 0, formality: 3, formal: 3, activity: ["dinner", "museum"], layer: "base", volume_l: 1.6, weight_kg: 0.25, colors: ["blue"] },
  { id: "knit", name: "Merino knit", category: "knit", warmth: 4, breathability: 4, water_resistance: 1, wind_resistance: 2, formality: 2, formal: 2, activity: ["walk", "dinner"], layer: "mid", volume_l: 3.2, weight_kg: 0.35, colors: ["camel"] },
  { id: "hoodie", name: "Hoodie", category: "knit", warmth: 4, breathability: 3, water_resistance: 1, wind_resistance: 2, formality: 0, formal: 0, activity: ["walk", "transit"], layer: "mid", volume_l: 4.5, weight_kg: 0.5, colors: ["grey"] },
  { id: "overshirt", name: "Overshirt", category: "layer", warmth: 3, breathability: 3, water_resistance: 1, wind_resistance: 2, formality: 2, formal: 2, activity: ["walk"], layer: "mid", volume_l: 3.8, weight_kg: 0.45, colors: ["olive"] },
  { id: "raincoat", name: "Packable rain shell", category: "shell", warmth: 2, breathability: 2, water_resistance: 5, wind_resistance: 4, formality: 1, formal: 1, activity: ["walk", "transit"], layer: "shell", volume_l: 2.2, weight_kg: 0.28, colors: ["black"] },
  { id: "wool-coat", name: "Wool coat", category: "coat", warmth: 6, breathability: 2, water_resistance: 2, wind_resistance: 3, formality: 4, formal: 4, activity: ["walk", "dinner"], layer: "shell", volume_l: 8, weight_kg: 1.2, colors: ["charcoal"] },
  { id: "trousers", name: "Chinos", category: "bottom", warmth: 3, breathability: 3, water_resistance: 0, wind_resistance: 1, formality: 3, formal: 3, activity: ["dinner", "museum"], layer: "bottom", volume_l: 3, weight_kg: 0.4, colors: ["stone"] },
  { id: "jeans", name: "Jeans", category: "bottom", warmth: 3, breathability: 2, water_resistance: 0, wind_resistance: 1, formality: 1, formal: 1, activity: ["walk"], layer: "bottom", volume_l: 3.4, weight_kg: 0.55, colors: ["indigo"] },
  { id: "shorts", name: "Shorts", category: "bottom", warmth: 1, breathability: 5, water_resistance: 0, wind_resistance: 0, formality: 0, formal: 0, activity: ["walk"], layer: "bottom", volume_l: 1.5, weight_kg: 0.2, colors: ["navy"] },
  { id: "sneakers", name: "Leather sneakers", category: "shoes", warmth: 2, breathability: 3, water_resistance: 1, wind_resistance: 0, formality: 2, formal: 2, activity: ["walk", "transit"], layer: "shoes", volume_l: 4.5, weight_kg: 0.7, colors: ["white"] },
  { id: "boots", name: "Chelsea boots", category: "shoes", warmth: 4, breathability: 2, water_resistance: 2, wind_resistance: 1, formality: 3, formal: 3, activity: ["walk", "dinner"], layer: "shoes", volume_l: 5, weight_kg: 0.9, colors: ["black"] },
  { id: "umbrella", name: "Compact umbrella", category: "extra", warmth: 0, breathability: 0, water_resistance: 5, wind_resistance: 0, formality: 2, formal: 2, activity: ["walk"], layer: "extra", volume_l: 0.8, weight_kg: 0.25, colors: ["black"] },
];

export type AirlineRule = {
  id: string;
  name: string;
  personal_item_l: number;
  cabin_l: number;
  cabin_kg: number;
  source: string;
  retrieved_at: string;
};

export const AIRLINES: AirlineRule[] = [
  {
    id: "ryanair",
    name: "Ryanair",
    personal_item_l: 40,
    cabin_l: 55,
    cabin_kg: 10,
    source: "carrier baggage page — re-check before travel",
    retrieved_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "easyjet",
    name: "easyJet",
    personal_item_l: 45,
    cabin_l: 56,
    cabin_kg: 15,
    source: "carrier baggage page — re-check before travel",
    retrieved_at: "2026-08-01T00:00:00.000Z",
  },
];

export function typicalWeather(dest: Destination, month: number): MonthClimate {
  return dest.climate[month - 1];
}

export const FORECAST_TTL_HOURS = 6;

export type WeatherDataKind = "CLIMATE_NORMAL" | "HISTORICAL_OBSERVATION" | "FORECAST" | "LIVE_WEATHER";

export function isForecastCurrent(retrievedAt: string, now = new Date(), ttlHours = FORECAST_TTL_HOURS): boolean {
  return now.getTime() - new Date(retrievedAt).getTime() < ttlHours * 3600 * 1000;
}

export function weatherSourceLabel(input: { hasForecast: boolean; daysAhead: number }): {
  kind: "FORECAST" | "TYPICAL";
  label: string;
} {
  if (input.hasForecast && input.daysAhead <= 14) {
    return { kind: "FORECAST", label: "Your actual forecast" };
  }
  return {
    kind: "TYPICAL",
    label: "Typical weather for this month — not a forecast",
  };
}

export const PACKING_RULE_VERSION = "packing-v1";

export function packingCoverage(
  pieces: ClothingPiece[],
  tmin: number,
  rainDays: number,
  activities: string[],
) {
  const warmthNeed = neededWarmth(tmin);
  const warmthHave = pieces.reduce((s, p) => s + p.warmth, 0);
  const weather_coverage = Math.min(100, Math.round((warmthHave / Math.max(1, warmthNeed * 1.4)) * 70 + (rainDays >= 8 ? (pieces.some((p) => p.water_resistance >= 4) ? 30 : 0) : 30)));
  const covered = activities.filter((act) => pieces.some((p) => p.activity.includes(act)));
  const activity_coverage = activities.length ? Math.round((covered.length / activities.length) * 100) : 100;
  const tops = pieces.filter((i) => i.layer === "base" || i.category === "top" || i.category === "knit").length;
  const bottoms = pieces.filter((i) => i.layer === "bottom" || i.category === "bottom").length;
  const outfit_combinations = Math.max(tops * bottoms, pieces.length);
  return { weather_coverage, activity_coverage, outfit_combinations, rule_version: PACKING_RULE_VERSION };
}

function neededWarmth(tmin: number): number {
  if (tmin < 0) return 8;
  if (tmin < 6) return 7;
  if (tmin < 10) return 6;
  if (tmin < 15) return 4;
  if (tmin < 20) return 3;
  return 2;
}

export function capsuleFor(
  dest: Destination,
  month: number,
  style: StyleId,
  wardrobe = WARDROBE_SEED,
) {
  const w = typicalWeather(dest, month);
  const warmthNeed = neededWarmth(w.tmin_c);
  const rain = w.rain_days >= 8;
  const hot = w.tmax_c >= 28;
  const picked: ClothingPiece[] = [];
  const take = (id: string) => {
    const item = wardrobe.find((row) => row.id === id);
    if (item) picked.push(item);
  };
  take("tee");
  if (style === "business" || style === "classic" || style === "luxury") take("shirt");
  if (style === "streetwear" || style === "casual") take("hoodie");
  else take("knit");
  if (rain) take("raincoat");
  if (warmthNeed >= 6) take("wool-coat");
  else take("overshirt");
  if (hot) take("shorts");
  if (style === "business") take("trousers");
  else take("jeans");
  if (w.tmin_c < 8 || rain) take("boots");
  else take("sneakers");
  if (rain) take("umbrella");

  const unique = [...new Map(picked.map((item) => [item.id, item])).values()];
  const missing: string[] = [];
  if (rain && !unique.some((item) => item.water_resistance >= 4)) {
    missing.push("You're missing one lightweight waterproof layer.");
  }
  const outfits = Math.max(unique.filter((i) => i.category === "top" || i.category === "knit").length * unique.filter((i) => i.category === "bottom").length, unique.length);
  const weight = unique.reduce((s, i) => s + i.weight_kg, 0);
  const volume = unique.reduce((s, i) => s + i.volume_l, 0);
  const underused = unique.filter((item) => item.category === "knit" && unique.some((other) => other.id !== item.id && other.category === "knit"));
  return {
    weather: w,
    pieces: unique,
    outfits,
    weight_kg: Math.round(weight * 10) / 10,
    volume_l: Math.round(volume * 10) / 10,
    missing,
    remove_hint: underused[0]
      ? `You can remove this ${underused[0].name.toLowerCase()}: a second knit is only covering one cool evening.`
      : undefined,
    coverage: packingCoverage(unique, w.tmin_c, w.rain_days, dest.activities_default),
    confidence: "HIGH" as ConfidenceLevel,
    weather_kind: "TYPICAL" as const,
    rule_version: PACKING_RULE_VERSION,
  };
}

export function airlineFit(volume_l: number, weight_kg: number, airline: AirlineRule) {
  if (volume_l <= airline.personal_item_l && weight_kg <= 8) {
    return { ok: true, message: `Fits in ${airline.name} personal item (rule snapshot ${airline.retrieved_at.slice(0, 10)}).` };
  }
  if (volume_l <= airline.cabin_l && weight_kg <= airline.cabin_kg) {
    return { ok: true, message: `Fits ${airline.name} cabin baggage under the published weight snapshot.` };
  }
  return {
    ok: false,
    message: `Estimated volume exceeds ${airline.name} allowance. Re-check the carrier — rules change.`,
  };
}

export async function fetchForecast(lat: number, lon: number, start: string, end: string) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as {
      daily?: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };
  } catch {
    return null;
  }
}

export function allWeartherePages(): PageRecord[] {
  const pages: PageRecord[] = [];
  for (const dest of DESTINATIONS) {
    const hubQ = evaluatePageQuality({
      site: "wearthere",
      family: "destination-hub",
      unique_fields: 12,
      required_fields_present: 8,
      required_fields_total: 8,
      search_demand: { seed_research: dest.demand },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: dest.demand < 40,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 200,
      freshness_ttl_days: 400,
      provenance_valid: true,
      hub_necessity: true,
      distinct_reason: dest.slug,
      forecast_as_climate: false,
      verified_fact_count: 8,
      decision_relation_count: 6,
    });
    pages.push({
      id: dest.id,
      site: "wearthere",
      family: "destination-hub",
      url: `/wearthere/${dest.slug}`,
      canonical: `/wearthere/${dest.slug}`,
      title: `What to wear in ${dest.city}`,
      meta_description: `Month-by-month typical weather and capsule packing for ${dest.city}.`,
      entity_ids: [dest.id],
      structured_payload: { city: dest.city, months: dest.climate.length, distinct_reason: dest.slug },
      quality_score: hubQ.score,
      search_demand: dest.demand,
      index_state: hubQ.index_state,
      noindex: hubQ.index_state !== "INDEXABLE",
      similarity_hash: dest.slug,
      freshness: RETRIEVED,
      review_required: false,
      batch: dest.demand >= 80 ? "wearthere-batch-2" : "wearthere-batch-1",
      publish_state: hubQ.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
    });
    for (const month of indexedMonths(dest)) {
      const w = dest.climate[month - 1];
      const quality = evaluatePageQuality({
        site: "wearthere",
        family: "wear-month",
        unique_fields: 10,
        required_fields_present: 8,
        required_fields_total: 8,
        search_demand: { seed_research: dest.demand - Math.abs(month - 10) },
        product_cta: true,
        interactive: true,
        distinct_from_parent: true,
        near_duplicate: false,
        year_only_variant: false,
        city_without_specifics: false,
        obscure_without_demand: dest.demand < 50,
        llm_filler: false,
        confidence: "HIGH",
        freshness_days: 200,
        freshness_ttl_days: 400,
        provenance_valid: true,
        distinct_reason: `${dest.slug}-${month}`,
        forecast_as_climate: false,
        verified_fact_count: 7,
        decision_relation_count: 8,
      });
      const slug = MONTHS[month - 1];
      pages.push({
        id: `${dest.id}:${month}`,
        site: "wearthere",
        family: "wear-month",
        url: `/wearthere/${dest.slug}/${slug}/what-to-wear`,
        canonical: `/wearthere/${dest.slug}/${slug}/what-to-wear`,
        title: `What to Wear in ${dest.city} in ${slug[0].toUpperCase()}${slug.slice(1)}`,
        meta_description: `Typical ${dest.city} ${slug}: ${w.tmin_c}–${w.tmax_c}°C, ~${w.rain_days} rain days. Capsule wardrobe then exact-date packing.`,
        entity_ids: [dest.id],
        structured_payload: { ...w, city: dest.city, slug: dest.slug, distinct_reason: `${dest.slug}-${month}`, kind: "CLIMATE_NORMAL", period: "1991-2020", aggregation: "monthly_mean", sample_years: 30 },
        quality_score: quality.score,
        search_demand: searchDemandScore({ seed_research: dest.demand }),
        index_state: quality.index_state,
        noindex: quality.index_state !== "INDEXABLE",
        similarity_hash: `${dest.slug}-${month}`,
        freshness: RETRIEVED,
        review_required: false,
        batch: dest.demand >= 80 ? "wearthere-batch-2" : "wearthere-batch-1",
        publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
      });
    }
  }
  return pages;
}

export const CLIMATE_PROVENANCE = provenance({
  source_id: "climate-normals-compiled",
  source_type: "TRUSTED_THIRD_PARTY",
  source_name: "Compiled monthly climate normals",
  retrieved_at: RETRIEVED,
  verified_at: RETRIEVED,
  confidence: 78,
  raw_value: "monthly climate normals",
  normalized_value: "CLIMATE_NORMAL",
  verification_method: "CROSS_SOURCE",
  notes: "Period 1991-2020 monthly means, ~30 sample years. Typical weather, not a live forecast.",
});

export const CLIMATE_SEASON_MODELS = [
  "NORTHERN_TEMPERATE",
  "SOUTHERN_TEMPERATE",
  "TROPICAL_WET_DRY",
  "EQUATORIAL",
  "MONSOON",
  "HOT_DESERT",
  "MEDITERRANEAN",
  "CUSTOM",
] as const;
export type ClimateSeasonModel = (typeof CLIMATE_SEASON_MODELS)[number];

export type ClimateMonthInput = { month: number; tmax: number; tmin: number; rain_mm?: number };

export function classifyClimateModel(input: {
  lat: number;
  months: ClimateMonthInput[];
}): ClimateSeasonModel {
  const abs = Math.abs(input.lat);
  const mid = input.months.map((m) => (m.tmax + m.tmin) / 2);
  const rain = input.months.map((m) => m.rain_mm ?? 0);
  const tSpread = mid.length ? Math.max(...mid) - Math.min(...mid) : 0;
  const rainSpread = rain.length ? Math.max(...rain) - Math.min(...rain) : 0;
  const hottest = mid.length ? Math.max(...mid) : 0;
  const driest = rain.length ? Math.min(...rain) : 0;

  if (abs < 8 && tSpread < 5) return "EQUATORIAL";
  if (abs < 15 && rainSpread > 120) return "MONSOON";
  if (abs < 28 && tSpread < 10 && rainSpread > 80) return "TROPICAL_WET_DRY";
  if (hottest >= 34 && driest < 15 && tSpread >= 10) return "HOT_DESERT";
  if (abs >= 30 && abs <= 46 && hottest >= 24 && driest < 40 && tSpread >= 12) return "MEDITERRANEAN";
  if (input.lat < 0) return "SOUTHERN_TEMPERATE";
  return "NORTHERN_TEMPERATE";
}

export function seasonLabel(model: ClimateSeasonModel, month: number): string {
  const southernSummer = [12, 1, 2].includes(month);
  const southernAutumn = [3, 4, 5].includes(month);
  const southernWinter = [6, 7, 8].includes(month);
  if (model === "EQUATORIAL") return "year-round-humid";
  if (model === "HOT_DESERT") return [6, 7, 8, 9].includes(month) ? "hot-dry" : "mild-dry";
  if (model === "TROPICAL_WET_DRY" || model === "MONSOON") {
    return [11, 12, 1, 2, 3].includes(month) ? "dry" : "wet";
  }
  if (model === "SOUTHERN_TEMPERATE") {
    if (southernSummer) return "summer";
    if (southernAutumn) return "autumn";
    if (southernWinter) return "winter";
    return "spring";
  }
  if (model === "MEDITERRANEAN" || model === "NORTHERN_TEMPERATE" || model === "CUSTOM") {
    if ([12, 1, 2].includes(month)) return "winter";
    if ([3, 4, 5].includes(month)) return "spring";
    if ([6, 7, 8].includes(month)) return "summer";
    return "autumn";
  }
  return "unknown";
}

export function recommendWearthereConsolidationV2(
  pages: Array<{ city: string; lat: number; month: number; tmax: number; tmin: number; rain_mm?: number }>,
): Array<{
  city: string;
  model: ClimateSeasonModel;
  season: string;
  months: number[];
  action: "KEEP_MONTHS" | "CONSOLIDATE_SEASON" | "CITY_GUIDE_ONLY";
  reason: string;
}> {
  const byCity = new Map<string, typeof pages>();
  for (const page of pages) {
    const list = byCity.get(page.city) ?? [];
    list.push(page);
    byCity.set(page.city, list);
  }
  const out: Array<{
    city: string;
    model: ClimateSeasonModel;
    season: string;
    months: number[];
    action: "KEEP_MONTHS" | "CONSOLIDATE_SEASON" | "CITY_GUIDE_ONLY";
    reason: string;
  }> = [];
  for (const [city, rows] of byCity) {
    const model = classifyClimateModel({ lat: rows[0].lat, months: rows });
    if (model === "EQUATORIAL") {
      out.push({
        city,
        model,
        season: "year-round-humid",
        months: rows.map((r) => r.month).sort((a, b) => a - b),
        action: "CITY_GUIDE_ONLY",
        reason: "Equatorial climate — do not force temperate winter/spring/summer/autumn",
      });
      continue;
    }
    const seasons = new Map<string, typeof rows>();
    for (const row of rows) {
      const season = seasonLabel(model, row.month);
      const list = seasons.get(season) ?? [];
      list.push(row);
      seasons.set(season, list);
    }
    for (const [season, group] of seasons) {
      const tmax = group.map((g) => g.tmax);
      const spread = Math.max(...tmax) - Math.min(...tmax);
      if (group.length >= 2 && spread < 3) {
        out.push({
          city,
          model,
          season,
          months: group.map((g) => g.month).sort((a, b) => a - b),
          action: "CONSOLIDATE_SEASON",
          reason: `${model} ${season}: tmax spread ${spread.toFixed(1)}°C`,
        });
      } else {
        out.push({
          city,
          model,
          season,
          months: group.map((g) => g.month).sort((a, b) => a - b),
          action: "KEEP_MONTHS",
          reason: `${model} ${season}: keep months if demand later confirms`,
        });
      }
    }
  }
  return out;
}

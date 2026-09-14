import type { PageRecord, SiteId } from "@penta/graph-core";

const MONTH_NAME: Record<number, string> = {
  1: "january",
  2: "february",
  3: "march",
  4: "april",
  5: "may",
  6: "june",
  7: "july",
  8: "august",
  9: "september",
  10: "october",
  11: "november",
  12: "december",
};

function uniq(values: Array<string | undefined | null>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const v = (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out.slice(0, 7);
}

export function queryClusterFor(page: Pick<PageRecord, "site" | "family" | "title" | "structured_payload">): string[] {
  const p = page.structured_payload;
  if (page.site === "fixcode") {
    const brand = String(p.brand ?? "");
    const appliance = String(p.appliance ?? "");
    const code = String(p.code ?? "");
    if (!code) return uniq([page.title]);
    return uniq([
      `${brand} ${code} error`,
      `${brand} ${appliance} ${code}`,
      `${brand} error code ${code}`,
      `${code} ${brand} ${appliance}`.trim(),
      `what does ${code} mean on ${brand} ${appliance}`,
    ]);
  }
  if (page.site === "autospec") {
    const vehicle = String(p.vehicle ?? p.distinct_reason ?? "").replace(/^veh:/, "").replace(/:/g, " ");
    const label = vehicle || String(p.engine ?? page.title);
    if (page.family.includes("oil")) {
      return uniq([
        `${label} oil capacity`,
        `${label} oil type`,
        `${label} engine oil`,
        `${label} engine oil capacity`,
      ]);
    }
    if (page.family.includes("coolant")) {
      return uniq([`${label} coolant capacity`, `${label} coolant type`, `${label} engine coolant`]);
    }
    if (page.family === "tyre-pressure") return uniq([`${label} tyre pressure`, `${label} tire pressure`]);
    if (page.family === "battery") return uniq([`${label} battery type`, `${label} agm battery`]);
    return uniq([`${label} service schedule`, `${label} maintenance`]);
  }
  if (page.site === "wearthere") {
    const city = String(p.city ?? p.slug ?? "");
    const monthNum = Number(p.month);
    const month = MONTH_NAME[monthNum] ?? String(p.month ?? "");
    if (city && month) {
      return uniq([
        `what to wear in ${city} in ${month}`,
        `${city} ${month} packing list`,
        `what clothes for ${city} ${month}`,
        `${city} weather clothes ${month}`,
      ]);
    }
    return uniq([`what to wear in ${city}`, `${city} packing list`]);
  }
  if (page.site === "chargematch") {
    const device = String(p.device ?? p.slug ?? "");
    const charger = String(p.charger ?? "");
    if (device && charger) {
      return uniq([
        `can I use ${charger} with ${device}`,
        `${device} ${charger} wattage`,
        `${device} charger compatibility`,
      ]);
    }
    return uniq([
      `${device} charger wattage`,
      `${device} max charging wattage`,
      `best charger for ${device}`,
      `${device} 20w vs 30w`,
    ]);
  }
  if (page.site === "tripcost") {
    const from = String(p.from ?? "").replace(/-/g, " ");
    const to = String(p.to ?? "").replace(/-/g, " ");
    const route = String(p.route ?? `${from} ${to}`);
    return uniq([
      `${from} to ${to} drive vs train cost`,
      `cost to drive ${from} ${to}`,
      `${from} ${to} car vs train`,
      `${route} trip cost`,
    ]);
  }
  return uniq([page.title]);
}

/** Northern-temperate calendar only. Prefer seasonLabel(classifyClimateModel(...)). */
export function wearthereSeason(month: number): "winter" | "spring" | "summer" | "autumn" | "unknown" {
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  if ([9, 10, 11].includes(month)) return "autumn";
  return "unknown";
}

export function recommendWearthereConsolidation(
  pages: Array<{ city: string; month: number; tmax: number; tmin: number }>,
): Array<{ city: string; season: string; months: number[]; action: "KEEP_MONTHS" | "CONSOLIDATE_SEASON"; reason: string }> {
  const byCity = new Map<string, typeof pages>();
  for (const page of pages) {
    const list = byCity.get(page.city) ?? [];
    list.push(page);
    byCity.set(page.city, list);
  }
  const out: Array<{ city: string; season: string; months: number[]; action: "KEEP_MONTHS" | "CONSOLIDATE_SEASON"; reason: string }> = [];
  for (const [city, rows] of byCity) {
    const seasons = new Map<string, typeof rows>();
    for (const row of rows) {
      const season = wearthereSeason(row.month);
      const list = seasons.get(season) ?? [];
      list.push(row);
      seasons.set(season, list);
    }
    for (const [season, group] of seasons) {
      if (group.length < 2) {
        out.push({ city, season, months: group.map((g) => g.month), action: "KEEP_MONTHS", reason: "single month in season" });
        continue;
      }
      const tmax = group.map((g) => g.tmax);
      const spread = Math.max(...tmax) - Math.min(...tmax);
      if (spread < 3) {
        out.push({
          city,
          season,
          months: group.map((g) => g.month).sort((a, b) => a - b),
          action: "CONSOLIDATE_SEASON",
          reason: `tmax spread ${spread.toFixed(1)}°C — prefer "${season} in ${city}" over thin month pages`,
        });
      } else {
        out.push({
          city,
          season,
          months: group.map((g) => g.month).sort((a, b) => a - b),
          action: "KEEP_MONTHS",
          reason: `tmax spread ${spread.toFixed(1)}°C is enough to keep months if demand later confirms`,
        });
      }
    }
  }
  return out;
}

export function siteDefaultLocale(site: SiteId): string {
  if (site === "tripcost") return "en";
  return "en";
}

/** If the query/SERP is more specific than our known vehicle scope, demand cannot index. */
export function autospecScopeMismatch(payload: Record<string, unknown>, queries: string[]): string | undefined {
  const text = queries.join(" ").toLowerCase();
  const mentionsYear = /\b(19|20)\d{2}\b/.test(text);
  const mentionsGen = /\b(g1\d|g2\d|f[123]\d|e[3469]\d|mk\s?\d)\b/i.test(text);
  const hasYear = Boolean(payload.year || payload.years || payload.year_from || payload.year_to);
  const hasGen = Boolean(payload.generation || payload.gen);
  const hasEngine = Boolean(payload.engine || payload.engine_code);
  const hasVehicle = Boolean(payload.vehicle);
  if (mentionsYear && !hasYear) {
    return "AutoSpec query names a year that is not in the known vehicle scope — REVIEW_REQUIRED";
  }
  if (mentionsGen && !hasGen) {
    return "AutoSpec query names a generation that is not in the known vehicle scope — REVIEW_REQUIRED";
  }
  if (/\b(oil|coolant)\b/.test(text) && !hasEngine && !hasVehicle) {
    return "AutoSpec fluid query lacks engine/vehicle identity — REVIEW_REQUIRED";
  }
  return undefined;
}

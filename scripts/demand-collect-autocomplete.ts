import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog, resetCatalogCache, resetDemandCache } from "@penta/catalog";
import { queryClusterFor } from "@penta/demand";
import { EXACT_OEM_KEYS } from "@penta/fixcode";

resetCatalogCache();
resetDemandCache();
const store = buildCatalog();
const pages = [...store.pages.values()];
const observedAt = new Date().toISOString();

type Hit = {
  pageId: string;
  site: string;
  query: string;
  locale: string;
  suggestions: string[];
  ok: boolean;
  status: number;
};

function pickPages() {
  const fix = pages.filter((p) => p.site === "fixcode" && p.family === "error-code");
  const rankedFix = [...fix].sort((a, b) => {
    const aExact = EXACT_OEM_KEYS.includes(
      `${String(a.structured_payload.brand_slug ?? "")}:${String(a.structured_payload.appliance_slug ?? "")}:${String(a.structured_payload.code ?? "").toLowerCase()}`,
    )
      ? 1
      : 0;
    const bExact = EXACT_OEM_KEYS.includes(
      `${String(b.structured_payload.brand_slug ?? "")}:${String(b.structured_payload.appliance_slug ?? "")}:${String(b.structured_payload.code ?? "").toLowerCase()}`,
    )
      ? 1
      : 0;
    return bExact - aExact || b.quality_score - a.quality_score;
  });
  const wear = pages.filter((p) => p.site === "wearthere" && (p.family === "destination-hub" || p.url.endsWith("/what-to-wear")));
  const charge = pages.filter((p) => p.site === "chargematch" && (p.family === "device-hub" || p.family === "device-wattage"));
  const auto = pages.filter((p) => p.site === "autospec");
  const trip = pages.filter((p) => p.site === "tripcost");
  return [
    ...rankedFix.slice(0, 60),
    ...wear.filter((p) => p.index_state === "SEO_CANDIDATE").slice(0, 30),
    ...charge.slice(0, 30),
    ...auto.slice(0, 15),
    ...trip.slice(0, 15),
  ];
}

async function suggest(query: string): Promise<{ status: number; suggestions: string[] }> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PentaDemandCollector/1.0 (prelaunch research; contact: ops)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { status: res.status, suggestions: [] };
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || !Array.isArray(json[1])) return { status: res.status, suggestions: [] };
    return { status: res.status, suggestions: json[1].filter((s): s is string => typeof s === "string").slice(0, 8) };
  } catch {
    return { status: 0, suggestions: [] };
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

async function main() {
  const selected = pickPages();
  const hits: Hit[] = [];
  for (const page of selected) {
    const query = queryClusterFor(page)[0] ?? page.title;
    const locale = "en-US";
    const { status, suggestions } = await suggest(query);
    hits.push({
      pageId: page.id,
      site: page.site,
      query,
      locale,
      suggestions,
      ok: status === 200 && suggestions.length > 0,
      status,
    });
    await new Promise((r) => setTimeout(r, 80));
  }

  const bySite = new Map<string, Hit[]>();
  for (const hit of hits) {
    const list = bySite.get(hit.site) ?? [];
    list.push(hit);
    bySite.set(hit.site, list);
  }

  const header = "page_id,query,country,source,observed,value,observed_at,notes,locale,collection_method,confidence,unit,language,raw_label";
  for (const [site, rows] of bySite) {
    const observed = rows.filter((r) => r.ok);
    const lines = [header];
    observed.forEach((row, i) => {
      lines.push(
        [
          row.pageId,
          csvEscape(row.query),
          "US",
          "AUTOCOMPLETE",
          "true",
          "",
          observedAt,
          csvEscape(`google-suggest status=${row.status} n=${row.suggestions.length}`),
          row.locale,
          "API",
          "0.55",
          "",
          "en",
          csvEscape(row.suggestions.slice(0, 5).join(" | ")),
        ].join(","),
      );
      void i;
    });
    writeFileSync(resolve(`data/demand/${site}/evidence.csv`), `${lines.join("\n")}\n`);
  }

  const batchHeader = "priority,wave,site,pageId,query,locale,signals,status,blocker";
  const batch = hits.map((h, i) => {
    const wave = h.site === "fixcode" ? "A" : h.site === "wearthere" ? "B" : h.site === "chargematch" ? "C" : h.site === "autospec" ? "D" : "E";
    const status = h.ok ? "autocomplete_observed" : h.status === 200 ? "empty_suggest" : "blocked";
    const blocker = h.ok ? "" : h.status === 0 ? "fetch failed" : `suggest HTTP ${h.status} or empty`;
    return [i + 1, wave, h.site, h.pageId, csvEscape(h.query), h.locale, "autocomplete", status, blocker].join(",");
  });
  writeFileSync(resolve("ops/DEMAND_COLLECTION_BATCH.csv"), `${batchHeader}\n${batch.join("\n")}\n`);

  const observed = hits.filter((h) => h.ok);
  const prelaunch = {
    generatedAt: observedAt,
    note: "Autocomplete-only. No SERP classification was performed. Path A/B/C remain 0 because STRONG_INTENT SERP was not observed. Do not treat autocomplete as launch validation.",
    attempted: hits.length,
    observed: observed.length,
    fresh: observed.length,
    localeValid: observed.length,
    strongIntent: 0,
    autocomplete: observed.length,
    paa: 0,
    related: 0,
    volume: 0,
    pathA: 0,
    pathB: 0,
    pathC: 0,
    rows: [] as unknown[],
  };
  writeFileSync(resolve("ops/PRELAUNCH_BATCH_V4.json"), JSON.stringify(prelaunch, null, 2));
  writeFileSync(
    resolve("ops/DEMAND_COLLECTION_RESULT.json"),
    JSON.stringify(
      {
        generatedAt: observedAt,
        attempted: hits.length,
        observed: observed.length,
        http200: hits.filter((h) => h.status === 200).length,
        bySite: Object.fromEntries(
          [...bySite.entries()].map(([site, rows]) => [site, { attempted: rows.length, observed: rows.filter((r) => r.ok).length }]),
        ),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ attempted: hits.length, observed: observed.length, http200: hits.filter((h) => h.status === 200).length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

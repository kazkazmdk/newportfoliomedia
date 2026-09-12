import { GraphStore, type GraphEntity, type GraphRelation, type PageRecord } from "@penta/graph-core";
import { structuredSimilarity } from "@penta/quality-gate";
import { ALL_ERRORS, ALL_SYMPTOMS, allFixcodePages } from "@penta/fixcode";
import { VEHICLES, allAutospecPages } from "@penta/autospec";
import { DESTINATIONS, allWeartherePages } from "@penta/wearthere";
import { DEVICES, CHARGERS, CABLES, allChargematchPages } from "@penta/chargematch";
import { ROUTES, allTripcostPages } from "@penta/tripcost";
import type { ConfidenceLevel } from "@penta/data-provenance";

function entity(
  partial: Omit<GraphEntity, "created_at" | "updated_at" | "provenance"> & { provenance?: GraphEntity["provenance"] },
): GraphEntity {
  return {
    provenance: [],
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...partial,
  };
}

function rel(partial: GraphRelation): GraphRelation {
  return partial;
}

let cached: GraphStore | null = null;

export function buildCatalog(): GraphStore {
  if (cached) return cached;
  const store = new GraphStore();

  for (const profile of ALL_ERRORS) {
    store.addEntity(
      entity({
        id: profile.id,
        site: "fixcode",
        type: "error_code",
        slug: `${profile.brand_slug}/${profile.appliance_slug}/${profile.code_slug}`,
        name: `${profile.brand} ${profile.appliance} ${profile.code}`,
        properties: { meaning: profile.meaning, models: profile.models },
        provenance: profile.provenance,
        confidence: profile.confidence,
      }),
    );
    for (const cause of profile.causes) {
      const id = `${profile.id}:cause:${cause.id}`;
      store.addEntity(
        entity({
          id,
          site: "fixcode",
          type: "cause",
          slug: cause.id,
          name: cause.name,
          properties: { prior: cause.prior, safety: cause.safety },
          confidence: profile.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${profile.id}->${cause.id}`,
          site: "fixcode",
          type: "has_cause",
          from_id: profile.id,
          to_id: id,
          properties: { prior: cause.prior },
          provenance: profile.provenance,
          confidence: profile.confidence,
          index_eligible: true,
        }),
      );
    }
  }
  for (const symptom of ALL_SYMPTOMS) {
    store.addEntity(
      entity({
        id: symptom.id,
        site: "fixcode",
        type: "symptom",
        slug: symptom.symptom_slug,
        name: `${symptom.brand} ${symptom.appliance} ${symptom.symptom}`,
        properties: { likely_codes: symptom.likely_codes },
        provenance: symptom.provenance,
        confidence: symptom.confidence,
      }),
    );
  }

  for (const vehicle of VEHICLES) {
    store.addEntity(
      entity({
        id: vehicle.id,
        site: "autospec",
        type: "vehicle",
        slug: `${vehicle.make_slug}/${vehicle.generation_slug}/${vehicle.variant_slug}`,
        name: `${vehicle.make} ${vehicle.model} ${vehicle.generation} ${vehicle.variant}`,
        properties: { engine: vehicle.engine_code, years: vehicle.years },
        confidence: vehicle.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->oil`,
        site: "autospec",
        type: "requires_fluid",
        from_id: vehicle.id,
        to_id: vehicle.id,
        properties: vehicle.oil,
        provenance: [],
        confidence: vehicle.confidence,
        index_eligible: vehicle.oil.capacity_liters > 0,
      }),
    );
  }

  for (const dest of DESTINATIONS) {
    store.addEntity(
      entity({
        id: dest.id,
        site: "wearthere",
        type: "destination",
        slug: dest.slug,
        name: dest.city,
        properties: { country: dest.country, lat: dest.lat, lon: dest.lon },
        confidence: "HIGH",
      }),
    );
  }

  for (const device of DEVICES) {
    store.addEntity(
      entity({
        id: device.id,
        site: "chargematch",
        type: "device",
        slug: device.slug,
        name: device.name,
        properties: { max_watts: device.max_watts },
        confidence: "HIGH",
      }),
    );
  }
  for (const charger of CHARGERS) {
    store.addEntity(
      entity({
        id: charger.id,
        site: "chargematch",
        type: "charger",
        slug: charger.slug,
        name: charger.name,
        properties: { total_watts: charger.total_watts },
        confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
      }),
    );
  }
  for (const cable of CABLES) {
    store.addEntity(
      entity({
        id: cable.id,
        site: "chargematch",
        type: "cable",
        slug: cable.slug,
        name: cable.name,
        properties: { max_watts: cable.max_watts, e_marker: cable.e_marker },
        confidence: (cable.tag === "UNKNOWN" ? "UNKNOWN" : "HIGH") as ConfidenceLevel,
      }),
    );
  }
  for (const device of DEVICES) {
    for (const charger of CHARGERS) {
      store.addRelation(
        rel({
          id: `${device.id}~${charger.id}`,
          site: "chargematch",
          type: "can_charge",
          from_id: charger.id,
          to_id: device.id,
          properties: { graph_only: true },
          provenance: [],
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
    }
  }

  for (const route of ROUTES) {
    store.addEntity(
      entity({
        id: route.id,
        site: "tripcost",
        type: "route",
        slug: `${route.from.slug}-to-${route.to.slug}`,
        name: `${route.from.name} → ${route.to.name}`,
        properties: { km: route.km },
        confidence: "MEDIUM",
      }),
    );
  }

  const pages = [
    ...allFixcodePages(),
    ...allAutospecPages(),
    ...allWeartherePages(),
    ...allChargematchPages(),
    ...allTripcostPages(),
  ];
  for (const page of pages) store.addPage(page);
  cached = store;
  return store;
}

export function launchReport() {
  const store = buildCatalog();
  const sites = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"] as const;
  const bySite = Object.fromEntries(sites.map((site) => [site, store.stats(site)]));
  const pages = [...store.pages.values()];
  const indexable = pages.filter((p) => p.index_state === "INDEXABLE");
  const avg =
    indexable.reduce((s, p) => s + p.quality_score, 0) / Math.max(1, indexable.length);
  const min = Math.min(...indexable.map((p) => p.quality_score), 100);
  const duplicates: Array<[PageRecord, PageRecord, number]> = [];
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      if (pages[i].site !== pages[j].site) continue;
      const sim = structuredSimilarity(pages[i].structured_payload, pages[j].structured_payload);
      if (sim >= 0.92 && pages[i].canonical !== pages[j].canonical) {
        duplicates.push([pages[i], pages[j], sim]);
      }
    }
  }
  return {
    graph: store.stats(),
    bySite,
    average_indexable_quality: Math.round(avg * 10) / 10,
    minimum_indexable_quality: min,
    duplicate_candidates: duplicates.length,
    families: Object.fromEntries(
      sites.map((site) => {
        const fam: Record<string, number> = {};
        for (const page of store.pagesFor(site, "INDEXABLE")) {
          fam[page.family] = (fam[page.family] ?? 0) + 1;
        }
        return [site, fam];
      }),
    ),
  };
}

export function programmaticSeoIssues() {
  const store = buildCatalog();
  const issues: string[] = [];
  const titles = new Map<string, string>();
  for (const page of store.pages.values()) {
    if (page.index_state !== "INDEXABLE") continue;
    if (page.quality_score < 75) issues.push(`${page.url} quality ${page.quality_score} < 75`);
    if (!page.title.trim()) issues.push(`${page.url} empty title`);
    const prev = titles.get(page.title);
    if (prev) issues.push(`Duplicate title "${page.title}" on ${prev} and ${page.url}`);
    titles.set(page.title, page.url);
    if (page.canonical.includes("localhost") || page.canonical.includes("vercel.app")) {
      issues.push(`${page.url} preview canonical`);
    }
    if (!page.freshness) issues.push(`${page.url} missing freshness`);
  }
  return issues;
}

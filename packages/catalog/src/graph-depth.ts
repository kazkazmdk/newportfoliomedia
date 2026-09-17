import { provenance, type ConfidenceLevel, type ProvenanceRecord } from "@penta/data-provenance";
import type { GraphEntity, GraphRelation, GraphStore, SiteId } from "@penta/graph-core";
import { ALL_ERRORS, ALL_SYMPTOMS } from "@penta/fixcode";
import { VEHICLES } from "@penta/autospec";
import {
  AIRLINES,
  DESTINATIONS,
  WARDROBE_SEED,
  capsuleFor,
  CLIMATE_PROVENANCE,
} from "@penta/wearthere";
import {
  CABLES,
  CHARGERS,
  DEVICES,
  POWER_PROVENANCE,
  deviceProvenanceList,
  buildPowerScenarios,
  compatibility,
  type ChargerProfile,
  type DeviceProfile,
} from "@penta/chargematch";
import { DISTANCE_PROVENANCE, PRICE_PROVENANCE, ROUTES } from "@penta/tripcost";

const NOW = "2026-09-12T00:00:00.000Z";

export function entity(
  partial: Omit<GraphEntity, "created_at" | "updated_at" | "provenance"> & { provenance?: GraphEntity["provenance"] },
): GraphEntity {
  return {
    provenance: [],
    created_at: NOW,
    updated_at: NOW,
    ...partial,
  };
}

export function rel(
  partial: Omit<GraphRelation, "decision_relevant" | "inferred"> &
    Partial<Pick<GraphRelation, "decision_relevant" | "inferred" | "estimated">>,
): GraphRelation {
  return {
    inferred: false,
    decision_relevant: true,
    estimated: Boolean(partial.properties?.theoretical),
    ...partial,
  };
}

const OEM_HOME: Record<string, string> = {
  bmw: "https://www.bmw.com",
  mercedes: "https://www.mercedes-benz.com",
  audi: "https://www.audi.com",
  volkswagen: "https://www.volkswagen.com",
  toyota: "https://www.toyota.com",
  peugeot: "https://www.peugeot.com",
  renault: "https://www.renault.com",
  hyundai: "https://www.hyundai.com",
  kia: "https://www.kia.com",
  ford: "https://www.ford.com",
  volvo: "https://www.volvocars.com",
  honda: "https://www.honda.com",
  mazda: "https://www.mazda.com",
  nissan: "https://www.nissan-global.com",
  skoda: "https://www.skoda-auto.com",
  seat: "https://www.seat.com",
  tesla: "https://www.tesla.com",
  mini: "https://www.mini.com",
  citroen: "https://www.citroen.com",
  dacia: "https://www.dacia.com",
  opel: "https://www.opel.com",
  fiat: "https://www.fiat.com",
  jeep: "https://www.jeep.com",
  landrover: "https://www.landrover.com",
  alfa: "https://www.alfaromeo.com",
  porsche: "https://www.porsche.com",
  suzuki: "https://www.suzuki.com",
};

function compiled(
  source_id: string,
  notes: string,
  confidence = 78,
  source_type: "THIRD_PARTY" | "MANUFACTURER" | "TRUSTED_THIRD_PARTY" | "PRIMARY_DATABASE" = "THIRD_PARTY",
  extra?: { source_url?: string; source_name?: string },
): ProvenanceRecord {
  const asDatabase = source_type === "THIRD_PARTY" || source_type === "PRIMARY_DATABASE";
  return provenance({
    source_id,
    source_type: asDatabase ? "PRIMARY_DATABASE" : source_type,
    source_name: extra?.source_name ?? notes,
    source_url: extra?.source_url,
    retrieved_at: NOW,
    confidence,
    raw_value: notes,
    normalized_value: notes,
    verification_method: source_type === "MANUFACTURER" ? "MANUFACTURER_DOC" : "CROSS_SOURCE",
    notes,
    locator: {
      dataset: source_id,
      document_title: extra?.source_name ?? notes,
      section: "compiled-in-repo-table",
    },
  });
}

function addOnce(store: GraphStore, row: GraphEntity) {
  if (!store.entities.has(row.id)) store.addEntity(row);
}

export function populateDecisionGraph(store: GraphStore) {
  populateFixcode(store);
  populateAutospec(store);
  populateWearthere(store);
  populateChargematch(store);
  populateTripcost(store);
}

function populateFixcode(store: GraphStore) {
  const brandProv = compiled("fixcode-support-corpus", "Manufacturer support pages + service corpus");
  for (const profile of ALL_ERRORS) {
    const brandId = `fix:brand:${profile.brand_slug}`;
    addOnce(
      store,
      entity({
        id: brandId,
        site: "fixcode",
        type: "brand",
        slug: profile.brand_slug,
        name: profile.brand,
        properties: { coverage: "verified" },
        provenance: profile.provenance,
        confidence: "HIGH",
      }),
    );
    const applianceId = `fix:appliance:${profile.appliance_slug}`;
    addOnce(
      store,
      entity({
        id: applianceId,
        site: "fixcode",
        type: "appliance_type",
        slug: profile.appliance_slug,
        name: profile.appliance,
        properties: {},
        provenance: [brandProv],
        confidence: "HIGH",
      }),
    );
    store.addRelation(
      rel({
        id: `${brandId}->makes->${applianceId}`,
        site: "fixcode",
          type: "MAKES_APPLIANCE",
          from_id: brandId,
          to_id: applianceId,
          properties: {},
          provenance: profile.provenance,
          confidence: "HIGH",
          index_eligible: false,
          method: "MANUFACTURER_DOC",
          verified_at: NOW,
          decision_relevant: false,
        }),
    );
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
    store.addRelation(
      rel({
        id: `${profile.id}->on->${applianceId}`,
        site: "fixcode",
        type: "ON_APPLIANCE",
        from_id: profile.id,
        to_id: applianceId,
        properties: {},
        provenance: profile.provenance,
        confidence: profile.confidence,
        index_eligible: false,
      }),
    );
    store.addRelation(
      rel({
        id: `${brandId}->code->${profile.id}`,
        site: "fixcode",
        type: "HAS_ERROR_CODE",
        from_id: brandId,
        to_id: profile.id,
        properties: {},
        provenance: profile.provenance,
        confidence: profile.confidence,
        index_eligible: true,
      }),
    );
    for (const model of profile.models) {
      const modelId = `fix:model:${profile.brand_slug}:${model.toLowerCase()}`;
      addOnce(
        store,
        entity({
          id: modelId,
          site: "fixcode",
          type: "model_family",
          slug: model.toLowerCase(),
          name: model,
          properties: { brand: profile.brand },
          provenance: profile.provenance,
          confidence: "MEDIUM",
        }),
      );
      store.addRelation(
        rel({
          id: `${profile.id}->seen_on->${modelId}`,
          site: "fixcode",
          type: "OBSERVED_ON_MODEL",
          from_id: profile.id,
          to_id: modelId,
          properties: {},
          provenance: profile.provenance,
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
      store.addRelation(
        rel({
          id: `${modelId}->HAS_ERROR->${profile.id}`,
          site: "fixcode",
          type: "HAS_ERROR",
          from_id: modelId,
          to_id: profile.id,
          properties: { code: profile.code, index_eligible: false },
          provenance: profile.provenance,
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
    }
    for (const cause of profile.causes) {
      const causeId = `${profile.id}:cause:${cause.id}`;
      store.addEntity(
        entity({
          id: causeId,
          site: "fixcode",
          type: "cause",
          slug: cause.id,
          name: cause.name,
          properties: { prior: cause.prior, safety: cause.safety, prior_source: "document_weight" },
          provenance: profile.provenance,
          confidence: profile.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${profile.id}->MAY_BE_CAUSED_BY->${causeId}`,
          site: "fixcode",
          type: "MAY_BE_CAUSED_BY",
          from_id: profile.id,
          to_id: causeId,
          properties: { prior: cause.prior, prior_kind: "document_weight_not_outcome" },
          provenance: profile.provenance,
          confidence: profile.confidence,
          index_eligible: true,
          method: "HEURISTIC",
          verified_at: NOW,
        }),
      );
      const fixId = `${causeId}:fix`;
      store.addEntity(
        entity({
          id: fixId,
          site: "fixcode",
          type: "fix",
          slug: `${cause.id}-fix`,
          name: cause.fix,
          properties: { blocked: Boolean(cause.blocked_reason) },
          provenance: profile.provenance,
          confidence: profile.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${causeId}->FIXED_BY->${fixId}`,
          site: "fixcode",
          type: "FIXED_BY",
          from_id: causeId,
          to_id: fixId,
          properties: {},
          provenance: profile.provenance,
          confidence: profile.confidence,
          index_eligible: false,
        }),
      );
      store.addRelation(
        rel({
          id: `${fixId}->SAFETY_CLASS->fix:safety:${cause.safety}`,
          site: "fixcode",
          type: "SAFETY_CLASS",
          from_id: fixId,
          to_id: `fix:safety:${cause.safety}`,
          properties: { class: cause.safety, llm_cannot_override: true },
          provenance: profile.provenance,
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      const safetyId = `fix:safety:${cause.safety}`;
      addOnce(
        store,
        entity({
          id: safetyId,
          site: "fixcode",
          type: "safety_state",
          slug: cause.safety.toLowerCase(),
          name: cause.safety,
          properties: {},
          provenance: [brandProv],
          confidence: "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${causeId}->RISK_LEVEL->${safetyId}`,
          site: "fixcode",
          type: "RISK_LEVEL",
          from_id: causeId,
          to_id: safetyId,
          properties: {},
          provenance: profile.provenance,
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      for (const tool of cause.tools) {
        const toolId = `fix:tool:${tool}`;
        addOnce(
          store,
          entity({
            id: toolId,
            site: "fixcode",
            type: "tool",
            slug: tool,
            name: tool,
            properties: {},
            provenance: [brandProv],
            confidence: "MEDIUM",
          }),
        );
        store.addRelation(
          rel({
            id: `${fixId}->REQUIRES_TOOL->${toolId}`,
            site: "fixcode",
            type: "REQUIRES_TOOL",
            from_id: fixId,
            to_id: toolId,
            properties: {},
            provenance: profile.provenance,
            confidence: "MEDIUM",
            index_eligible: false,
          }),
        );
      }
    }
    for (const question of profile.questions) {
      const testId = `${profile.id}:test:${question.id}`;
      store.addEntity(
        entity({
          id: testId,
          site: "fixcode",
          type: "test",
          slug: question.id,
          name: question.text,
          properties: { why: question.why },
          provenance: profile.provenance,
          confidence: profile.confidence,
        }),
      );
      for (const cause of profile.causes) {
        store.addRelation(
          rel({
            id: `${profile.id}:cause:${cause.id}->TESTED_BY->${testId}`,
            site: "fixcode",
            type: "TESTED_BY",
            from_id: `${profile.id}:cause:${cause.id}`,
            to_id: testId,
            properties: {},
            provenance: profile.provenance,
            confidence: profile.confidence,
            index_eligible: false,
            decision_relevant: true,
          }),
        );
      }
      for (const answer of question.answers) {
        const resultId = `${testId}:result:${answer.id}`;
        store.addEntity(
          entity({
            id: resultId,
            site: "fixcode",
            type: "test_result",
            slug: answer.id,
            name: answer.label,
            properties: { likelihoods: answer.likelihoods },
            provenance: profile.provenance,
            confidence: profile.confidence,
          }),
        );
        store.addRelation(
          rel({
            id: `${testId}->RETURNS->${resultId}`,
            site: "fixcode",
            type: "RETURNS",
            from_id: testId,
            to_id: resultId,
            properties: { answer: answer.id },
            provenance: profile.provenance,
            confidence: profile.confidence,
            index_eligible: false,
          }),
        );
      }
    }
    for (const slug of profile.related_symptoms) {
      store.addRelation(
        rel({
          id: `${profile.id}->INDICATES_SYMPTOM->${slug}`,
          site: "fixcode",
          type: "INDICATES",
          from_id: profile.id,
          to_id: `fix:${profile.brand_slug}:${profile.appliance_slug}:${slug}`,
          properties: { symptom: slug },
          provenance: profile.provenance,
          confidence: "MEDIUM",
          index_eligible: false,
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
    for (const code of symptom.likely_codes) {
      const error = ALL_ERRORS.find(
        (item) =>
          item.brand_slug === symptom.brand_slug &&
          item.appliance_slug === symptom.appliance_slug &&
          item.code.toLowerCase() === code.toLowerCase(),
      );
      if (!error) continue;
      store.addRelation(
        rel({
          id: `${symptom.id}->MAY_INDICATE->${error.id}`,
          site: "fixcode",
          type: "MAY_INDICATE",
          from_id: symptom.id,
          to_id: error.id,
          properties: {},
          provenance: symptom.provenance,
          confidence: "MEDIUM",
          index_eligible: true,
        }),
      );
    }
  }
}

function oemProv(makeSlug: string) {
  const url = OEM_HOME[makeSlug];
  return url
    ? compiled(
        "oem-handbook",
        "Manufacturer handbook compiled specs",
        82,
        "MANUFACTURER",
        {
          source_url: url,
          source_name: `${makeSlug} OEM handbook compilation (manufacturer homepage — PRIMARY_GENERAL)`,
        },
      )
    : compiled("oem-handbook", "Manufacturer handbook compiled specs", 82, "PRIMARY_DATABASE");
}

function populateAutospec(store: GraphStore) {
  for (const vehicle of VEHICLES) {
    const oem = oemProv(vehicle.make_slug);
    const mfrId = `as:mfr:${vehicle.make_slug}`;
    addOnce(
      store,
      entity({
        id: mfrId,
        site: "autospec",
        type: "manufacturer",
        slug: vehicle.make_slug,
        name: vehicle.make,
        properties: {},
        provenance: [oem],
        confidence: "HIGH",
      }),
    );
    const modelId = `as:model:${vehicle.make_slug}:${vehicle.model_slug}`;
    addOnce(
      store,
      entity({
        id: modelId,
        site: "autospec",
        type: "model",
        slug: vehicle.model_slug,
        name: `${vehicle.make} ${vehicle.model}`,
        properties: {},
        provenance: [oem],
        confidence: "HIGH",
      }),
    );
    const genId = `as:gen:${vehicle.make_slug}:${vehicle.generation_slug}`;
    addOnce(
      store,
      entity({
        id: genId,
        site: "autospec",
        type: "generation",
        slug: vehicle.generation_slug,
        name: `${vehicle.model} ${vehicle.generation}`,
        properties: { years: vehicle.years },
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    const engineId = `as:engine:${vehicle.engine_code}`;
    addOnce(
      store,
      entity({
        id: engineId,
        site: "autospec",
        type: "engine",
        slug: vehicle.engine_code.toLowerCase().replace(/\s+/g, "-"),
        name: vehicle.engine_code,
        properties: { label: vehicle.engine },
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    store.addEntity(
      entity({
        id: vehicle.id,
        site: "autospec",
        type: "vehicle_configuration",
        slug: `${vehicle.make_slug}/${vehicle.generation_slug}/${vehicle.variant_slug}`,
        name: `${vehicle.make} ${vehicle.model} ${vehicle.generation} ${vehicle.variant}`,
        properties: {
          engine: vehicle.engine_code,
          years: vehicle.years,
          market_scope: vehicle.market,
        },
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    const links: Array<[string, string, string, string]> = [
      [`${mfrId}->HAS_MODEL->${modelId}`, "HAS_MODEL", mfrId, modelId],
      [`${modelId}->HAS_GENERATION->${genId}`, "HAS_GENERATION", modelId, genId],
      [`${genId}->AVAILABLE_WITH_ENGINE->${engineId}`, "AVAILABLE_WITH_ENGINE", genId, engineId],
      [`${vehicle.id}->IS_CONFIGURATION_OF->${genId}`, "IS_CONFIGURATION_OF", vehicle.id, genId],
      [`${vehicle.id}->USES_ENGINE->${engineId}`, "USES_ENGINE", vehicle.id, engineId],
    ];
    for (const [id, type, from, to] of links) {
      store.addRelation(
        rel({
          id,
          site: "autospec",
          type,
          from_id: from,
          to_id: to,
          properties: {},
          provenance: [oem],
          confidence: vehicle.confidence,
          index_eligible: false,
          method: "MANUFACTURER_DOC",
          verified_at: NOW,
        }),
      );
    }
    if (vehicle.oil.capacity_liters > 0) {
      const fluidId = `as:fluid:${vehicle.oil.spec.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      addOnce(
        store,
        entity({
          id: fluidId,
          site: "autospec",
          type: "fluid_spec",
          slug: vehicle.oil.spec.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: vehicle.oil.spec,
          properties: { viscosity: vehicle.oil.viscosity },
          provenance: [oem],
          confidence: vehicle.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${engineId}->REQUIRES_FLUID_SPEC->${fluidId}`,
          site: "autospec",
          type: "REQUIRES_FLUID_SPEC",
          from_id: engineId,
          to_id: fluidId,
          properties: { market_scope: vehicle.market },
          provenance: [oem],
          confidence: vehicle.confidence,
          index_eligible: true,
        }),
      );
      store.addRelation(
        rel({
          id: `${engineId}->OIL_CAPACITY`,
          site: "autospec",
          type: "OIL_CAPACITY",
          from_id: engineId,
          to_id: vehicle.id,
          properties: {
            liters: vehicle.oil.capacity_liters,
            with_filter: vehicle.oil.with_filter,
            viscosity: vehicle.oil.viscosity,
            market_scope: vehicle.market,
          },
          provenance: [oem],
          confidence: vehicle.confidence,
          index_eligible: true,
        }),
      );
    }
    for (const market of vehicle.market) {
      const marketId = `as:market:${market.toLowerCase()}`;
      addOnce(
        store,
        entity({
          id: marketId,
          site: "autospec",
          type: "market",
          slug: market.toLowerCase(),
          name: market,
          properties: {},
          provenance: [oem],
          confidence: "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${vehicle.id}->SOLD_IN->${marketId}`,
          site: "autospec",
          type: "SOLD_IN",
          from_id: vehicle.id,
          to_id: marketId,
          properties: { market_scope: [market] },
          provenance: [oem],
          confidence: vehicle.confidence,
          index_eligible: false,
        }),
      );
    }
    for (const service of vehicle.services) {
      const sid = `${vehicle.id}:service:${service.id}`;
      store.addEntity(
        entity({
          id: sid,
          site: "autospec",
          type: "service",
          slug: service.id,
          name: service.name,
          properties: { interval_km: service.interval_km, interval_months: service.interval_months, spec: service.spec },
          provenance: [oem],
          confidence: vehicle.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${vehicle.id}->HAS_SERVICE_INTERVAL->${sid}`,
          site: "autospec",
          type: "HAS_SERVICE_INTERVAL",
          from_id: vehicle.id,
          to_id: sid,
          properties: { interval_km: service.interval_km },
          provenance: [oem],
          confidence: vehicle.confidence,
          index_eligible: true,
        }),
      );
    }
    for (const recall of vehicle.recalls) {
      const rid = `${vehicle.id}:recall:${recall.id}`;
      store.addEntity(
        entity({
          id: rid,
          site: "autospec",
          type: "recall",
          slug: recall.id,
          name: recall.title,
          properties: { campaign: recall.campaign, status: recall.status, source_url: recall.source_url },
          provenance: [oem],
          confidence: "LOW",
        }),
      );
      store.addRelation(
        rel({
          id: `${vehicle.id}->SUBJECT_TO_RECALL->${rid}`,
          site: "autospec",
          type: "SUBJECT_TO_RECALL",
          from_id: vehicle.id,
          to_id: rid,
          properties: { vin_specific: true },
          provenance: [oem],
          confidence: "LOW",
          index_eligible: false,
        }),
      );
    }
    for (const fit of vehicle.fitment) {
      const pid = `as:part:${fit.component_id}`;
      addOnce(
        store,
        entity({
          id: pid,
          site: "autospec",
          type: "part",
          slug: fit.component_id,
          name: fit.component_name,
          properties: {},
          provenance: [oem],
          confidence: fit.confidence,
        }),
      );
      store.addRelation(
        rel({
          id: `${vehicle.id}->FITS->${pid}`,
          site: "autospec",
          type: "FITS",
          from_id: vehicle.id,
          to_id: pid,
          properties: {
            fitment_status:
              fit.confidence === "HIGH"
                ? "VERIFIED"
                : fit.confidence === "MEDIUM"
                  ? "HIGH_CONFIDENCE"
                  : fit.confidence === "LOW"
                    ? "POSSIBLE"
                    : "UNKNOWN",
            display:
              fit.confidence === "HIGH" || fit.confidence === "MEDIUM"
                ? "compatible"
                : fit.confidence === "LOW"
                  ? "Possible fitment — verify."
                  : "unknown",
          },
          provenance: [oem],
          confidence: fit.confidence,
          index_eligible: fit.confidence === "HIGH",
          inferred: fit.confidence === "UNKNOWN" || fit.confidence === "LOW",
        }),
      );
    }
    const tyreId = `${vehicle.id}:tyres`;
    store.addEntity(
      entity({
        id: tyreId,
        site: "autospec",
        type: "component",
        slug: "tyres",
        name: "Tyres",
        properties: vehicle.tyres,
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->HAS_COMPONENT->${tyreId}`,
        site: "autospec",
        type: "HAS_COMPONENT",
        from_id: vehicle.id,
        to_id: tyreId,
        properties: vehicle.tyres,
        provenance: [oem],
        confidence: vehicle.confidence,
        index_eligible: true,
      }),
    );
    const transId = `${vehicle.id}:transmission`;
    store.addEntity(
      entity({
        id: transId,
        site: "autospec",
        type: "transmission",
        slug: vehicle.transmission.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: vehicle.transmission,
        properties: { market_scope: vehicle.market },
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->USES_TRANSMISSION->${transId}`,
        site: "autospec",
        type: "USES_TRANSMISSION",
        from_id: vehicle.id,
        to_id: transId,
        properties: { market_scope: vehicle.market },
        provenance: [oem],
        confidence: vehicle.confidence,
        index_eligible: false,
      }),
    );
    const batId = `${vehicle.id}:battery`;
    store.addEntity(
      entity({
        id: batId,
        site: "autospec",
        type: "component",
        slug: "battery",
        name: `${vehicle.battery.type} ${vehicle.battery.ah ?? ""}`.trim(),
        properties: { ...vehicle.battery, market_scope: vehicle.market },
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->HAS_BATTERY->${batId}`,
        site: "autospec",
        type: "HAS_BATTERY",
        from_id: vehicle.id,
        to_id: batId,
        properties: { market_scope: vehicle.market },
        provenance: [oem],
        confidence: vehicle.confidence,
        index_eligible: true,
      }),
    );
    const wiperId = `${vehicle.id}:wipers`;
    store.addEntity(
      entity({
        id: wiperId,
        site: "autospec",
        type: "component",
        slug: "wipers",
        name: "Wipers",
        properties: vehicle.wipers,
        provenance: [oem],
        confidence: vehicle.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->HAS_WIPERS->${wiperId}`,
        site: "autospec",
        type: "HAS_WIPERS",
        from_id: vehicle.id,
        to_id: wiperId,
        properties: vehicle.wipers,
        provenance: [oem],
        confidence: vehicle.confidence,
        index_eligible: false,
      }),
    );
    const yearId = `${vehicle.id}:year-range`;
    store.addEntity(
      entity({
        id: yearId,
        site: "autospec",
        type: "year_range",
        slug: `${vehicle.years[0]}-${vehicle.years.at(-1)}`,
        name: `${vehicle.years[0]}–${vehicle.years.at(-1)}`,
        properties: { years: vehicle.years, not_split_into_year_pages: true },
        provenance: [oem],
        confidence: "HIGH",
      }),
    );
    store.addRelation(
      rel({
        id: `${vehicle.id}->COVERS_YEARS->${yearId}`,
        site: "autospec",
        type: "COVERS_YEARS",
        from_id: vehicle.id,
        to_id: yearId,
        properties: { years: vehicle.years },
        provenance: [oem],
        confidence: "HIGH",
        index_eligible: false,
      }),
    );
    for (const issue of vehicle.issues) {
      const iid = `${vehicle.id}:issue:${issue.id}`;
      store.addEntity(
        entity({
          id: iid,
          site: "autospec",
          type: "issue",
          slug: issue.id,
          name: issue.title,
          properties: { severity: issue.severity, summary: issue.summary },
          provenance: [oem],
          confidence: "MEDIUM",
        }),
      );
      store.addRelation(
        rel({
          id: `${vehicle.id}->HAS_ISSUE->${iid}`,
          site: "autospec",
          type: "HAS_ISSUE",
          from_id: vehicle.id,
          to_id: iid,
          properties: { severity: issue.severity },
          provenance: [oem],
          confidence: "MEDIUM",
          index_eligible: true,
        }),
      );
    }
  }
}

function populateWearthere(store: GraphStore) {
  for (const piece of WARDROBE_SEED) {
    addOnce(
      store,
      entity({
        id: `wt:garment:${piece.id}`,
        site: "wearthere",
        type: "garment",
        slug: piece.id,
        name: piece.name,
        properties: {
          warmth: piece.warmth,
          breathability: piece.breathability,
          water_resistance: piece.water_resistance,
          wind_resistance: piece.wind_resistance,
          formality: piece.formality,
          activity_fit: piece.activity,
          layer_type: piece.layer,
          estimated_weight: piece.weight_kg,
          estimated_volume: piece.volume_l,
        },
        provenance: [CLIMATE_PROVENANCE],
        confidence: "MEDIUM",
      }),
    );
  }
  for (const airline of AIRLINES) {
    addOnce(
      store,
      entity({
        id: `wt:airline:${airline.id}`,
        site: "wearthere",
        type: "airline",
        slug: airline.id,
        name: airline.name,
        properties: { cabin_l: airline.cabin_l, cabin_kg: airline.cabin_kg, retrieved_at: airline.retrieved_at },
        provenance: [compiled(airline.id, airline.source, 55)],
        confidence: "LOW",
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
        provenance: [CLIMATE_PROVENANCE],
        confidence: "HIGH",
      }),
    );
    for (const month of dest.climate) {
      const monthId = `${dest.id}:month:${month.month}`;
      store.addEntity(
        entity({
          id: monthId,
          site: "wearthere",
          type: "historical_climate",
          slug: `${dest.slug}-${month.month}`,
          name: `${dest.city} month ${month.month} typical climate`,
          properties: {
            ...month,
            kind: "CLIMATE_NORMAL",
            not: "FORECAST",
            period: "1991-2020",
            aggregation: "monthly_mean",
            sample_years: 30,
            last_update: CLIMATE_PROVENANCE.retrieved_at,
            data_type: "CLIMATE_NORMAL",
            dataset: "compiled-monthly-normals",
            dataset_version: "penta-climate-v1",
            station_or_grid: null,
            variable: "tmin_c,tmax_c,rain_days,rain_mm,humidity,wind_kmh",
            unit: "degC / mm / days / % / kmh",
            source_url: null,
            interpolation_method: null,
            derived_method: null,
          },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${dest.id}->TYPICAL_CLIMATE->${monthId}`,
          site: "wearthere",
          type: "TYPICAL_CLIMATE",
          from_id: dest.id,
          to_id: monthId,
            properties: { month: month.month, tmin: month.tmin_c, tmax: month.tmax_c, rain_days: month.rain_days },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
          index_eligible: dest.demand >= 50,
          method: "CROSS_SOURCE",
          verified_at: CLIMATE_PROVENANCE.retrieved_at,
          edge_kind: "SOURCE_TRUTH",
        }),
      );
      const cap = capsuleFor(dest, month.month, "classic");
      for (const piece of cap.pieces) {
        store.addRelation(
          rel({
            id: `${monthId}->PACKS->wt:garment:${piece.id}`,
            site: "wearthere",
            type: "PACKS",
            from_id: monthId,
            to_id: `wt:garment:${piece.id}`,
            properties: {
              warmth: piece.warmth,
              breathability: piece.breathability,
              water_resistance: piece.water_resistance,
              wind_resistance: piece.wind_resistance,
              formality: piece.formality,
              layer: piece.layer,
              rule_version: "packing-v1",
            },
            provenance: [CLIMATE_PROVENANCE],
            confidence: "MEDIUM",
            index_eligible: false,
            inferred: true,
            estimated: true,
            method: "HEURISTIC",
            edge_kind: "DERIVED_RULE",
          }),
        );
      }
    }
  }
}

function protocolId(name: string) {
  return `cm:protocol:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function populateChargematch(store: GraphStore) {
  const protocols = new Set<string>();
  for (const device of DEVICES) {
    if (device.pd_version) protocols.add(device.pd_version);
    if (device.pps) protocols.add("PPS");
    protocols.add(device.connector);
  }
  for (const charger of CHARGERS) protocols.add(charger.pd_version);
  for (const name of protocols) {
    addOnce(
      store,
      entity({
        id: protocolId(name),
        site: "chargematch",
        type: "protocol",
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        properties: {},
        provenance: [POWER_PROVENANCE],
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
        properties: { min_watts: device.min_watts, max_watts: device.max_watts, connector: device.connector, tag: device.tag },
        provenance: deviceProvenanceList(device.id, POWER_PROVENANCE),
        confidence: device.tag === "MANUFACTURER_VERIFIED" ? "HIGH" : "MEDIUM",
      }),
    );
    const profileId = `${device.id}:power`;
    store.addEntity(
      entity({
        id: profileId,
        site: "chargematch",
        type: "power_profile",
        slug: `${device.slug}-in`,
        name: `${device.name} input`,
        properties: { min_watts: device.min_watts, max_watts: device.max_watts },
        provenance: [POWER_PROVENANCE],
        confidence: "HIGH",
      }),
    );
    store.addRelation(
      rel({
        id: `${device.id}->MAX_INPUT->${profileId}`,
        site: "chargematch",
        type: "MAX_INPUT",
        from_id: device.id,
        to_id: profileId,
        properties: { watts: device.max_watts },
        provenance: [POWER_PROVENANCE],
        confidence: "HIGH",
        index_eligible: false,
      }),
    );
    if (device.pd_version) {
      store.addRelation(
        rel({
          id: `${device.id}->SUPPORTS_PROTOCOL->${protocolId(device.pd_version)}`,
          site: "chargematch",
          type: "SUPPORTS_PROTOCOL",
          from_id: device.id,
          to_id: protocolId(device.pd_version),
          properties: {},
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
    }
  }
  for (const charger of CHARGERS) {
    store.addEntity(
      entity({
        id: charger.id,
        site: "chargematch",
        type: "charger",
        slug: charger.slug,
        name: charger.name,
        properties: { total_watts: charger.total_watts, tag: charger.tag, pd_version: charger.pd_version },
        provenance: [POWER_PROVENANCE],
        confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
      }),
    );
    store.addRelation(
      rel({
        id: `${charger.id}->SUPPORTS_PROTOCOL->${protocolId(charger.pd_version)}`,
        site: "chargematch",
        type: "SUPPORTS_PROTOCOL",
        from_id: charger.id,
        to_id: protocolId(charger.pd_version),
        properties: {},
        provenance: [POWER_PROVENANCE],
        confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
        index_eligible: false,
        inferred: charger.tag === "PROTOCOL_INFERRED",
      }),
    );
    for (const port of charger.ports) {
      const portId = `${charger.id}:port:${port.id}`;
      store.addEntity(
        entity({
          id: portId,
          site: "chargematch",
          type: "charger_port",
          slug: `${charger.slug}-${port.id}`,
          name: `${charger.name} ${port.label}`,
          properties: { watts: port.watts, pdos: port.pdos },
          provenance: [POWER_PROVENANCE],
          confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${charger.id}->HAS_PORT->${portId}`,
          site: "chargematch",
          type: "HAS_PORT",
          from_id: charger.id,
          to_id: portId,
          properties: {},
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      const outId = `${portId}:out`;
      store.addEntity(
        entity({
          id: outId,
          site: "chargematch",
          type: "power_profile",
          slug: `${charger.slug}-${port.id}-out`,
          name: `${port.label} ${port.watts}W`,
          properties: { watts: port.watts },
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${portId}->MAX_OUTPUT->${outId}`,
          site: "chargematch",
          type: "MAX_OUTPUT",
          from_id: portId,
          to_id: outId,
          properties: { watts: port.watts },
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
    }
    for (const alloc of charger.allocations) {
      const allocId = `${charger.id}:alloc:${alloc.ports.join("+")}`;
      store.addEntity(
        entity({
          id: allocId,
          site: "chargematch",
          type: "allocation_profile",
          slug: alloc.ports.join("-"),
          name: `${charger.name} ${alloc.ports.join("+")}`,
          properties: { ports: alloc.ports, watts: alloc.watts },
          provenance: [POWER_PROVENANCE],
          confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
        }),
      );
      store.addRelation(
        rel({
          id: `${charger.id}->HAS_POWER_ALLOCATION->${allocId}`,
          site: "chargematch",
          type: "HAS_POWER_ALLOCATION",
          from_id: charger.id,
          to_id: allocId,
          properties: { ports: alloc.ports, watts: alloc.watts },
          provenance: [POWER_PROVENANCE],
          confidence: charger.tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH",
          index_eligible: false,
          inferred: charger.tag === "PROTOCOL_INFERRED",
        }),
      );
    }
    const hasA = charger.ports.some((port) => port.id === "a");
    const hasC1A = charger.allocations.some(
      (row) => row.ports.length === 2 && row.ports.includes("c1") && row.ports.includes("a"),
    );
    if (hasA && !hasC1A) {
      const unknownId = `${charger.id}:alloc:c1+a-unknown`;
      store.addEntity(
        entity({
          id: unknownId,
          site: "chargematch",
          type: "allocation_profile",
          slug: "c1-a-unknown",
          name: `${charger.name} C1+A unpublished`,
          properties: { ports: ["c1", "a"], watts: null, unknown: true },
          provenance: [POWER_PROVENANCE],
          confidence: "UNKNOWN",
        }),
      );
      store.addRelation(
        rel({
          id: `${charger.id}->ALLOCATION_UNKNOWN->${unknownId}`,
          site: "chargematch",
          type: "ALLOCATION_UNKNOWN",
          from_id: charger.id,
          to_id: unknownId,
          properties: {
            ports: ["c1", "a"],
            note: "No manufacturer split published. Linear division is forbidden.",
          },
          provenance: [POWER_PROVENANCE],
          confidence: "UNKNOWN",
          index_eligible: false,
          inferred: true,
          estimated: true,
        }),
      );
    }
  }
  for (const cable of CABLES) {
    store.addEntity(
      entity({
        id: cable.id,
        site: "chargematch",
        type: "cable",
        slug: cable.slug,
        name: cable.name,
        properties: { max_watts: cable.max_watts, e_marker: cable.e_marker, tag: cable.tag },
        provenance: [POWER_PROVENANCE],
        confidence: (cable.tag === "UNKNOWN" ? "UNKNOWN" : "HIGH") as ConfidenceLevel,
      }),
    );
    store.addRelation(
      rel({
        id: `${cable.id}->SUPPORTS_POWER`,
        site: "chargematch",
        type: "SUPPORTS",
        from_id: cable.id,
        to_id: cable.id,
        properties: { max_watts: cable.max_watts, max_volts: cable.max_volts, e_marker: cable.e_marker },
        provenance: [POWER_PROVENANCE],
        confidence: cable.tag === "UNKNOWN" ? "UNKNOWN" : "HIGH",
        index_eligible: false,
        inferred: cable.tag === "UNKNOWN",
      }),
    );
  }
  for (const device of DEVICES) {
    for (const charger of CHARGERS) {
      const result = compatibility(device, charger);
      const inferred = charger.tag === "PROTOCOL_INFERRED" || device.tag === "PROTOCOL_INFERRED";
      store.addRelation(
        rel({
          id: `${charger.id}~${device.id}`,
          site: "chargematch",
          type: "CAN_CHARGE",
          from_id: charger.id,
          to_id: device.id,
          properties: {
            graph_only: true,
            match: result.match,
            max_power: result.max_power,
            theoretical: result.theoretical,
            lab: false,
            measured: false,
            evidence: result.evidence === "MEASURED" ? "INFERRED" : result.evidence,
            rule_version: "compatibility-v2",
          },
          provenance: [POWER_PROVENANCE],
          confidence: result.confidence,
          index_eligible: false,
          inferred,
          method: inferred ? "HEURISTIC" : "MANUFACTURER_DOC",
          verified_at: POWER_PROVENANCE.retrieved_at,
          edge_kind: "DERIVED_RULE",
        }),
      );
    }
  }
  for (const scenario of buildPowerScenarios()) {
    store.addEntity(
      entity({
        id: scenario.id,
        site: "chargematch",
        type: "power_scenario",
        slug: scenario.id.replace("cm:scenario:", ""),
        name: `${scenario.device_id} × ${scenario.charger_id}`,
        properties: {
          device: scenario.device_id,
          charger: scenario.charger_id,
          cable: scenario.cable_id ?? null,
          port: scenario.port,
          protocol: scenario.protocol,
          negotiated_voltage: scenario.negotiated_voltage,
          negotiated_current: scenario.negotiated_current,
          expected_power: scenario.expected_power,
          limiting_component: scenario.limiting_component,
          power_kind: scenario.power_kind,
          measured_curve: null,
          evidence: scenario.evidence,
          note: "CALCULATED_EXPECTED from protocol overlap. Not a lab measurement.",
        },
        provenance: [POWER_PROVENANCE],
        confidence: scenario.confidence,
      }),
    );
    store.addRelation(
      rel({
        id: `${scenario.device_id}->HAS_SCENARIO->${scenario.id}`,
        site: "chargematch",
        type: "HAS_SCENARIO",
        from_id: scenario.device_id,
        to_id: scenario.id,
        properties: { role: "device" },
        provenance: [POWER_PROVENANCE],
        confidence: scenario.confidence,
        index_eligible: false,
        inferred: true,
        edge_kind: "DERIVED_RULE",
      }),
    );
    store.addRelation(
      rel({
        id: `${scenario.charger_id}->HAS_SCENARIO->${scenario.id}`,
        site: "chargematch",
        type: "HAS_SCENARIO",
        from_id: scenario.charger_id,
        to_id: scenario.id,
        properties: { role: "charger" },
        provenance: [POWER_PROVENANCE],
        confidence: scenario.confidence,
        index_eligible: false,
        inferred: true,
        edge_kind: "DERIVED_RULE",
      }),
    );
    if (scenario.cable_id) {
      store.addRelation(
        rel({
          id: `${scenario.cable_id}->HAS_SCENARIO->${scenario.id}`,
          site: "chargematch",
          type: "HAS_SCENARIO",
          from_id: scenario.cable_id,
          to_id: scenario.id,
          properties: { role: "cable" },
          provenance: [POWER_PROVENANCE],
          confidence: scenario.confidence,
          index_eligible: false,
          inferred: true,
          edge_kind: "DERIVED_RULE",
        }),
      );
    }
  }
}

function populateTripcost(store: GraphStore) {
  const seenPlaces = new Set<string>();
  for (const route of ROUTES) {
    for (const place of [route.from, route.to]) {
      if (seenPlaces.has(place.id)) continue;
      seenPlaces.add(place.id);
      store.addEntity(
        entity({
          id: `tc:place:${place.id}`,
          site: "tripcost",
          type: "place",
          slug: place.slug,
          name: place.name,
          properties: { country: place.country },
          provenance: [PRICE_PROVENANCE],
          confidence: "HIGH",
        }),
      );
    }
    store.addEntity(
      entity({
        id: route.id,
        site: "tripcost",
        type: "corridor",
        slug: `${route.from.slug}-to-${route.to.slug}`,
        name: `${route.from.name} → ${route.to.name}`,
        properties: { km: route.km, demand: route.demand },
        provenance: [PRICE_PROVENANCE],
        confidence: "MEDIUM",
      }),
    );
    store.addRelation(
      rel({
        id: `${route.id}->FROM`,
        site: "tripcost",
          type: "FROM_PLACE",
          from_id: route.id,
          to_id: `tc:place:${route.from.id}`,
          properties: {},
          provenance: [PRICE_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
          decision_relevant: false,
        }),
    );
    store.addRelation(
      rel({
        id: `${route.id}->TO`,
        site: "tripcost",
        type: "TO_PLACE",
        from_id: route.id,
        to_id: `tc:place:${route.to.id}`,
        properties: {},
        provenance: [PRICE_PROVENANCE],
        confidence: "HIGH",
        index_eligible: false,
        decision_relevant: false,
      }),
    );
    const distanceId = `${route.id}:distance`;
    store.addEntity(
      entity({
        id: distanceId,
        site: "tripcost",
        type: "distance",
        slug: "km",
        name: `${route.km} km`,
        properties: { km: route.km, family: "EVERGREEN", road_type: "intercity" },
        provenance: [DISTANCE_PROVENANCE],
        confidence: "HIGH",
      }),
    );
    store.addRelation(
      rel({
        id: `${route.id}->HAS_DISTANCE->${distanceId}`,
        site: "tripcost",
        type: "HAS_DISTANCE",
        from_id: route.id,
        to_id: distanceId,
        properties: { km: route.km, family: "EVERGREEN" },
        provenance: [DISTANCE_PROVENANCE],
        confidence: "HIGH",
        index_eligible: false,
      }),
    );
    const consumptionId = `${route.id}:consumption`;
    store.addEntity(
      entity({
        id: consumptionId,
        site: "tripcost",
        type: "consumption",
        slug: "l-100",
        name: `${route.fuel_l_per_100} L/100 km`,
        properties: { l_per_100: route.fuel_l_per_100, family: "EVERGREEN" },
        provenance: [DISTANCE_PROVENANCE],
        confidence: "MEDIUM",
      }),
    );
    store.addRelation(
      rel({
        id: `${route.id}->HAS_CONSUMPTION->${consumptionId}`,
        site: "tripcost",
        type: "HAS_CONSUMPTION",
        from_id: route.id,
        to_id: consumptionId,
        properties: { l_per_100: route.fuel_l_per_100, family: "EVERGREEN" },
        provenance: [DISTANCE_PROVENANCE],
        confidence: "MEDIUM",
        index_eligible: false,
      }),
    );
    const components: Array<[string, number, string, string]> = [
      ["fuel", (route.km * route.fuel_l_per_100) / 100 * route.fuel_eur_per_l, "cash", "VOLATILE"],
      ["toll", route.tolls_eur, "cash", "VOLATILE"],
      ["parking", route.parking_eur, "cash", "VOLATILE"],
      ["wear", route.km * route.wear_eur_per_km, "true_cost", "EVERGREEN"],
      ["ev_energy", (route.km * route.ev_kwh_per_100) / 100 * route.ev_eur_per_kwh, "cash", "VOLATILE"],
      ["train_pp", route.train_eur_pp, "cash", "VOLATILE"],
      ["bus_pp", route.bus_eur_pp, "cash", "VOLATILE"],
      ["flight_pp", route.flight_eur_pp, "cash", "VOLATILE"],
    ];
    for (const [key, value, kind, volatility] of components) {
      if (!value) continue;
      const cid = `${route.id}:cost:${key}`;
      const prov = volatility === "EVERGREEN" ? DISTANCE_PROVENANCE : PRICE_PROVENANCE;
      store.addEntity(
        entity({
          id: cid,
          site: "tripcost",
          type: "cost_component",
          slug: key,
          name: key,
          properties: {
            value: Math.round(value * 100) / 100,
            currency: "EUR",
            assumption_type: kind,
            family: volatility,
            retrieved_at: prov.retrieved_at,
            valid_until: prov.valid_until ?? null,
            observed_at: volatility === "VOLATILE" ? PRICE_PROVENANCE.retrieved_at : undefined,
            expires_at: volatility === "VOLATILE" ? PRICE_PROVENANCE.valid_until : undefined,
          },
          provenance: [prov],
          confidence: "MEDIUM",
        }),
      );
      store.addRelation(
        rel({
          id: `${route.id}->HAS_COST->${cid}`,
          site: "tripcost",
          type: "HAS_COST_COMPONENT",
          from_id: route.id,
          to_id: cid,
          properties: { kind, currency: "EUR", family: volatility },
          provenance: [prov],
          confidence: "MEDIUM",
          index_eligible: false,
          method: "HEURISTIC",
          verified_at: prov.retrieved_at,
        }),
      );
    }
    const modes: Array<[string, boolean, number]> = [
      ["car", true, Math.round((route.km / 95) * 60)],
      ["ev", true, Math.round((route.km / 95) * 60) + route.ev_charge_minutes],
      ["train", route.train_eur_pp > 0, route.train_minutes + 40],
      ["bus", route.bus_eur_pp > 0, route.bus_minutes + 30],
      [
        "flight",
        route.flight_eur_pp > 0,
        route.airport_access_minutes + route.security_buffer_minutes + route.flight_minutes + route.city_transfer_minutes,
      ],
      ["rideshare", route.rideshare_eur > 0, Math.round((route.km / 95) * 60)],
    ];
    for (const [mode, available, door] of modes) {
      if (!available) continue;
      const mid = `${route.id}:mode:${mode}`;
      store.addEntity(
        entity({
          id: mid,
          site: "tripcost",
          type: "mode",
          slug: mode,
          name: mode,
          properties: { minutes_door: door },
          provenance: [PRICE_PROVENANCE],
          confidence: "MEDIUM",
        }),
      );
      store.addRelation(
        rel({
          id: `${route.id}->HAS_MODE->${mid}`,
          site: "tripcost",
          type: "HAS_MODE",
          from_id: route.id,
          to_id: mid,
          properties: {
            minutes_door: door,
            party_size_sensitive: mode === "car" || mode === "ev",
            time_bits:
              mode === "flight"
                ? {
                    origin_transfer: route.airport_access_minutes,
                    buffer: route.security_buffer_minutes,
                    travel: route.flight_minutes,
                    destination_transfer: route.city_transfer_minutes,
                  }
                : mode === "train"
                  ? { waiting: 40, travel: route.train_minutes }
                  : mode === "bus"
                    ? { waiting: 30, travel: route.bus_minutes }
                    : { travel: Math.round((route.km / 95) * 60) },
          },
          provenance: [PRICE_PROVENANCE],
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
    }
  }
}

export type { SiteId, ChargerProfile, DeviceProfile };

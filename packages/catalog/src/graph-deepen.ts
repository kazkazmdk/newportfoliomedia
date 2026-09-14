import { compareRoute, timeValueBreakEven, ROUTES } from "@penta/tripcost";
import { ALL_ERRORS } from "@penta/fixcode";
import { VEHICLES } from "@penta/autospec";
import { DESTINATIONS, capsuleFor, CLIMATE_PROVENANCE } from "@penta/wearthere";
import { CABLES, CHARGERS, DEVICES, POWER_PROVENANCE } from "@penta/chargematch";
import type { GraphStore } from "@penta/graph-core";
import { entity, rel } from "./graph-depth";

const NOW = "2026-09-12T00:00:00.000Z";

function addOnce(store: GraphStore, row: ReturnType<typeof entity>) {
  if (!store.entities.has(row.id)) store.addEntity(row);
}

function addRel(store: GraphStore, row: ReturnType<typeof rel>) {
  if (!store.relations.has(row.id)) store.addRelation(row);
}

export function deepenDecisionGraph(store: GraphStore) {
  deepenFixcode(store);
  deepenAutospec(store);
  deepenWearthere(store);
  deepenChargematch(store);
  deepenTripcost(store);
}

function deepenFixcode(store: GraphStore) {
  for (const profile of ALL_ERRORS) {
    const brandId = `fix:brand:${profile.brand_slug}`;
    const familyId = `fix:family:${profile.brand_slug}:${profile.affected_family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    addOnce(
      store,
      entity({
        id: familyId,
        site: "fixcode",
        type: "family",
        slug: profile.affected_family.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: profile.affected_family,
        properties: { brand: profile.brand },
        provenance: profile.provenance,
        confidence: "MEDIUM",
      }),
    );
    addRel(
      store,
      rel({
        id: `${brandId}->BRAND_HAS_FAMILY->${familyId}`,
        site: "fixcode",
        type: "BRAND_HAS_FAMILY",
        from_id: brandId,
        to_id: familyId,
        properties: {},
        provenance: profile.provenance,
        confidence: "MEDIUM",
        index_eligible: false,
        decision_relevant: false,
      }),
    );
    addRel(
      store,
      rel({
        id: `${profile.id}->IN_FAMILY->${familyId}`,
        site: "fixcode",
        type: "IN_FAMILY",
        from_id: profile.id,
        to_id: familyId,
        properties: { code: profile.code },
        provenance: profile.provenance,
        confidence: profile.confidence,
        index_eligible: true,
        decision_relevant: false,
      }),
    );
    for (const model of profile.models) {
      const modelId = `fix:model:${profile.brand_slug}:${model.toLowerCase()}`;
      addRel(
        store,
        rel({
          id: `${familyId}->FAMILY_HAS_MODEL->${modelId}`,
          site: "fixcode",
          type: "FAMILY_HAS_MODEL",
          from_id: familyId,
          to_id: modelId,
          properties: {},
          provenance: profile.provenance,
          confidence: "MEDIUM",
          index_eligible: false,
          decision_relevant: false,
        }),
      );
    }
    for (let i = 0; i < profile.questions.length - 1; i++) {
      const from = `${profile.id}:test:${profile.questions[i].id}`;
      const to = `${profile.id}:test:${profile.questions[i + 1].id}`;
      addRel(
        store,
        rel({
          id: `${from}->NEXT_TEST->${to}`,
          site: "fixcode",
          type: "NEXT_TEST",
          from_id: from,
          to_id: to,
          properties: { order: i + 1 },
          provenance: profile.provenance,
          confidence: profile.confidence,
          index_eligible: false,
        }),
      );
    }
    for (const note of profile.safety_notes) {
      const hazardId = `fix:hazard:${profile.id}:${note.slice(0, 24).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      addOnce(
        store,
        entity({
          id: hazardId,
          site: "fixcode",
          type: "safety_hazard",
          slug: "hazard",
          name: note,
          properties: { known: true },
          provenance: profile.provenance,
          confidence: "HIGH",
        }),
      );
      addRel(
        store,
        rel({
          id: `${profile.id}->SAFETY_HAZARD->${hazardId}`,
          site: "fixcode",
          type: "SAFETY_HAZARD",
          from_id: profile.id,
          to_id: hazardId,
          properties: {},
          provenance: profile.provenance,
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
    }
    for (const cause of profile.causes) {
      const causeId = `${profile.id}:cause:${cause.id}`;
      const boundary = cause.safety === "SAFE_USER_CHECK" || cause.safety === "CAUTION" ? "DIY" : "TECH";
      const boundId = `fix:boundary:${boundary.toLowerCase()}`;
      addOnce(
        store,
        entity({
          id: boundId,
          site: "fixcode",
          type: "diy_or_tech",
          slug: boundary.toLowerCase(),
          name: boundary,
          properties: { safety: cause.safety },
          provenance: profile.provenance,
          confidence: "HIGH",
        }),
      );
      addRel(
        store,
        rel({
          id: `${causeId}->DIY_OR_TECH->${boundId}`,
          site: "fixcode",
          type: "DIY_OR_TECH",
          from_id: causeId,
          to_id: boundId,
          properties: { safety: cause.safety, escalate: boundary === "TECH" },
          provenance: profile.provenance,
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      if (profile.questions[0]) {
        addRel(
          store,
          rel({
            id: `${causeId}->NEXT_ACTION->${profile.id}:test:${profile.questions[0].id}`,
            site: "fixcode",
            type: "NEXT_ACTION",
            from_id: causeId,
            to_id: `${profile.id}:test:${profile.questions[0].id}`,
            properties: { kind: "run_test" },
            provenance: profile.provenance,
            confidence: profile.confidence,
            index_eligible: false,
          }),
        );
      }
      for (const tool of cause.tools) {
        if (!/valve|hose|filter|mesh|pump|sensor|board|heater|seal/i.test(tool)) continue;
        const partId = `fix:part:${tool}`;
        addOnce(
          store,
          entity({
            id: partId,
            site: "fixcode",
            type: "part",
            slug: tool,
            name: tool,
            properties: { from_tool_label: true, not_oem_sku: true },
            provenance: profile.provenance,
            confidence: "LOW",
          }),
        );
        addRel(
          store,
          rel({
            id: `${causeId}->REQUIRES_PART->${partId}`,
            site: "fixcode",
            type: "REQUIRES_PART",
            from_id: causeId,
            to_id: partId,
            properties: { sku_unknown: true },
            provenance: profile.provenance,
            confidence: "LOW",
            index_eligible: false,
            inferred: true,
          }),
        );
      }
    }
  }
}

function drivetrainOf(engine: string, transmission: string): string {
  const blob = `${engine} ${transmission}`.toLowerCase();
  if (blob.includes("hybrid")) return "hybrid";
  if (blob.includes("diesel")) return "ice-diesel";
  if (blob.includes("electric") || blob.includes("ev")) return "bev";
  if (blob.includes("e-cvt") || blob.includes("cvt")) return "hybrid-or-cvt";
  return "ice";
}

function deepenAutospec(store: GraphStore) {
  for (const vehicle of VEHICLES) {
    const trimId = `as:trim:${vehicle.make_slug}:${vehicle.variant_slug}`;
    addOnce(
      store,
      entity({
        id: trimId,
        site: "autospec",
        type: "trim",
        slug: vehicle.variant_slug,
        name: vehicle.variant,
        properties: { engine: vehicle.engine_code },
        provenance: vehicle.oil.spec ? store.get(vehicle.id)?.provenance ?? [] : [],
        confidence: vehicle.confidence,
      }),
    );
    addRel(
      store,
      rel({
        id: `${vehicle.id}->HAS_TRIM->${trimId}`,
        site: "autospec",
        type: "HAS_TRIM",
        from_id: vehicle.id,
        to_id: trimId,
        properties: { confidence_basis: ["exact_powertrain", "generation_level_only", "manufacturer_source"] },
        provenance: store.get(vehicle.id)?.provenance ?? [],
        confidence: vehicle.confidence,
        index_eligible: false,
        decision_relevant: false,
      }),
    );
    const dt = drivetrainOf(vehicle.engine, vehicle.transmission);
    const dtId = `as:drivetrain:${dt}`;
    addOnce(
      store,
      entity({
        id: dtId,
        site: "autospec",
        type: "drivetrain",
        slug: dt,
        name: dt,
        properties: { derived_from: "engine+transmission labels", not_vin_decoded: true },
        provenance: store.get(vehicle.id)?.provenance ?? [],
        confidence: "MEDIUM",
      }),
    );
    addRel(
      store,
      rel({
        id: `${vehicle.id}->USES_DRIVETRAIN->${dtId}`,
        site: "autospec",
        type: "USES_DRIVETRAIN",
        from_id: vehicle.id,
        to_id: dtId,
        properties: { confidence_basis: ["generation_level_only"] },
        provenance: store.get(vehicle.id)?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
      }),
    );
    const vinScopeId = `${vehicle.id}:vin-scope`;
    addOnce(
      store,
      entity({
        id: vinScopeId,
        site: "autospec",
        type: "vin_scope",
        slug: "generation-level",
        name: "Generation-level identity — not an exact VIN",
        properties: { confidence_basis: ["generation_level_only"], exact_vin: false },
        provenance: store.get(vehicle.id)?.provenance ?? [],
        confidence: "MEDIUM",
      }),
    );
    addRel(
      store,
      rel({
        id: `${vehicle.id}->VIN_SCOPE->${vinScopeId}`,
        site: "autospec",
        type: "COVERS_YEARS",
        from_id: vehicle.id,
        to_id: vinScopeId,
        properties: { confidence_basis: ["generation_level_only"] },
        provenance: store.get(vehicle.id)?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
        decision_relevant: false,
      }),
    );
    for (const service of vehicle.services) {
      if (service.id === "coolant" && service.spec) {
        const coolantId = `as:coolant:${service.spec.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        addOnce(
          store,
          entity({
            id: coolantId,
            site: "autospec",
            type: "fluid_spec",
            slug: "coolant",
            name: service.spec,
            properties: { kind: "coolant" },
            provenance: store.get(vehicle.id)?.provenance ?? [],
            confidence: vehicle.confidence,
          }),
        );
        addRel(
          store,
          rel({
            id: `${vehicle.id}->HAS_COOLANT_SPEC->${coolantId}`,
            site: "autospec",
            type: "HAS_COOLANT_SPEC",
            from_id: vehicle.id,
            to_id: coolantId,
            properties: { interval_km: service.interval_km, market_scope: vehicle.market },
            provenance: store.get(vehicle.id)?.provenance ?? [],
            confidence: vehicle.confidence,
            index_eligible: true,
          }),
        );
      }
      if (service.id === "brake-fluid" && service.spec) {
        const brakeId = `as:brake:${service.spec.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        addOnce(
          store,
          entity({
            id: brakeId,
            site: "autospec",
            type: "fluid_spec",
            slug: "brake-fluid",
            name: service.spec,
            properties: { kind: "brake" },
            provenance: store.get(vehicle.id)?.provenance ?? [],
            confidence: vehicle.confidence,
          }),
        );
        addRel(
          store,
          rel({
            id: `${vehicle.id}->HAS_BRAKE_FLUID->${brakeId}`,
            site: "autospec",
            type: "HAS_BRAKE_FLUID",
            from_id: vehicle.id,
            to_id: brakeId,
            properties: { spec: service.spec, market_scope: vehicle.market },
            provenance: store.get(vehicle.id)?.provenance ?? [],
            confidence: vehicle.confidence,
            index_eligible: true,
          }),
        );
      }
    }
    const transFluid = /cvt|automatic|dsg|dct|e-cvt/i.test(vehicle.transmission);
    if (transFluid) {
      const tfId = `${vehicle.id}:trans-fluid`;
      addOnce(
        store,
        entity({
          id: tfId,
          site: "autospec",
          type: "fluid_spec",
          slug: "transmission-fluid",
          name: `${vehicle.transmission} fluid — confirm handbook`,
          properties: { exact_spec_unknown: true },
          provenance: store.get(vehicle.id)?.provenance ?? [],
          confidence: "LOW",
        }),
      );
      addRel(
        store,
        rel({
          id: `${vehicle.id}->HAS_TRANS_FLUID->${tfId}`,
          site: "autospec",
          type: "HAS_TRANS_FLUID",
          from_id: vehicle.id,
          to_id: tfId,
          properties: { confirm_handbook: true },
          provenance: store.get(vehicle.id)?.provenance ?? [],
          confidence: "LOW",
          index_eligible: false,
          inferred: true,
        }),
      );
    }
  }
  const byEngine = new Map<string, string[]>();
  for (const vehicle of VEHICLES) {
    const list = byEngine.get(vehicle.engine_code) ?? [];
    list.push(vehicle.id);
    byEngine.set(vehicle.engine_code, list);
  }
  for (const [engine, ids] of byEngine) {
    if (ids.length < 2) continue;
    addRel(
      store,
      rel({
        id: `${ids[0]}->SAME_ENGINE->${ids[1]}:${engine}`,
        site: "autospec",
        type: "AVAILABLE_WITH_ENGINE",
        from_id: ids[0],
        to_id: ids[1],
        properties: { shared_engine: engine, oil_may_differ_by_market: true },
        provenance: store.get(ids[0])?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
        decision_relevant: false,
      }),
    );
  }
}

function deepenWearthere(store: GraphStore) {
  const activities = ["city", "hiking", "business"] as const;
  for (const dest of DESTINATIONS) {
    const profileId = `${dest.id}:climate-profile`;
    addOnce(
      store,
      entity({
        id: profileId,
        site: "wearthere",
        type: "climate_profile",
        slug: dest.slug,
        name: `${dest.city} climate profile`,
        properties: { kind: "CLIMATE_NORMAL", period: "1991-2020", not: "FORECAST" },
        provenance: [CLIMATE_PROVENANCE],
        confidence: "HIGH",
      }),
    );
    addRel(
      store,
      rel({
        id: `${dest.id}->HAS_CLIMATE_PROFILE->${profileId}`,
        site: "wearthere",
        type: "TYPICAL_CLIMATE",
        from_id: dest.id,
        to_id: profileId,
        properties: { kind: "CLIMATE_NORMAL" },
        provenance: [CLIMATE_PROVENANCE],
        confidence: "HIGH",
        index_eligible: false,
      }),
    );
    for (const month of dest.climate) {
      const monthId = `${dest.id}:month:${month.month}`;
      const rangeId = `${monthId}:temp`;
      addOnce(
        store,
        entity({
          id: rangeId,
          site: "wearthere",
          type: "temperature_range",
          slug: `m${month.month}`,
          name: `${month.tmin_c}–${month.tmax_c}°C`,
          properties: { tmin: month.tmin_c, tmax: month.tmax_c, diurnal: month.tmax_c - month.tmin_c },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
        }),
      );
      addRel(
        store,
        rel({
          id: `${monthId}->HAS_TEMPERATURE_RANGE->${rangeId}`,
          site: "wearthere",
          type: "HAS_TEMPERATURE_RANGE",
          from_id: monthId,
          to_id: rangeId,
          properties: { diurnal: month.tmax_c - month.tmin_c },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
          index_eligible: true,
        }),
      );
      const rainId = `${monthId}:rain`;
      addOnce(
        store,
        entity({
          id: rainId,
          site: "wearthere",
          type: "precipitation",
          slug: "rain",
          name: `${month.rain_days} rain days`,
          properties: { rain_days: month.rain_days },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
        }),
      );
      addRel(
        store,
        rel({
          id: `${monthId}->HAS_PRECIPITATION->${rainId}`,
          site: "wearthere",
          type: "HAS_PRECIPITATION",
          from_id: monthId,
          to_id: rainId,
          properties: { rain_days: month.rain_days },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "HIGH",
          index_eligible: true,
        }),
      );
      const humId = `${monthId}:humidity`;
      addOnce(
        store,
        entity({
          id: humId,
          site: "wearthere",
          type: "humidity",
          slug: "rh",
          name: `${month.humidity}% RH`,
          properties: { rh_pct: month.humidity },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${monthId}->HAS_HUMIDITY->${humId}`,
          site: "wearthere",
          type: "HAS_HUMIDITY",
          from_id: monthId,
          to_id: humId,
          properties: { rh_pct: month.humidity },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
      if (month.wind_kmh != null) {
        const windId = `${monthId}:wind`;
        addOnce(
          store,
          entity({
            id: windId,
            site: "wearthere",
            type: "wind",
            slug: "wind",
            name: `${month.wind_kmh} km/h`,
            properties: { wind_kmh: month.wind_kmh },
            provenance: [CLIMATE_PROVENANCE],
            confidence: "MEDIUM",
          }),
        );
        addRel(
          store,
          rel({
            id: `${monthId}->HAS_WIND->${windId}`,
            site: "wearthere",
            type: "HAS_WIND",
            from_id: monthId,
            to_id: windId,
            properties: { wind_kmh: month.wind_kmh },
            provenance: [CLIMATE_PROVENANCE],
            confidence: "MEDIUM",
            index_eligible: false,
          }),
        );
      }
      const cap = capsuleFor(dest, month.month, "classic");
      const decisionId = `${monthId}:packing-decision`;
      addOnce(
        store,
        entity({
          id: decisionId,
          site: "wearthere",
          type: "packing_decision",
          slug: "capsule",
          name: `${dest.city} month ${month.month} packing`,
          properties: {
            pieces: cap.pieces.map((p) => p.id),
            volume_l: cap.volume_l,
            weight_kg: cap.weight_kg,
            weather_kind: "TYPICAL",
          },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${monthId}->HAS_PACKING_DECISION->${decisionId}`,
          site: "wearthere",
          type: "HAS_PACKING_DECISION",
          from_id: monthId,
          to_id: decisionId,
          properties: { rule_version: cap.rule_version },
          provenance: [CLIMATE_PROVENANCE],
          confidence: "MEDIUM",
          index_eligible: true,
        }),
      );
      for (const activity of dest.activities_default?.length ? dest.activities_default : activities) {
        addRel(
          store,
          rel({
            id: `${monthId}->PACKS_FOR_ACTIVITY:${activity}`,
            site: "wearthere",
            type: "PACKS_FOR_ACTIVITY",
            from_id: monthId,
            to_id: decisionId,
            properties: { activity },
            provenance: [CLIMATE_PROVENANCE],
            confidence: "MEDIUM",
            index_eligible: false,
          }),
        );
      }
      const next = dest.climate.find((m) => m.month === month.month + 1);
      if (next) {
        const nextId = `${dest.id}:month:${next.month}`;
        const dT = Math.abs(next.tmax_c - month.tmax_c) + Math.abs(next.tmin_c - month.tmin_c);
        const dR = Math.abs(next.rain_days - month.rain_days);
        addRel(
          store,
          rel({
            id: `${monthId}->DIFFERS_FROM->${nextId}`,
            site: "wearthere",
            type: "DIFFERS_FROM",
            from_id: monthId,
            to_id: nextId,
            properties: { d_temp: dT, d_rain: dR, meaningful: dT >= 3 || dR >= 3 },
            provenance: [CLIMATE_PROVENANCE],
            confidence: "HIGH",
            index_eligible: dT >= 3 || dR >= 3,
          }),
        );
      }
    }
  }
}

function deepenChargematch(store: GraphStore) {
  for (const device of DEVICES) {
    const portId = `${device.id}:port:usb-c`;
    if (device.connector === "USB-C" || device.connector === "Lightning") {
      addOnce(
        store,
        entity({
          id: portId,
          site: "chargematch",
          type: "device_port",
          slug: device.connector.toLowerCase(),
          name: `${device.name} ${device.connector}`,
          properties: { connector: device.connector, max_watts: device.max_watts },
          provenance: [POWER_PROVENANCE],
          confidence: device.tag === "MANUFACTURER_VERIFIED" ? "HIGH" : "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${device.id}->DEVICE_HAS_PORT->${portId}`,
          site: "chargematch",
          type: "DEVICE_HAS_PORT",
          from_id: device.id,
          to_id: portId,
          properties: {},
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      addRel(
        store,
        rel({
          id: `${device.id}->DEVICE_ACCEPTS_MAX_WATTAGE`,
          site: "chargematch",
          type: "DEVICE_ACCEPTS_MAX_WATTAGE",
          from_id: device.id,
          to_id: `${device.id}:power`,
          properties: { watts: device.max_watts },
          provenance: [POWER_PROVENANCE],
          confidence: "HIGH",
          index_eligible: false,
        }),
      );
      if (device.pd_version) {
        addRel(
          store,
          rel({
            id: `${portId}->PORT_SUPPORTS_PROTOCOL`,
            site: "chargematch",
            type: "PORT_SUPPORTS_PROTOCOL",
            from_id: portId,
            to_id: `cm:protocol:${device.pd_version.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            properties: { pps: Boolean(device.pps) },
            provenance: [POWER_PROVENANCE],
            confidence: "HIGH",
            index_eligible: false,
          }),
        );
      }
    }
  }
  for (const charger of CHARGERS) {
    for (const alloc of charger.allocations) {
      const allocId = `${charger.id}:alloc:${alloc.ports.join("+")}`;
      addRel(
        store,
        rel({
          id: `${charger.id}->CHARGER_SPLITS_POWER_AS->${allocId}`,
          site: "chargematch",
          type: "CHARGER_SPLITS_POWER_AS",
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
  }
  for (const cable of CABLES) {
    const amps = cable.max_volts ? Math.round((cable.max_watts / cable.max_volts) * 10) / 10 : null;
    addRel(
      store,
      rel({
        id: `${cable.id}->CABLE_MAX_CURRENT`,
        site: "chargematch",
        type: "CABLE_MAX_CURRENT",
        from_id: cable.id,
        to_id: cable.id,
        properties: { amps, max_watts: cable.max_watts, derived: true },
        provenance: [POWER_PROVENANCE],
        confidence: cable.tag === "UNKNOWN" ? "UNKNOWN" : "HIGH",
        index_eligible: false,
        inferred: amps == null,
      }),
    );
    addRel(
      store,
      rel({
        id: `${cable.id}->CABLE_EMARKED`,
        site: "chargematch",
        type: "CABLE_EMARKED",
        from_id: cable.id,
        to_id: cable.id,
        properties: { e_marker: cable.e_marker },
        provenance: [POWER_PROVENANCE],
        confidence: "HIGH",
        index_eligible: false,
      }),
    );
    addRel(
      store,
      rel({
        id: `${cable.id}->CABLE_MAX_WATTAGE`,
        site: "chargematch",
        type: "CABLE_MAX_WATTAGE",
        from_id: cable.id,
        to_id: cable.id,
        properties: { watts: cable.max_watts },
        provenance: [POWER_PROVENANCE],
        confidence: cable.tag === "UNKNOWN" ? "UNKNOWN" : "HIGH",
        index_eligible: false,
      }),
    );
  }
}

function deepenTripcost(store: GraphStore) {
  const iceId = "tc:vehicle:ice-compact";
  const evId = "tc:vehicle:ev-compact";
  addOnce(
    store,
    entity({
      id: iceId,
      site: "tripcost",
      type: "vehicle_profile",
      slug: "ice-compact",
      name: "Assumed compact petrol car",
      properties: { engine_type: "ICE", fuel_type: "petrol", assumption: true },
      provenance: store.get(ROUTES[0]?.id)?.provenance ?? [],
      confidence: "MEDIUM",
    }),
  );
  addOnce(
    store,
    entity({
      id: evId,
      site: "tripcost",
      type: "vehicle_profile",
      slug: "ev-compact",
      name: "Assumed compact EV",
      properties: { engine_type: "BEV", fuel_type: "electric", assumption: true },
      provenance: store.get(ROUTES[0]?.id)?.provenance ?? [],
      confidence: "MEDIUM",
    }),
  );
  const wearId = "tc:wear-model:v1";
  addOnce(
    store,
    entity({
      id: wearId,
      site: "tripcost",
      type: "wear_model",
      slug: "wear-v1",
      name: "Tyre/brake/service wear per km",
      properties: { family: "EVERGREEN" },
      provenance: store.get(ROUTES[0]?.id)?.provenance ?? [],
      confidence: "MEDIUM",
    }),
  );
  const depId = "tc:depreciation-model:v1";
  addOnce(
    store,
    entity({
      id: depId,
      site: "tripcost",
      type: "depreciation_model",
      slug: "dep-v1",
      name: "Not applied — no residual curve in seed",
      properties: { applied: false },
      provenance: store.get(ROUTES[0]?.id)?.provenance ?? [],
      confidence: "UNKNOWN",
    }),
  );
  const votId = "tc:time-value";
  addOnce(
    store,
    entity({
      id: votId,
      site: "tripcost",
      type: "time_value",
      slug: "vot",
      name: "Value of time is an output, not an assumed wage",
      properties: { unit: "EUR/hour" },
      provenance: store.get(ROUTES[0]?.id)?.provenance ?? [],
      confidence: "HIGH",
    }),
  );
  for (const route of ROUTES) {
    addRel(
      store,
      rel({
        id: `${route.id}->VEHICLE_CONSUMPTION->${iceId}`,
        site: "tripcost",
        type: "VEHICLE_CONSUMPTION",
        from_id: route.id,
        to_id: iceId,
        properties: { l_per_100: route.fuel_l_per_100, assumption: true },
        provenance: store.get(`${route.id}:consumption`)?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
      }),
    );
    const energyId = `${route.id}:energy`;
    addOnce(
      store,
      entity({
        id: energyId,
        site: "tripcost",
        type: "energy_required",
        slug: "energy",
        name: `${Math.round((route.km * route.fuel_l_per_100) / 100)} L or EV kWh`,
        properties: { litres: (route.km * route.fuel_l_per_100) / 100, kwh: (route.km * route.ev_kwh_per_100) / 100 },
        provenance: store.get(`${route.id}:distance`)?.provenance ?? [],
        confidence: "MEDIUM",
      }),
    );
    addRel(
      store,
      rel({
        id: `${route.id}->ROUTE_ENERGY_REQUIRED->${energyId}`,
        site: "tripcost",
        type: "ROUTE_ENERGY_REQUIRED",
        from_id: route.id,
        to_id: energyId,
        properties: { family: "EVERGREEN" },
        provenance: store.get(`${route.id}:distance`)?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
      }),
    );
    if (route.tolls_eur > 0) {
      const tollId = `${route.id}:toll`;
      addOnce(
        store,
        entity({
          id: tollId,
          site: "tripcost",
          type: "toll",
          slug: "toll",
          name: `Tolls ${route.tolls_eur} EUR snapshot`,
          properties: { value: route.tolls_eur, currency: "EUR", observedAt: NOW, expiresAt: "2026-10-01T00:00:00.000Z" },
          provenance: store.get(`${route.id}:cost:toll`)?.provenance ?? [],
          confidence: "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${route.id}->ROUTE_HAS_TOLL->${tollId}`,
          site: "tripcost",
          type: "ROUTE_HAS_TOLL",
          from_id: route.id,
          to_id: tollId,
          properties: { source: "seed-snapshot", not_live: true },
          provenance: store.get(`${route.id}:cost:toll`)?.provenance ?? [],
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
    } else {
      const noneId = `${route.id}:no-toll`;
      addOnce(
        store,
        entity({
          id: noneId,
          site: "tripcost",
          type: "toll",
          slug: "no-toll",
          name: "Explicit no-toll assumption",
          properties: { value: 0, explicit: true },
          provenance: store.get(route.id)?.provenance ?? [],
          confidence: "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${route.id}->ROUTE_NO_TOLL->${noneId}`,
          site: "tripcost",
          type: "ROUTE_NO_TOLL",
          from_id: route.id,
          to_id: noneId,
          properties: { explicit: true },
          provenance: store.get(route.id)?.provenance ?? [],
          confidence: "MEDIUM",
          index_eligible: false,
        }),
      );
    }
    addRel(
      store,
      rel({
        id: `${route.id}->ROUTE_WEAR_COST->${wearId}`,
        site: "tripcost",
        type: "ROUTE_WEAR_COST",
        from_id: route.id,
        to_id: wearId,
        properties: { eur_per_km: route.wear_eur_per_km, family: "EVERGREEN" },
        provenance: store.get(`${route.id}:cost:wear`)?.provenance ?? [],
        confidence: "MEDIUM",
        index_eligible: false,
      }),
    );
    const modes = [`${route.id}:mode:car`, `${route.id}:mode:train`, `${route.id}:mode:flight`, `${route.id}:mode:ev`].filter((id) =>
      store.entities.has(id),
    );
    for (let i = 0; i < modes.length; i++) {
      for (let j = i + 1; j < modes.length; j++) {
        addRel(
          store,
          rel({
            id: `${modes[i]}->ROUTE_ALTERNATIVE->${modes[j]}`,
            site: "tripcost",
            type: "ROUTE_ALTERNATIVE",
            from_id: modes[i],
            to_id: modes[j],
            properties: {},
            provenance: store.get(route.id)?.provenance ?? [],
            confidence: "MEDIUM",
            index_eligible: false,
          }),
        );
      }
    }
    const compared = compareRoute(route, 4);
    const car = compared.modes.find((m) => m.mode === "car");
    const train = compared.modes.find((m) => m.mode === "train");
    if (car && train) {
      const be = timeValueBreakEven(train, car);
      const beId = `${route.id}:break-even`;
      addOnce(
        store,
        entity({
          id: beId,
          site: "tripcost",
          type: "break_even",
          slug: "vot",
          name: be == null ? "No time advantage" : `${be} EUR/h`,
          properties: { eur_per_hour: be, party_size: 4 },
          provenance: store.get(route.id)?.provenance ?? [],
          confidence: "MEDIUM",
        }),
      );
      addRel(
        store,
        rel({
          id: `${route.id}->ROUTE_BREAK_EVEN->${beId}`,
          site: "tripcost",
          type: "ROUTE_BREAK_EVEN",
          from_id: route.id,
          to_id: beId,
          properties: { vs: "car-vs-train", party_size: 4, linked_time_value: votId },
          provenance: store.get(route.id)?.provenance ?? [],
          confidence: "MEDIUM",
          index_eligible: true,
        }),
      );
    }
  }
}

import { describe, expect, it } from "vitest";
import {
  isTrustedDatasetExact,
  validateFactProvenance,
} from "@penta/data-provenance";
import { CLIMATE_PROVENANCE, DESTINATIONS, destinationSurfaces, climateModelOf } from "@penta/wearthere";
import { classifyClimateModel, seasonLabel } from "@penta/demand";
import {
  VIN_SUPPORT,
  VEHICLES,
  decodeVin,
  fitmentScopeOf,
  fitmentStatus,
} from "@penta/autospec";
import {
  MEASURED_CURVES,
  allocate,
  allocationByPort,
  getCharger,
  getDevice,
  getCable,
  powerChain,
  type ChargerProfile,
} from "@penta/chargematch";
import {
  ALL_ERRORS,
  applyAnswer,
  buildDiagnosticTree,
  diagnose,
  getError,
  initialState,
  type ErrorProfile,
} from "@penta/fixcode";
import { compareRoute, costValue, findScenarioByBestMode, type RouteRecord } from "@penta/tripcost";

describe("WearThere provenance QA", () => {
  it("PRIMARY_DATABASE + local name only is not TRUSTED_DATASET_EXACT", () => {
    const v = validateFactProvenance({
      source_type: "PRIMARY_DATABASE",
      source_name: "compiled-monthly-normals",
      retrieved_at: "2026-01-15T00:00:00.000Z",
      verification_method: "UNVERIFIED",
      locator: { dataset: "compiled-monthly-normals" },
    });
    expect(v.level).not.toBe("TRUSTED_DATASET_EXACT");
    expect(["DATASET_GENERAL", "UNVERIFIED_DATASET", "PRIMARY_DATABASE_GENERAL"]).toContain(v.level);
    expect(isTrustedDatasetExact({
      source_type: "PRIMARY_DATABASE",
      locator: { dataset: "compiled-monthly-normals" },
    })).toBe(false);
  });

  it("PRIMARY_DATABASE without URL and station/grid is not exact external provenance", () => {
    const v = validateFactProvenance({
      source_type: CLIMATE_PROVENANCE.source_type,
      source_url: CLIMATE_PROVENANCE.source_url,
      source_name: CLIMATE_PROVENANCE.source_name,
      retrieved_at: CLIMATE_PROVENANCE.retrieved_at,
      verified_at: CLIMATE_PROVENANCE.verified_at,
      verification_method: CLIMATE_PROVENANCE.verification_method,
      locator: CLIMATE_PROVENANCE.locator,
    });
    expect(v.level).not.toBe("TRUSTED_DATASET_EXACT");
    expect(v.verified_primary).toBe(false);
  });

  it("Singapore month pages collapse to the city guide", () => {
    const sg = DESTINATIONS.find((d) => d.slug === "singapore")!;
    expect(climateModelOf(sg)).toBe("EQUATORIAL");
    expect(destinationSurfaces(sg)).toHaveLength(0);
  });

  it("Sydney Dec/Jan/Feb are summer", () => {
    expect(seasonLabel("SOUTHERN_TEMPERATE", 12)).toBe("summer");
    expect(seasonLabel("SOUTHERN_TEMPERATE", 1)).toBe("summer");
    expect(seasonLabel("SOUTHERN_TEMPERATE", 2)).toBe("summer");
    const syd = DESTINATIONS.find((d) => d.slug === "sydney")!;
    expect(climateModelOf(syd)).toBe("SOUTHERN_TEMPERATE");
    expect(destinationSurfaces(syd).some((s) => s.slug === "summer")).toBe(true);
  });

  it("equatorial does not produce four temperate seasons", () => {
    const model = classifyClimateModel({
      lat: 1.35,
      months: [
        { month: 1, tmax: 31, tmin: 24, rain_mm: 200 },
        { month: 6, tmax: 32, tmin: 25, rain_mm: 160 },
      ],
    });
    expect(model).toBe("EQUATORIAL");
    expect(seasonLabel(model, 1)).toBe("year-round-humid");
    expect(seasonLabel(model, 7)).not.toBe("summer");
  });
});

describe("AutoSpec exact fitment QA", () => {
  const bmw = VEHICLES.find((v) => v.variant_slug === "320d-b47")!;

  it("HIGH confidence is not VERIFIED", () => {
    expect(fitmentStatus("HIGH", "UNVERIFIED")).toBe("HIGH_CONFIDENCE");
    expect(fitmentStatus("HIGH", "UNVERIFIED")).not.toBe("VERIFIED");
    expect(fitmentStatus("HIGH", "VERIFIED")).toBe("VERIFIED");
  });

  it("missing wheel config where required is not EXACT", () => {
    const scope = fitmentScopeOf({ ...bmw, tyres: undefined }, "tyre_pressure");
    expect(scope.confidence).not.toBe("EXACT");
    expect(scope.missingDimensions).toContain("wheelConfig");
  });

  it("wrong market fails", () => {
    const scope = fitmentScopeOf(bmw, "oil", { market: "US" });
    expect(scope.missingDimensions).toContain("market");
    expect(scope.confidence).not.toBe("EXACT");
  });

  it("wrong engine fails", () => {
    const scope = fitmentScopeOf(bmw, "oil", { engineCode: "B48B20" });
    expect(scope.missingDimensions).toContain("engineCode");
  });

  it("year outside scope fails", () => {
    const scope = fitmentScopeOf(bmw, "oil", { year: 2010 });
    expect(scope.missingDimensions).toContain("yearFrom");
  });

  it("wheel-specific tyre pressure cannot use a generic other wheel", () => {
    const scope = fitmentScopeOf(bmw, "tyre_pressure", { wheelConfig: "195/65R15" });
    expect(scope.confidence).not.toBe("EXACT");
    expect(scope.missingDimensions).toContain("wheelConfig");
  });

  it("WMI decode remains low confidence", async () => {
    expect(VIN_SUPPORT).toBe("NOT_IMPLEMENTED");
    const decoded = await decodeVin("WBA8E9C50GK123456");
    expect(decoded.confidence).toBe("LOW");
  });
});

describe("ChargeMatch negotiation QA", () => {
  const ppsOnly: ChargerProfile = {
    id: "chg:test-pps",
    name: "PPS-only 45W fixture",
    slug: "test-pps",
    brand: "Test",
    total_watts: 45,
    pd_version: "PD 3.0",
    demand: 1,
    tag: "PROTOCOL_INFERRED",
    ports: [{ id: "c1", label: "C1", watts: 45, pdos: [{ volts: 20, amps: 2.25, watts: 45, pps: true }] }],
    allocations: [{ ports: ["c1"], watts: [45], byPort: { c1: 45 } }],
  };

  it("selected port only determines PDO candidates", () => {
    const phone = getDevice("iphone-16")!;
    const gan = getCharger("gan-100w-3c1a")!;
    const onA = powerChain({ device: phone, charger: gan, usedPorts: ["c1", "c2", "a"], selectedPort: "a" });
    expect(onA.port).toBe("a");
    expect(onA.protocolCap).toBeLessThanOrEqual(18);
    expect(onA.delivered).toBeLessThanOrEqual(18);
  });

  it("device without PPS cannot negotiate PPS-only peak", () => {
    const phone = getDevice("iphone-16")!;
    expect(phone.pps).toBeFalsy();
    const chain = powerChain({ device: phone, charger: ppsOnly });
    expect(chain.protocolCap).toBe(0);
    expect(chain.delivered).toBe(0);
    expect(chain.limiting).toBe("protocol");
  });

  it("device PPS + charger PPS can negotiate", () => {
    const galaxy = getDevice("galaxy-s24")!;
    expect(galaxy.pps).toBe(true);
    const chain = powerChain({ device: galaxy, charger: ppsOnly });
    expect(chain.delivered).toBeGreaterThan(0);
    expect(chain.protocol).toBe("USB_PD_PPS");
  });

  it("cable limit wins", () => {
    const laptop = getDevice("macbook-pro-14-m3")!;
    const brick70 = getCharger("apple-70w")!;
    const cable60 = getCable("apple-usbc-60w")!;
    const chain = powerChain({ device: laptop, charger: brick70, cable: cable60 });
    expect(chain.limiting).toBe("cable");
    expect(chain.delivered).toBeLessThanOrEqual(60);
  });

  it("allocation limit wins and port order does not swap wattages", () => {
    const gan = getCharger("gan-100w-3c1a")!;
    const alloc = allocate(gan, ["a", "c1", "c2"]);
    const byPort = allocationByPort(alloc);
    expect(byPort.a).toBe(18);
    expect(byPort.c1).toBe(45);
    expect(byPort.c2).toBe(30);
    const phone = getDevice("iphone-16")!;
    const chain = powerChain({ device: phone, charger: gan, usedPorts: ["c1", "c2"], selectedPort: "c2" });
    expect(chain.allocationCap).toBe(30);
    expect(chain.limiting === "allocation" || chain.delivered <= 30).toBe(true);
  });

  it("device acceptance wins", () => {
    const phone = getDevice("iphone-16")!;
    const brick70 = getCharger("apple-70w")!;
    const chain = powerChain({ device: phone, charger: brick70 });
    expect(chain.limiting).toBe("device");
    expect(chain.delivered).toBe(phone.max_watts);
  });

  it("rated is not measured", () => {
    expect(MEASURED_CURVES).toHaveLength(0);
    const chain = powerChain({ device: getDevice("iphone-16")!, charger: getCharger("apple-20w")! });
    expect(chain.measured).toBeNull();
    expect(chain.rated).toBe(true);
    expect(chain.powerKind).not.toBe("MEASURED");
  });
});

describe("FixCode diagnostic + exact source QA", () => {
  it("3-answer diagnostic question works", () => {
    const profile = getError("samsung", "washer", "4C")!;
    const q = profile.questions.find((item) => item.answers.length >= 3)!;
    expect(q.answers.length).toBeGreaterThanOrEqual(3);
    const tree = buildDiagnosticTree(profile);
    const check = tree.checks.find((c) => c.questionId === q.id)!;
    expect(check.branches.length).toBeGreaterThanOrEqual(3);
    const state = applyAnswer(profile, initialState(profile), q.id, q.answers[2].id);
    expect(state.answers[0].answer_id).toBe(q.answers[2].id);
  });

  it("unsafe / professional-only node stops self-service", () => {
    const profile: ErrorProfile = {
      ...getError("samsung", "washer", "4C")!,
      questions: [
        {
          id: "live-mains",
          text: "Probe live mains on the heater circuit?",
          why: "Requires live 220V testing.",
          answers: [
            { id: "yes", label: "Yes", likelihoods: { valve: 0.8 } },
            { id: "no", label: "No", likelihoods: { supply: 0.8 } },
          ],
        },
      ],
    };
    const tree = buildDiagnosticTree(profile);
    expect(tree.checks[0].safe).toBe(false);
    expect(tree.checks[0].safety).toBe("PROFESSIONAL_ONLY");
    const result = diagnose(profile, initialState(profile));
    expect(result.next_question).toBeNull();
    const after = applyAnswer(profile, initialState(profile), "live-mains", "yes");
    const stopped = diagnose(profile, after);
    expect(stopped.self_service_blocked || stopped.next_question === null).toBe(true);
    expect(stopped.recommend_technician).toBe(true);
  });

  it("unknown manufacturer error remains unknown", () => {
    expect(getError("unknown-brand", "washer", "ZZZ")).toBeUndefined();
  });

  it("exact locator is required for PRIMARY_EXACT", () => {
    const generic = validateFactProvenance({
      source_type: "MANUFACTURER",
      source_url: "https://www.samsung.com/us/support/",
      source_name: "Samsung support",
      retrieved_at: "2026-09-15T00:00:00.000Z",
      verified_at: "2026-09-15T00:00:00.000Z",
    });
    expect(generic.level).toBe("PRIMARY_GENERAL");
    const exact = getError("samsung", "washer", "4C")!.provenance[0];
    const v = validateFactProvenance({
      source_type: exact.source_type,
      source_url: exact.source_url,
      source_name: exact.source_name,
      retrieved_at: exact.retrieved_at,
      verified_at: exact.verified_at,
      verification_method: exact.verification_method,
      locator: exact.locator,
    });
    expect(v.level).toBe("PRIMARY_EXACT");
    expect(ALL_ERRORS.filter((e) => e.provenance.some((p) => p.verified_at && p.locator && p.source_url && !p.source_url.endsWith("/support/"))).length).toBeGreaterThanOrEqual(25);
  });

  it("publication_date is source-specific and not copied onto LG/Bosch", () => {
    const samsung = getError("samsung", "washer", "4C")!.provenance[0];
    const lg = getError("lg", "washer", "OE")!.provenance[0];
    const bosch = getError("bosch", "dishwasher", "E15")!.provenance[0];
    expect(samsung.locator?.publication_date).toBe("2025-02-19");
    expect(lg.locator?.publication_date).toBeUndefined();
    expect(bosch.locator?.publication_date).toBeUndefined();
  });
});

describe("TripCost mixed evidence QA", () => {
  it("fuel snapshot can be RECENT_SNAPSHOT while train stays HEURISTIC", () => {
    const base = compareRoute(
      {
        ...(
          {
            id: "test-mix",
            from: { id: "paris", name: "Paris", slug: "paris", country: "FR" },
            to: { id: "lyon", name: "Lyon", slug: "lyon", country: "FR" },
            km: 465,
            demand: 90,
            tolls_eur: 36,
            fuel_l_per_100: 7.2,
            fuel_eur_per_l: 1.79,
            parking_eur: 12,
            wear_eur_per_km: 0.08,
            ev_kwh_per_100: 18,
            ev_eur_per_kwh: 0.39,
            ev_charge_stops: 1,
            ev_charge_minutes: 25,
            train_eur_pp: 68,
            train_minutes: 118,
            bus_eur_pp: 22,
            bus_minutes: 340,
            flight_eur_pp: 95,
            flight_minutes: 70,
            airport_access_minutes: 55,
            city_transfer_minutes: 45,
            security_buffer_minutes: 90,
            rideshare_eur: 280,
            costs: {
              fuel: costValue(1.79, "RECENT_SNAPSHOT", { observedAt: "2026-08-01T00:00:00.000Z", sourceId: "test-fuel" }),
              tolls: costValue(36, "STATIC_REFERENCE", { sourceId: "test-toll" }),
              parking: costValue(12, "HEURISTIC"),
              train: costValue(68, "HEURISTIC"),
              bus: costValue(22, "HEURISTIC"),
              flight: costValue(95, "HEURISTIC"),
              rideshare: costValue(280, "HEURISTIC"),
              ev_electricity: costValue(0.39, "HEURISTIC"),
            },
          } satisfies RouteRecord
        ),
      },
      2,
    );
    expect(base.modes.find((m) => m.mode === "car")?.price_kind).toBe("HISTORICAL_PRICE");
    expect(base.modes.find((m) => m.mode === "train")?.price_kind).toBe("HEURISTIC_PRICE");
    expect(base.modes.every((m) => m.live_fare === false)).toBe(true);
    expect(base.modes.find((m) => m.mode === "car")?.assumptions.join(" ")).toMatch(/Recent snapshot/i);
    expect(base.modes.find((m) => m.mode === "train")?.assumptions.join(" ")).toMatch(/Typical estimate/i);
  });

  it("break-even recalculates when fuel or travellers change", async () => {
    const { getRoute, breakEvenByTravellers } = await import("@penta/tripcost");
    const route = getRoute("paris", "lyon")!;
    const cheapFuel = compareRoute({ ...route, fuel_eur_per_l: 0.5 }, 1);
    const dearFuel = compareRoute({ ...route, fuel_eur_per_l: 4 }, 1);
    expect(cheapFuel.modes.find((m) => m.mode === "car")!.cash_eur).toBeLessThan(
      dearFuel.modes.find((m) => m.mode === "car")!.cash_eur,
    );
    const one = compareRoute(route, 1);
    const four = compareRoute(route, 4);
    expect(one.modes.find((m) => m.mode === "car")!.per_person_cash).toBeGreaterThan(
      four.modes.find((m) => m.mode === "car")!.per_person_cash,
    );
    const table = breakEvenByTravellers(route);
    expect(table[0].travellers).toBe(1);
    expect(table.length).toBeGreaterThan(1);
  });

  it("finds only modes that actually win, and does not invent train/car/flight", () => {
    expect(findScenarioByBestMode("bus")).toEqual(expect.objectContaining({ from: expect.any(String) }));
    expect(findScenarioByBestMode("ev")).toEqual(expect.objectContaining({ from: expect.any(String) }));
    expect(findScenarioByBestMode("train")).toBeNull();
    expect(findScenarioByBestMode("car")).toBeNull();
    expect(findScenarioByBestMode("flight")).toBeNull();
  });
});

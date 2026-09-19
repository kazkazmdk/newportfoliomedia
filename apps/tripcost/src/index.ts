import { provenance, type ConfidenceLevel } from "@penta/data-provenance";
import { evaluatePageQuality, searchDemandScore } from "@penta/quality-gate";
import type { PageRecord } from "@penta/graph-core";
import { MORE_PLACES, moreRoutes } from "./routes-more";
import { scaleCorridors, scalePlaces } from "./corridors-scale";

export type Place = { id: string; name: string; slug: string; country: string };

export type ModeId = "car" | "ev" | "train" | "bus" | "flight" | "rideshare";

export const PRICE_KINDS = [
  "OBSERVED_PRICE",
  "CURRENT_PROVIDER_PRICE",
  "HISTORICAL_PRICE",
  "ESTIMATED_PRICE",
  "HEURISTIC_PRICE",
] as const;
export type PriceKind = (typeof PRICE_KINDS)[number];

export type CostEvidence = "LIVE" | "RECENT_SNAPSHOT" | "STATIC_REFERENCE" | "DERIVED" | "HEURISTIC";

export type CostValue = {
  value: number;
  currency: string;
  evidence: CostEvidence;
  observedAt?: string;
  validUntil?: string;
  sourceId?: string;
};

export function costValue(
  value: number,
  evidence: CostEvidence = "HEURISTIC",
  extra: Partial<CostValue> = {},
): CostValue {
  return { value, currency: "EUR", evidence, ...extra };
}

export function costNumber(input: number | CostValue): number {
  return typeof input === "number" ? input : input.value;
}

export type RouteCosts = {
  fuel: CostValue;
  tolls: CostValue;
  parking: CostValue;
  train: CostValue;
  bus: CostValue;
  flight: CostValue;
  rideshare: CostValue;
  ev_electricity: CostValue;
};

export function routeCosts(route: RouteRecord): RouteCosts {
  if (route.costs) return route.costs;
  return {
    fuel: costValue(route.fuel_eur_per_l, "HEURISTIC", { sourceId: "seed-fuel" }),
    tolls: costValue(route.tolls_eur, "HEURISTIC", { sourceId: "seed-toll" }),
    parking: costValue(route.parking_eur, "HEURISTIC", { sourceId: "seed-parking" }),
    train: costValue(route.train_eur_pp, "HEURISTIC", { sourceId: "seed-train" }),
    bus: costValue(route.bus_eur_pp, "HEURISTIC", { sourceId: "seed-bus" }),
    flight: costValue(route.flight_eur_pp, "HEURISTIC", { sourceId: "seed-flight" }),
    rideshare: costValue(route.rideshare_eur, "HEURISTIC", { sourceId: "seed-rideshare" }),
    ev_electricity: costValue(route.ev_eur_per_kwh, "HEURISTIC", { sourceId: "seed-ev" }),
  };
}

export function priceKindFrom(evidence: CostEvidence): PriceKind {
  if (evidence === "LIVE") return "CURRENT_PROVIDER_PRICE";
  if (evidence === "RECENT_SNAPSHOT") return "HISTORICAL_PRICE";
  if (evidence === "STATIC_REFERENCE") return "ESTIMATED_PRICE";
  if (evidence === "DERIVED") return "ESTIMATED_PRICE";
  return "HEURISTIC_PRICE";
}

export function costLabel(evidence: CostEvidence): string {
  if (evidence === "LIVE") return "Live fare";
  if (evidence === "RECENT_SNAPSHOT") return "Recent snapshot";
  if (evidence === "STATIC_REFERENCE") return "Published reference";
  if (evidence === "DERIVED") return "Derived";
  return "Typical estimate";
}

export type CostBreakdown = {
  base_transport: number;
  fuel: number;
  tolls: number;
  parking: number;
  tickets: number;
  fees: number;
  transfers: number;
  local_transport: number;
  time_cost: number;
  door_to_door: number;
};

export type PriceSnapshot = {
  source: string;
  observed_at: string;
  valid_from?: string;
  valid_to?: string | null;
  currency: "EUR";
  party_size: number;
  booking_window?: string;
  constraints?: string[];
  price_kind: PriceKind;
  live_fare: false;
};

export type ModeQuote = {
  mode: ModeId;
  cash_eur: number;
  true_eur: number;
  minutes_door: number;
  minutes_in_vehicle: number;
  per_person_cash: number;
  assumptions: string[];
  confidence: ConfidenceLevel;
  available: boolean;
  retrieved_at: string;
  valid_until?: string | null;
  stale: boolean;
  currency: "EUR";
  source_id: string;
  price_kind: PriceKind;
  live_fare: false;
  cost_breakdown?: CostBreakdown;
  snapshot?: PriceSnapshot;
};

export type RouteRecord = {
  id: string;
  from: Place;
  to: Place;
  km: number;
  demand: number;
  tolls_eur: number;
  fuel_l_per_100: number;
  fuel_eur_per_l: number;
  parking_eur: number;
  wear_eur_per_km: number;
  ev_kwh_per_100: number;
  ev_eur_per_kwh: number;
  ev_charge_stops: number;
  ev_charge_minutes: number;
  train_eur_pp: number;
  train_minutes: number;
  bus_eur_pp: number;
  bus_minutes: number;
  flight_eur_pp: number;
  flight_minutes: number;
  airport_access_minutes: number;
  city_transfer_minutes: number;
  security_buffer_minutes: number;
  rideshare_eur: number;
  costs?: RouteCosts;
  compare_only?: boolean;
};

export const CORE_PLACES: Place[] = [
  { id: "paris", name: "Paris", slug: "paris", country: "FR" },
  { id: "lyon", name: "Lyon", slug: "lyon", country: "FR" },
  { id: "barcelona", name: "Barcelona", slug: "barcelona", country: "ES" },
  { id: "london", name: "London", slug: "london", country: "UK" },
  { id: "amsterdam", name: "Amsterdam", slug: "amsterdam", country: "NL" },
  { id: "berlin", name: "Berlin", slug: "berlin", country: "DE" },
  { id: "munich", name: "Munich", slug: "munich", country: "DE" },
  { id: "milan", name: "Milan", slug: "milan", country: "IT" },
  { id: "brussels", name: "Brussels", slug: "brussels", country: "BE" },
];

function uniquePlaces(rows: Place[]): Place[] {
  const map = new Map<string, Place>();
  for (const row of rows) map.set(row.slug, row);
  return [...map.values()];
}

export const PLACES: Place[] = uniquePlaces([...CORE_PLACES, ...MORE_PLACES, ...scalePlaces()]);

export const CORE_ROUTES: RouteRecord[] = [
  {
    id: "paris-lyon",
    from: PLACES[0],
    to: PLACES[1],
    km: 465,
    demand: 92,
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
  },
  {
    id: "paris-barcelona",
    from: PLACES[0],
    to: PLACES[2],
    km: 1030,
    demand: 88,
    tolls_eur: 82,
    fuel_l_per_100: 7.0,
    fuel_eur_per_l: 1.79,
    parking_eur: 20,
    wear_eur_per_km: 0.08,
    ev_kwh_per_100: 18.5,
    ev_eur_per_kwh: 0.42,
    ev_charge_stops: 3,
    ev_charge_minutes: 90,
    train_eur_pp: 110,
    train_minutes: 400,
    bus_eur_pp: 45,
    bus_minutes: 760,
    flight_eur_pp: 85,
    flight_minutes: 110,
    airport_access_minutes: 55,
    city_transfer_minutes: 50,
    security_buffer_minutes: 90,
    rideshare_eur: 620,
  },
  {
    id: "london-paris",
    from: PLACES[3],
    to: PLACES[0],
    km: 460,
    demand: 90,
    tolls_eur: 0,
    fuel_l_per_100: 7.4,
    fuel_eur_per_l: 1.72,
    parking_eur: 25,
    wear_eur_per_km: 0.09,
    ev_kwh_per_100: 19,
    ev_eur_per_kwh: 0.45,
    ev_charge_stops: 1,
    ev_charge_minutes: 35,
    train_eur_pp: 120,
    train_minutes: 140,
    bus_eur_pp: 35,
    bus_minutes: 480,
    flight_eur_pp: 70,
    flight_minutes: 80,
    airport_access_minutes: 60,
    city_transfer_minutes: 50,
    security_buffer_minutes: 90,
    rideshare_eur: 0,
  },
  {
    id: "berlin-munich",
    from: PLACES[5],
    to: PLACES[6],
    km: 585,
    demand: 76,
    tolls_eur: 0,
    fuel_l_per_100: 6.8,
    fuel_eur_per_l: 1.74,
    parking_eur: 10,
    wear_eur_per_km: 0.08,
    ev_kwh_per_100: 17.5,
    ev_eur_per_kwh: 0.4,
    ev_charge_stops: 1,
    ev_charge_minutes: 30,
    train_eur_pp: 55,
    train_minutes: 240,
    bus_eur_pp: 28,
    bus_minutes: 420,
    flight_eur_pp: 70,
    flight_minutes: 70,
    airport_access_minutes: 50,
    city_transfer_minutes: 40,
    security_buffer_minutes: 75,
    rideshare_eur: 320,
  },
  {
    id: "paris-amsterdam",
    from: PLACES[0],
    to: PLACES[4],
    km: 505,
    demand: 80,
    tolls_eur: 22,
    fuel_l_per_100: 7.1,
    fuel_eur_per_l: 1.79,
    parking_eur: 18,
    wear_eur_per_km: 0.08,
    ev_kwh_per_100: 18,
    ev_eur_per_kwh: 0.41,
    ev_charge_stops: 1,
    ev_charge_minutes: 30,
    train_eur_pp: 85,
    train_minutes: 200,
    bus_eur_pp: 30,
    bus_minutes: 400,
    flight_eur_pp: 75,
    flight_minutes: 80,
    airport_access_minutes: 55,
    city_transfer_minutes: 40,
    security_buffer_minutes: 90,
    rideshare_eur: 340,
  },
  {
    id: "paris-brussels",
    from: PLACES[0],
    to: PLACES[8],
    km: 312,
    demand: 74,
    tolls_eur: 18,
    fuel_l_per_100: 7.0,
    fuel_eur_per_l: 1.79,
    parking_eur: 14,
    wear_eur_per_km: 0.08,
    ev_kwh_per_100: 17,
    ev_eur_per_kwh: 0.4,
    ev_charge_stops: 0,
    ev_charge_minutes: 0,
    train_eur_pp: 55,
    train_minutes: 82,
    bus_eur_pp: 18,
    bus_minutes: 240,
    flight_eur_pp: 0,
    flight_minutes: 0,
    airport_access_minutes: 55,
    city_transfer_minutes: 35,
    security_buffer_minutes: 90,
    rideshare_eur: 210,
  },
  {
    id: "milan-munich",
    from: PLACES[7],
    to: PLACES[6],
    km: 430,
    demand: 62,
    tolls_eur: 40,
    fuel_l_per_100: 7.5,
    fuel_eur_per_l: 1.81,
    parking_eur: 12,
    wear_eur_per_km: 0.09,
    ev_kwh_per_100: 19,
    ev_eur_per_kwh: 0.43,
    ev_charge_stops: 1,
    ev_charge_minutes: 35,
    train_eur_pp: 70,
    train_minutes: 460,
    bus_eur_pp: 32,
    bus_minutes: 420,
    flight_eur_pp: 80,
    flight_minutes: 65,
    airport_access_minutes: 50,
    city_transfer_minutes: 45,
    security_buffer_minutes: 75,
    rideshare_eur: 0,
  },
];

function uniqueRoutes(rows: RouteRecord[]): RouteRecord[] {
  const map = new Map<string, RouteRecord>();
  for (const row of rows) {
    if (!map.has(row.id)) map.set(row.id, row);
  }
  return [...map.values()];
}

const SEEDED_ROUTES = uniqueRoutes([...CORE_ROUTES, ...moreRoutes(PLACES)]);
export const ROUTES: RouteRecord[] = uniqueRoutes([
  ...SEEDED_ROUTES,
  ...scaleCorridors(new Set(SEEDED_ROUTES.map((row) => row.id))).map((row) => ({
    ...row,
    compare_only: true,
  })),
]);

export type ProviderMeta = {
  id: string;
  replaceability: number;
  notes: string;
};

export const PROVIDERS: Record<string, ProviderMeta> = {
  RailProvider: { id: "seed-rail", replaceability: 80, notes: "Seed fares, not a live GDS. Swap later." },
  FlightProvider: { id: "seed-flight", replaceability: 70, notes: "Door-to-door uses buffers, not block time alone." },
  BusProvider: { id: "seed-bus", replaceability: 85, notes: "Typical coach fares." },
  RoutingProvider: { id: "seed-km", replaceability: 75, notes: "Fixed km table for launch routes." },
  TollProvider: { id: "seed-toll", replaceability: 60, notes: "Typical class 1 tolls. Recheck before a trip." },
  FuelPriceProvider: { id: "seed-fuel", replaceability: 50, notes: "Snapshot €/L, not a live pump feed." },
};

export const RULE_VERSION = "tripcost-v1";

function round(n: number) {
  return Math.round(n);
}

export function sanitizeTravellers(raw: unknown, fallback = 2): number {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(Array.isArray(raw) ? raw[0] : raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(6, Math.max(1, Math.round(n)));
}

export function compareRoute(
  route: RouteRecord,
  travellers: number,
  trueCost = false,
  now = new Date(),
): { modes: ModeQuote[]; best: ModeId; cheaper_from?: { vs: ModeId; from_travellers: number } } {
  const fuel = (route.km * route.fuel_l_per_100) / 100 * route.fuel_eur_per_l;
  const carCash = fuel + route.tolls_eur + route.parking_eur;
  const carTrue = carCash + route.km * route.wear_eur_per_km;
  const evCash =
    (route.km * route.ev_kwh_per_100) / 100 * route.ev_eur_per_kwh + route.tolls_eur + route.parking_eur;
  const evTrue = evCash + route.km * 0.05;
  const carMinutes = Math.round((route.km / 95) * 60);
  const flightDoor =
    route.flight_minutes > 0
      ? route.airport_access_minutes +
        route.security_buffer_minutes +
        route.flight_minutes +
        route.city_transfer_minutes
      : 0;

  const costs = routeCosts(route);
  const priceMeta = (evidence: CostEvidence, sourceId: string) => ({
    retrieved_at: costs.fuel.observedAt ?? PRICE_PROVENANCE.retrieved_at,
    valid_until: PRICE_PROVENANCE.valid_until,
    stale: PRICE_PROVENANCE.valid_until ? new Date(PRICE_PROVENANCE.valid_until).getTime() < now.getTime() : false,
    currency: "EUR" as const,
    source_id: sourceId,
    price_kind: priceKindFrom(evidence),
    live_fare: false as const,
    snapshot: {
      source: sourceId,
      observed_at: PRICE_PROVENANCE.retrieved_at,
      valid_from: PRICE_PROVENANCE.retrieved_at,
      valid_to: PRICE_PROVENANCE.valid_until,
      currency: "EUR" as const,
      party_size: travellers,
      price_kind: priceKindFrom(evidence),
      live_fare: false as const,
      constraints: [evidence === "HEURISTIC" ? "heuristic — not a live fare" : `${evidence} — not a live GDS fare`],
    },
  });

  const allModes: ModeQuote[] = [
    {
      mode: "car",
      cash_eur: round(carCash),
      true_eur: round(carTrue),
      minutes_door: carMinutes,
      minutes_in_vehicle: carMinutes,
      per_person_cash: round(carCash / travellers),
      assumptions: [
        `Cash: fuel + tolls + parking. True cost adds wear at ${route.wear_eur_per_km} €/km.`,
        `${route.fuel_l_per_100} L/100 km`,
        `Fuel ${route.fuel_eur_per_l.toFixed(2)} €/L — ${costLabel(costs.fuel.evidence)}`,
        `Tolls ${route.tolls_eur} € — ${costLabel(costs.tolls.evidence)}`,
        `Parking ${route.parking_eur} € — ${costLabel(costs.parking.evidence)}`,
      ],
      confidence: "MEDIUM",
      available: true,
      ...priceMeta(costs.fuel.evidence, costs.fuel.sourceId ?? "seed-fuel"),
      cost_breakdown: {
        base_transport: 0,
        fuel: round(fuel),
        tolls: route.tolls_eur,
        parking: route.parking_eur,
        tickets: 0,
        fees: 0,
        transfers: 0,
        local_transport: 0,
        time_cost: 0,
        door_to_door: round(carCash),
      },
    },
    {
      mode: "ev",
      cash_eur: round(evCash),
      true_eur: round(evTrue),
      minutes_door: carMinutes + route.ev_charge_minutes,
      minutes_in_vehicle: carMinutes,
      per_person_cash: round(evCash / travellers),
      assumptions: [
        `${route.ev_kwh_per_100} kWh/100 km`,
        `${route.ev_eur_per_kwh.toFixed(2)} €/kWh public mix`,
        `${route.ev_charge_stops} charge stops, +${route.ev_charge_minutes} min`,
      ],
      confidence: "LOW",
      available: true,
      ...priceMeta(costs.ev_electricity.evidence, costs.ev_electricity.sourceId ?? "seed-ev"),
    },
    {
      mode: "train",
      cash_eur: round(route.train_eur_pp * travellers),
      true_eur: round(route.train_eur_pp * travellers),
      minutes_door: route.train_minutes + 40,
      minutes_in_vehicle: route.train_minutes,
      per_person_cash: round(route.train_eur_pp),
      assumptions: [
        `Train ${route.train_eur_pp} €/person — ${costLabel(costs.train.evidence)}. Not a live ticket.`,
      ],
      confidence: "MEDIUM",
      available: route.train_eur_pp > 0,
      ...priceMeta(costs.train.evidence, costs.train.sourceId ?? "seed-train"),
    },
    {
      mode: "bus",
      cash_eur: round(route.bus_eur_pp * travellers),
      true_eur: round(route.bus_eur_pp * travellers),
      minutes_door: route.bus_minutes + 30,
      minutes_in_vehicle: route.bus_minutes,
      per_person_cash: round(route.bus_eur_pp),
      assumptions: [`Coach ${route.bus_eur_pp} €/person — ${costLabel(costs.bus.evidence)}.`],
      confidence: "MEDIUM",
      available: route.bus_eur_pp > 0,
      ...priceMeta(costs.bus.evidence, costs.bus.sourceId ?? "seed-bus"),
    },
    {
      mode: "flight",
      cash_eur: round(route.flight_eur_pp * travellers),
      true_eur: round(route.flight_eur_pp * travellers),
      minutes_door: flightDoor,
      minutes_in_vehicle: route.flight_minutes,
      per_person_cash: round(route.flight_eur_pp),
      assumptions: [
        `Door-to-door ${flightDoor} min = access ${route.airport_access_minutes} + security ${route.security_buffer_minutes} + block ${route.flight_minutes} + city ${route.city_transfer_minutes}.`,
        "Block time alone is not the comparison.",
      ],
      confidence: "MEDIUM",
      available: route.flight_eur_pp > 0,
      ...priceMeta(costs.flight.evidence, costs.flight.sourceId ?? "seed-flight"),
    },
    {
      mode: "rideshare",
      cash_eur: round(route.rideshare_eur),
      true_eur: round(route.rideshare_eur),
      minutes_door: carMinutes,
      minutes_in_vehicle: carMinutes,
      per_person_cash: route.rideshare_eur ? round(route.rideshare_eur / travellers) : 0,
      assumptions: ["Point estimate. Live Uber/Bolt not connected."],
      confidence: "LOW",
      available: route.rideshare_eur > 0,
      ...priceMeta(costs.rideshare.evidence, costs.rideshare.sourceId ?? "seed-rideshare"),
    },
  ];

  const modes = allModes.filter((mode) => mode.available);

  const metric = (m: ModeQuote) => (trueCost ? m.true_eur : m.cash_eur);
  const best = [...modes].sort((a, b) => metric(a) - metric(b))[0]?.mode ?? "car";

  let cheaper_from: { vs: ModeId; from_travellers: number } | undefined;
  const train = modes.find((m) => m.mode === "train");
  if (train) {
    for (let n = 1; n <= 5; n++) {
      if (carCash / n < train.per_person_cash) {
        cheaper_from = { vs: "train", from_travellers: n };
        break;
      }
    }
  }
  return { modes, best, cheaper_from };
}

export function breakEvenByTravellers(
  route: RouteRecord,
  maxTravellers = 6,
): Array<{ travellers: number; cheaper: ModeId; carCash: number; trainCash: number }> {
  const rows: Array<{ travellers: number; cheaper: ModeId; carCash: number; trainCash: number }> = [];
  for (let n = 1; n <= maxTravellers; n += 1) {
    const compared = compareRoute(route, n, false);
    const car = compared.modes.find((m) => m.mode === "car");
    const train = compared.modes.find((m) => m.mode === "train");
    if (!car || !train) continue;
    rows.push({
      travellers: n,
      cheaper: car.per_person_cash <= train.per_person_cash ? "car" : "train",
      carCash: car.cash_eur,
      trainCash: train.cash_eur,
    });
  }
  return rows;
}

export function timeValueBreakEven(a: ModeQuote, b: ModeQuote): number | null {
  const extraCash = a.cash_eur - b.cash_eur;
  const savedHours = (b.minutes_door - a.minutes_door) / 60;
  if (savedHours <= 0) return null;
  return Math.round((extraCash / savedHours) * 10) / 10;
}

export function getRoute(from: string, to: string) {
  return ROUTES.find((r) => r.from.slug === from && r.to.slug === to);
}

export function findScenarioByBestMode(
  mode: ModeId,
  options: { maxTravellers?: number } = {},
): { from: string; to: string; travellers: number; routeId: string } | null {
  const maxTravellers = options.maxTravellers ?? 6;
  for (const route of ROUTES) {
    if (route.compare_only) continue;
    for (let travellers = 1; travellers <= maxTravellers; travellers += 1) {
      const result = compareRoute(route, travellers, false);
      if (result.best === mode) {
        return {
          from: route.from.slug,
          to: route.to.slug,
          travellers,
          routeId: route.id,
        };
      }
    }
  }
  return null;
}

export function allTripcostPages(): PageRecord[] {
  return ROUTES.flatMap((route) => {
    const comparison = compareRoute(route, 4);
    const quality = evaluatePageQuality({
      site: "tripcost",
      family: "route-car-vs-train",
      unique_fields: 12,
      required_fields_present: 9,
      required_fields_total: 9,
      search_demand: { seed_research: route.demand },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: route.demand < 40,
      llm_filler: false,
      confidence: "MEDIUM",
      freshness_days: 20,
      freshness_ttl_days: 30,
      provenance_valid: true,
      hub_necessity: true,
      distinct_reason: `${route.id}-compare`,
      stale_presented_as_current: false,
      verified_fact_count: 8,
      decision_relation_count: comparison.modes.length + 4,
      site_rules: () => ({
        delta: comparison.modes.length >= 2 ? 0 : -40,
        reasons: ["Multiple modes or meaningful driving cost required."],
        blockers: comparison.modes.length < 2 ? ["Single mode only"] : [],
      }),
    });
    if (route.compare_only) {
      return [
        {
          id: route.id,
          site: "tripcost" as const,
          family: "route-car-vs-train" as const,
          url: `/tripcost/${route.from.slug}/to/${route.to.slug}`,
          canonical: `/tripcost/${route.from.slug}/to/${route.to.slug}`,
          title: `${route.from.name} to ${route.to.name}: modelled car vs train`,
          meta_description: `${route.from.name} → ${route.to.name}. Modelled typical costs — not live fares.`,
          entity_ids: [route.id, `${route.id}:distance`, `${route.id}:break-even`, `${route.id}:mode:car`, `${route.id}:mode:train`],
          structured_payload: {
            route: route.id,
            from: route.from.slug,
            to: route.to.slug,
            km: route.km,
            tolls: route.tolls_eur,
            modes: comparison.modes.map((m) => m.mode),
            distinct_reason: `${route.id}-compare`,
            assumptions: comparison.modes[0]?.assumptions ?? [],
            toll_state: route.tolls_eur > 0 ? "HAS_TOLL_SNAPSHOT" : "EXPLICIT_NO_TOLL",
            live_fare: false,
            price_kind: "HEURISTIC_PRICE",
            fare_provider: "MISSING",
            cost_evidence: "HEURISTIC",
            cost_class: "MODELLED",
            modelled: true,
            assumptions_declared: true,
            break_even: breakEvenByTravellers(route),
            action_evidence: {
              actionType: "COMPARE",
              inputFields: ["route", "from", "to"],
              outputFields: ["modes"],
              rendered: true,
              executable: true,
              decisionFields: ["modes", "break_even"],
            },
          },
          quality_score: quality.score,
          search_demand: searchDemandScore({ seed_research: route.demand }),
          index_state: quality.index_state,
          noindex: quality.index_state !== "INDEXABLE",
          similarity_hash: route.id,
          freshness: "2026-09-01T00:00:00.000Z",
          review_required: false,
          batch: "tripcost-scale-1",
          publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
        },
      ];
    }
    const driving = evaluatePageQuality({
      site: "tripcost",
      family: "route-driving",
      unique_fields: 8,
      required_fields_present: 8,
      required_fields_total: 8,
      search_demand: { seed_research: route.demand - 5 },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: false,
      llm_filler: false,
      confidence: "MEDIUM",
      freshness_days: 20,
      freshness_ttl_days: 30,
      provenance_valid: true,
      distinct_reason: `${route.id}-driving`,
      stale_presented_as_current: false,
      verified_fact_count: 5,
      decision_relation_count: 4,
    });
    const base = `/tripcost/${route.from.slug}/to/${route.to.slug}`;
    return [
      {
        id: route.id,
        site: "tripcost" as const,
        family: "route-car-vs-train" as const,
        url: base,
        canonical: base,
        title: `${route.from.name} to ${route.to.name}: car vs train${route.flight_eur_pp > 0 ? " vs flight" : ""}`,
        meta_description: `${route.from.name} → ${route.to.name}, 4 travellers. Driving cash cost and door-to-door times from structured assumptions.`,
        entity_ids: [
          route.id,
          `${route.id}:distance`,
          `${route.id}:break-even`,
          `${route.id}:mode:car`,
          `${route.id}:mode:train`,
        ].filter(Boolean),
        structured_payload: {
          route: route.id,
          from: route.from.slug,
          to: route.to.slug,
          km: route.km,
          tolls: route.tolls_eur,
          modes: comparison.modes.map((m) => m.mode),
          distinct_reason: `${route.id}-compare`,
          assumptions: comparison.modes[0]?.assumptions ?? [],
          toll_state: route.tolls_eur > 0 ? "HAS_TOLL_SNAPSHOT" : "EXPLICIT_NO_TOLL",
          live_fare: false,
          price_kind: "HEURISTIC_PRICE",
          fare_provider: "MISSING",
          cost_evidence: "HEURISTIC",
          cost_class: "MODELLED",
          modelled: true,
          assumptions_declared: true,
          break_even: breakEvenByTravellers(route),
          action_evidence: {
            actionType: "COMPARE",
            inputFields: ["route", "from", "to"],
            outputFields: ["modes"],
            rendered: true,
            executable: true,
            decisionFields: ["modes", "break_even"],
          },
        },
        quality_score: quality.score,
        search_demand: searchDemandScore({ seed_research: route.demand }),
        index_state: quality.index_state,
        noindex: quality.index_state !== "INDEXABLE",
        similarity_hash: route.id,
        freshness: "2026-09-01T00:00:00.000Z",
        review_required: false,
        batch: "tripcost-batch-1",
        publish_state: quality.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
      },
      {
        id: `${route.id}:driving`,
        site: "tripcost" as const,
        family: "route-driving" as const,
        url: `${base}/driving-cost`,
        canonical: `${base}/driving-cost`,
        title: `${route.from.name} to ${route.to.name} driving cost: fuel + tolls`,
        meta_description: `${route.km} km, tolls ${route.tolls_eur} €, fuel snapshot ${route.fuel_eur_per_l.toFixed(2)} €/L.`,
        entity_ids: [route.id, `${route.id}:distance`, `${route.id}:consumption`, `${route.id}:cost:fuel`],
        structured_payload: {
          route: route.id,
          km: route.km,
          tolls: route.tolls_eur,
          fuel: route.fuel_eur_per_l,
          distinct_reason: `${route.id}-driving`,
          observed_at: "2026-09-01T00:00:00.000Z",
          expires_at: "2026-10-01T00:00:00.000Z",
          live_fare: false,
          modes: ["car"],
          price_kind: "HEURISTIC_PRICE",
          cost_evidence: "HEURISTIC",
          fare_provider: "MISSING",
          cost_class: "MODELLED",
          modelled: true,
          assumptions_declared: true,
        },
        quality_score: driving.score,
        search_demand: route.demand - 5,
        index_state: driving.index_state,
        noindex: driving.index_state !== "INDEXABLE",
        similarity_hash: `${route.id}-drive`,
        freshness: "2026-09-01T00:00:00.000Z",
        review_required: false,
        batch: "tripcost-batch-1",
        publish_state: driving.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
      },
    ];
  });
}

export const PRICE_PROVENANCE = provenance({
  source_id: "seed-transport-snapshot",
  source_type: "PRIMARY_DATABASE",
  source_name: "Compiled typical fares and fuel snapshot",
  retrieved_at: "2026-09-01T00:00:00.000Z",
  valid_until: "2026-10-01T00:00:00.000Z",
  confidence: 60,
  raw_value: "typical fares and fuel snapshot",
  normalized_value: "EUR",
  verification_method: "HEURISTIC",
  locator: {
    dataset: "penta-tripcost-modelled-costs",
    document_title: "Modelled typical corridor costs",
    section: "fuel-toll-train-parking",
  },
  notes: "MODELLED / TYPICAL. Not live. Assumptions must stay visible. Live fares are not connected.",
});

export const DISTANCE_PROVENANCE = provenance({
  source_id: "seed-km",
  source_type: "PRIMARY_DATABASE",
  source_name: "Fixed corridor kilometre table",
  retrieved_at: "2026-09-01T00:00:00.000Z",
  valid_until: null,
  confidence: 78,
  raw_value: "intercity km + typical consumption",
  normalized_value: "km",
  verification_method: "CROSS_SOURCE",
  locator: {
    dataset: "penta-tripcost-corridor-km",
    document_title: "Corridor kilometre table",
    section: "road-distance",
  },
  notes: "EVERGREEN route topology or haversine×road-factor model. Not a live fare.",
});

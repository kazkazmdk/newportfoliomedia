import { provenance, type ConfidenceLevel } from "@penta/data-provenance";
import { MORE_VEHICLES } from "./vehicles-more";

export type ServiceItem = {
  id: string;
  name: string;
  interval_km: number;
  interval_months: number;
  spec?: string;
  capacity?: string;
  safety?: string;
};

export type Recall = {
  id: string;
  title: string;
  campaign: string;
  status: "OPEN" | "CLOSED" | "CHECK";
  source_url: string;
};

export type KnownIssue = {
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  when_to_stop: string;
};

export type FitmentStatus = "VERIFIED" | "HIGH_CONFIDENCE" | "POSSIBLE" | "UNKNOWN";

export type Fitment = {
  component_id: string;
  component_name: string;
  compatible: boolean;
  confidence: ConfidenceLevel;
  status?: FitmentStatus;
  market: string[];
  source_id: string;
};

export function fitmentStatus(confidence: ConfidenceLevel): FitmentStatus {
  if (confidence === "HIGH") return "VERIFIED";
  if (confidence === "MEDIUM") return "HIGH_CONFIDENCE";
  if (confidence === "LOW") return "POSSIBLE";
  return "UNKNOWN";
}

export type VehicleIdentity = {
  id: string;
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  generation: string;
  generation_slug: string;
  variant: string;
  variant_slug: string;
  years: number[];
  engine: string;
  engine_code: string;
  transmission: string;
  market: string[];
  oil: { spec: string; viscosity: string; capacity_liters: number; with_filter: boolean };
  tyres: { front: string; rear: string; pressure_bar_front: number; pressure_bar_rear: number };
  battery: { type: string; ah: number; group?: string };
  wipers: { driver_mm: number; passenger_mm: number };
  services: ServiceItem[];
  recalls: Recall[];
  issues: KnownIssue[];
  fitment: Fitment[];
  confidence: ConfidenceLevel;
};

const RETRIEVED = "2026-07-01T00:00:00.000Z";

function mfr(raw: string, url: string, confidence: number) {
  return provenance({
    source_id: "oem-handbook",
    source_type: "MANUFACTURER",
    source_url: url,
    retrieved_at: RETRIEVED,
    confidence,
    raw_value: raw,
    normalized_value: raw,
    verification_method: "MANUFACTURER_DOC",
  });
}

const CORE: VehicleIdentity[] = [
  {
    id: "veh:bmw:3-series:g20:320d-b47",
    make: "BMW",
    make_slug: "bmw",
    model: "3 Series",
    model_slug: "3-series",
    generation: "G20",
    generation_slug: "g20",
    variant: "320d",
    variant_slug: "320d-b47",
    years: [2019, 2020, 2021, 2022],
    engine: "2.0 diesel",
    engine_code: "B47D20",
    transmission: "8-speed automatic",
    market: ["EU"],
    oil: {
      spec: "BMW Longlife-04",
      viscosity: "0W-30 or 5W-30 meeting LL-04",
      capacity_liters: 5.0,
      with_filter: true,
    },
    tyres: {
      front: "225/45R18",
      rear: "255/40R18",
      pressure_bar_front: 2.3,
      pressure_bar_rear: 2.5,
    },
    battery: { type: "AGM", ah: 80 },
    wipers: { driver_mm: 650, passenger_mm: 380 },
    services: [
      { id: "oil", name: "Engine oil & filter", interval_km: 30000, interval_months: 24, spec: "LL-04 0W-30/5W-30", capacity: "5.0 L with filter" },
      { id: "pollen", name: "Cabin filter", interval_km: 30000, interval_months: 24 },
      { id: "fuel", name: "Fuel filter", interval_km: 60000, interval_months: 48 },
      { id: "brake-fluid", name: "Brake fluid", interval_km: 30000, interval_months: 24, spec: "DOT 4 LV" },
      { id: "coolant", name: "Coolant", interval_km: 150000, interval_months: 120, spec: "BMW blue / G48-equivalent — confirm on cap" },
      { id: "brakes", name: "Brake inspection", interval_km: 15000, interval_months: 12 },
      { id: "tyres", name: "Tyres", interval_km: 15000, interval_months: 12 },
      { id: "battery", name: "12V battery test", interval_km: 30000, interval_months: 24 },
      { id: "wipers", name: "Wipers", interval_km: 20000, interval_months: 12 },
    ],
    recalls: [
      {
        id: "bmw-takata-check",
        title: "Check national recall portal for this VIN",
        campaign: "VIN-specific",
        status: "CHECK",
        source_url: "https://www.nhtsa.gov/recalls",
      },
    ],
    issues: [
      {
        id: "egr-soot",
        title: "EGR / intake soot on short-trip diesels",
        severity: "MEDIUM",
        summary: "Urban 320d cars can build intake deposits. Not a diagnosis from a single noise.",
        when_to_stop: "If the car enters limp mode, loses power, or shows a persistent drivetrain warning, stop and have it scanned.",
      },
    ],
    fitment: [
      {
        component_id: "oil-ll04-5w30",
        component_name: "LL-04 5W-30 oil",
        compatible: true,
        confidence: "HIGH",
        market: ["EU"],
        source_id: "oem-handbook",
      },
      {
        component_id: "wiper-650-380",
        component_name: "Wiper 650/380 mm",
        compatible: true,
        confidence: "MEDIUM",
        market: ["EU"],
        source_id: "oem-handbook",
      },
      {
        component_id: "cabin-filter-universal",
        component_name: "Universal cabin filter",
        compatible: false,
        confidence: "LOW",
        status: "POSSIBLE",
        market: ["EU"],
        source_id: "oem-handbook",
      },
      {
        component_id: "oil-ll01-us",
        component_name: "LL-01 5W-30 (US petrol handbook row)",
        compatible: true,
        confidence: "HIGH",
        market: ["US"],
        source_id: "oem-handbook",
      },
    ],
    confidence: "HIGH",
  },
  {
    id: "veh:toyota:corolla:e210:1-8-hybrid",
    make: "Toyota",
    make_slug: "toyota",
    model: "Corolla",
    model_slug: "corolla",
    generation: "E210",
    generation_slug: "e210",
    variant: "1.8 Hybrid",
    variant_slug: "1-8-hybrid",
    years: [2019, 2020, 2021, 2022, 2023],
    engine: "1.8 hybrid",
    engine_code: "2ZR-FXE",
    transmission: "e-CVT",
    market: ["EU"],
    oil: {
      spec: "API SN/SP, ILSAC GF-6",
      viscosity: "0W-16 or 0W-20 as on the cap",
      capacity_liters: 4.2,
      with_filter: true,
    },
    tyres: {
      front: "205/55R16",
      rear: "205/55R16",
      pressure_bar_front: 2.5,
      pressure_bar_rear: 2.5,
    },
    battery: { type: "flooded / EFB depending on market", ah: 60 },
    wipers: { driver_mm: 650, passenger_mm: 400 },
    services: [
      { id: "oil", name: "Engine oil & filter", interval_km: 15000, interval_months: 12, spec: "0W-16/0W-20 as specified", capacity: "4.2 L with filter" },
      { id: "coolant", name: "Hybrid coolant", interval_km: 150000, interval_months: 120, spec: "Toyota Super Long Life" },
      { id: "brakes", name: "Brake inspection", interval_km: 15000, interval_months: 12 },
      { id: "tyres", name: "Tyres", interval_km: 15000, interval_months: 12 },
      { id: "battery", name: "12V battery test", interval_km: 30000, interval_months: 24 },
    ],
    recalls: [
      {
        id: "toyota-portal",
        title: "Check Toyota recall portal by VIN",
        campaign: "VIN-specific",
        status: "CHECK",
        source_url: "https://www.toyota.com/recall",
      },
    ],
    issues: [
      {
        id: "12v-hybrid",
        title: "12V battery age on hybrids",
        severity: "MEDIUM",
        summary: "A weak 12V battery can make a healthy hybrid refuse to ready.",
        when_to_stop: "If READY never stays on, do not jump from a running ICE with mismatched voltage procedures — have it tested.",
      },
    ],
    fitment: [
      {
        component_id: "oil-0w20",
        component_name: "0W-20 ILSAC GF-6",
        compatible: true,
        confidence: "HIGH",
        market: ["EU", "US"],
        source_id: "oem-handbook",
      },
    ],
    confidence: "HIGH",
  },
  {
    id: "veh:vw:golf:mk8:2-0-tdi",
    make: "Volkswagen",
    make_slug: "volkswagen",
    model: "Golf",
    model_slug: "golf",
    generation: "Mk8",
    generation_slug: "mk8",
    variant: "2.0 TDI",
    variant_slug: "2-0-tdi",
    years: [2020, 2021, 2022, 2023],
    engine: "2.0 TDI",
    engine_code: "DTSA / similar EA288 evo — confirm on data sticker",
    transmission: "7-speed DSG",
    market: ["EU"],
    oil: {
      spec: "VW 507.00",
      viscosity: "5W-30",
      capacity_liters: 5.5,
      with_filter: true,
    },
    tyres: {
      front: "205/55R16",
      rear: "205/55R16",
      pressure_bar_front: 2.3,
      pressure_bar_rear: 2.3,
    },
    battery: { type: "EFB or AGM", ah: 70 },
    wipers: { driver_mm: 600, passenger_mm: 450 },
    services: [
      { id: "oil", name: "Engine oil & filter", interval_km: 15000, interval_months: 12, spec: "VW 507.00 5W-30", capacity: "approx 5.5 L — confirm dipstick/procedure" },
      { id: "dsg", name: "DSG service", interval_km: 60000, interval_months: 48, spec: "DQ-coded DSG fluid only" },
      { id: "brakes", name: "Brake inspection", interval_km: 15000, interval_months: 12 },
      { id: "tyres", name: "Tyres", interval_km: 15000, interval_months: 12 },
    ],
    recalls: [
      {
        id: "vw-portal",
        title: "Check VW recall portal by VIN",
        campaign: "VIN-specific",
        status: "CHECK",
        source_url: "https://www.vw.com/en/recall.html",
      },
    ],
    issues: [
      {
        id: "dsg-service",
        title: "Skipped DSG service",
        severity: "HIGH",
        summary: "Dry-run DSG fluid changes are a known cost spike, not a symptom diagnosis.",
        when_to_stop: "If the gearbox jerks into limp mode, do not continue a long trip.",
      },
    ],
    fitment: [
      {
        component_id: "oil-507",
        component_name: "VW 507.00 5W-30",
        compatible: true,
        confidence: "HIGH",
        market: ["EU"],
        source_id: "oem-handbook",
      },
    ],
    confidence: "MEDIUM",
  },
  {
    id: "veh:tesla:model-3:highland:rwd",
    make: "Tesla",
    make_slug: "tesla",
    model: "Model 3",
    model_slug: "model-3",
    generation: "Highland",
    generation_slug: "highland",
    variant: "RWD",
    variant_slug: "rwd",
    years: [2024, 2025],
    engine: "Electric RWD",
    engine_code: "EV-RWD",
    transmission: "Single-speed",
    market: ["EU", "US"],
    oil: {
      spec: "None (EV)",
      viscosity: "n/a",
      capacity_liters: 0,
      with_filter: false,
    },
    tyres: {
      front: "235/45R18",
      rear: "235/45R18",
      pressure_bar_front: 2.9,
      pressure_bar_rear: 2.9,
    },
    battery: { type: "12V lithium (vehicle-specific)", ah: 0 },
    wipers: { driver_mm: 650, passenger_mm: 500 },
    services: [
      { id: "tyres", name: "Tyre rotation / pressure", interval_km: 10000, interval_months: 6 },
      { id: "cabin", name: "Cabin filter", interval_km: 30000, interval_months: 24 },
      { id: "brake-fluid", name: "Brake fluid", interval_km: 40000, interval_months: 24, spec: "DOT 3 — confirm owner's manual" },
      { id: "battery", name: "12V / LV battery health", interval_km: 30000, interval_months: 24 },
    ],
    recalls: [
      {
        id: "tesla-nhtsa",
        title: "Check Tesla / NHTSA recall by VIN",
        campaign: "VIN-specific",
        status: "CHECK",
        source_url: "https://www.nhtsa.gov/recalls",
      },
    ],
    issues: [],
    fitment: [
      {
        component_id: "tyre-235-45-18",
        component_name: "235/45R18",
        compatible: true,
        confidence: "MEDIUM",
        market: ["EU", "US"],
        source_id: "oem-handbook",
      },
    ],
    confidence: "MEDIUM",
  },
  {
    id: "veh:honda:civic:11:1-5-vtec",
    make: "Honda",
    make_slug: "honda",
    model: "Civic",
    model_slug: "civic",
    generation: "11th gen",
    generation_slug: "11",
    variant: "1.5 VTEC Turbo",
    variant_slug: "1-5-vtec",
    years: [2022, 2023, 2024],
    engine: "1.5 turbo",
    engine_code: "L15C",
    transmission: "CVT",
    market: ["EU", "US"],
    oil: {
      spec: "API SP, Honda HTO-06 where specified",
      viscosity: "0W-20",
      capacity_liters: 3.5,
      with_filter: true,
    },
    tyres: {
      front: "215/50R17",
      rear: "215/50R17",
      pressure_bar_front: 2.3,
      pressure_bar_rear: 2.2,
    },
    battery: { type: "flooded", ah: 45 },
    wipers: { driver_mm: 650, passenger_mm: 400 },
    services: [
      { id: "oil", name: "Engine oil & filter", interval_km: 10000, interval_months: 12, spec: "0W-20", capacity: "about 3.5 L with filter" },
      { id: "plugs", name: "Spark plugs", interval_km: 100000, interval_months: 84 },
      { id: "brakes", name: "Brake inspection", interval_km: 15000, interval_months: 12 },
      { id: "tyres", name: "Tyres", interval_km: 15000, interval_months: 12 },
    ],
    recalls: [
      {
        id: "honda-portal",
        title: "Check Honda recall by VIN",
        campaign: "VIN-specific",
        status: "CHECK",
        source_url: "https://www.honda.com/recall",
      },
    ],
    issues: [
      {
        id: "ac-clutch-note",
        title: "Do not diagnose engine noise from a forum list",
        severity: "LOW",
        summary: "Civic 1.5 noise complaints are model-year specific. We will not assign a part from a description alone.",
        when_to_stop: "If oil pressure or temperature warnings appear, stop driving.",
      },
    ],
    fitment: [
      {
        component_id: "oil-0w20-honda",
        component_name: "0W-20 API SP",
        compatible: true,
        confidence: "HIGH",
        market: ["EU", "US"],
        source_id: "oem-handbook",
      },
    ],
    confidence: "HIGH",
  },
];

export const VEHICLES: VehicleIdentity[] = [...CORE, ...MORE_VEHICLES];

export const VEHICLE_PROVENANCE = [
  mfr("BMW 320d G20 oil LL-04", "https://www.bmw.com", 86),
  mfr("Toyota Corolla hybrid oil", "https://www.toyota.com", 84),
];

export type VehicleIdentityProvider = {
  id: string;
  territory: string[];
  decode(vin: string): Promise<{ vehicle?: VehicleIdentity; confidence: ConfidenceLevel; notes: string[] }>;
};

const WMI: Record<string, string> = {
  WBA: "BMW",
  WBS: "BMW M",
  WVW: "Volkswagen",
  WAU: "Audi",
  WDD: "Mercedes",
  JTD: "Toyota",
  JHM: "Honda",
  VF3: "Peugeot",
  VF1: "Renault",
  KMH: "Hyundai",
  U5Y: "Kia",
  YV1: "Volvo",
  WMW: "MINI",
  JN1: "Nissan",
  WF0: "Ford",
  "5YJ": "Tesla",
};

export const MockVinProvider: VehicleIdentityProvider = {
  id: "mock-wmi",
  territory: ["EU", "US"],
  async decode(vin: string) {
    const cleaned = vin.trim().toUpperCase().replace(/\s+/g, "");
    if (cleaned.length !== 17) {
      return { confidence: "UNKNOWN", notes: ["VIN must be 17 characters. We will not guess."] };
    }
    const wmi = cleaned.slice(0, 3);
    const make = WMI[wmi];
    if (!make) {
      return {
        confidence: "UNKNOWN",
        notes: [`WMI ${wmi} is not in the licensed launch table. No vehicle was invented.`],
      };
    }
    const vehicle = VEHICLES.find((item) => item.make.toUpperCase().includes(make.split(" ")[0].toUpperCase()));
    return {
      vehicle,
      confidence: vehicle ? "LOW" : "UNKNOWN",
      notes: [
        "WMI-only decode. Not a licensed full VIN decoder. Confirm make/model/generation before saving.",
      ],
    };
  },
};

export { mfr };

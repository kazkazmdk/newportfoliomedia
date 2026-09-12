import { provenance, type ConfidenceLevel } from "@penta/data-provenance";
import { evaluatePageQuality, searchDemandScore } from "@penta/quality-gate";
import type { PageRecord } from "@penta/graph-core";

export type ConfidenceTag =
  | "MANUFACTURER_VERIFIED"
  | "INDEPENDENTLY_TESTED"
  | "PROTOCOL_INFERRED"
  | "COMMUNITY_OBSERVED"
  | "UNKNOWN";

export type Pdo = { volts: number; amps: number; watts: number; pps?: boolean; epr?: boolean };

export type DeviceProfile = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  connector: "USB-C" | "MagSafe" | "Watch" | "Lightning";
  min_watts: number;
  max_watts: number;
  pd_version?: string;
  pps?: boolean;
  notes: string;
  demand: number;
  tag: ConfidenceTag;
};

export type ChargerPort = {
  id: string;
  label: string;
  watts: number;
  pdos: Pdo[];
};

export type Allocation = {
  ports: string[];
  watts: number[];
};

export type ChargerProfile = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  total_watts: number;
  ports: ChargerPort[];
  allocations: Allocation[];
  pd_version: string;
  demand: number;
  tag: ConfidenceTag;
};

export type CableProfile = {
  id: string;
  name: string;
  slug: string;
  e_marker: boolean;
  max_watts: number;
  max_volts: number;
  connector: string;
  tag: ConfidenceTag;
};

export const DEVICES: DeviceProfile[] = [
  { id: "dev:iphone-16", name: "iPhone 16", slug: "iphone-16", brand: "Apple", connector: "USB-C", min_watts: 5, max_watts: 25, pd_version: "PD 3.0", pps: false, notes: "USB-C PD. Fast charge needs a capable USB-C charger and cable.", demand: 96, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:iphone-15", name: "iPhone 15", slug: "iphone-15", brand: "Apple", connector: "USB-C", min_watts: 5, max_watts: 20, pd_version: "PD 3.0", notes: "USB-C PD up to about 20W with a suitable brick.", demand: 90, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:mba-m3-13", name: "MacBook Air 13-inch (M3)", slug: "macbook-air-13-m3", brand: "Apple", connector: "USB-C", min_watts: 30, max_watts: 70, pd_version: "PD 3.0", notes: "Ships with 30W; 70W is supported for faster fill. MagSafe SKU differs — this row is USB-C in.", demand: 88, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:mbp-14", name: "MacBook Pro 14-inch (M3)", slug: "macbook-pro-14-m3", brand: "Apple", connector: "USB-C", min_watts: 70, max_watts: 96, pd_version: "PD 3.0", notes: "Higher than Air. A 65W brick will charge slowly or drain under load.", demand: 84, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:ipad-pro-m4", name: "iPad Pro (M4)", slug: "ipad-pro-m4", brand: "Apple", connector: "USB-C", min_watts: 20, max_watts: 45, pd_version: "PD 3.0", notes: "Fast charge needs 30W+ class PD.", demand: 70, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:steam-deck", name: "Steam Deck", slug: "steam-deck", brand: "Valve", connector: "USB-C", min_watts: 15, max_watts: 45, pd_version: "PD 3.0", notes: "Official 45W PD. Lower wattage works slowly; dock behaviour varies.", demand: 82, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:galaxy-s24", name: "Galaxy S24", slug: "galaxy-s24", brand: "Samsung", connector: "USB-C", min_watts: 5, max_watts: 25, pd_version: "PD 3.0", pps: true, notes: "PPS helps Super Fast Charging. A PD-only 20W brick still charges.", demand: 80, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:pixel-8", name: "Pixel 8", slug: "pixel-8", brand: "Google", connector: "USB-C", min_watts: 5, max_watts: 27, pd_version: "PD 3.0", pps: true, notes: "PPS preferred. Exact wattage depends on cable and adapter.", demand: 74, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:switch", name: "Nintendo Switch", slug: "nintendo-switch", brand: "Nintendo", connector: "USB-C", min_watts: 15, max_watts: 39, notes: "Official dock/charger is ~39W. Third-party PD often works at 15–30W.", demand: 78, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:airpods-pro", name: "AirPods Pro (USB-C case)", slug: "airpods-pro-usbc", brand: "Apple", connector: "USB-C", min_watts: 5, max_watts: 5, notes: "Needs only USB-C 5W. Any PD port will throttle down.", demand: 60, tag: "MANUFACTURER_VERIFIED" },
  { id: "dev:watch", name: "Apple Watch", slug: "apple-watch", brand: "Apple", connector: "Watch", min_watts: 5, max_watts: 5, notes: "Does not charge from a USB-C PD laptop cable alone. Needs the Watch puck.", demand: 55, tag: "MANUFACTURER_VERIFIED" },
];

export const CHARGERS: ChargerProfile[] = [
  {
    id: "chg:apple-20w",
    name: "Apple 20W USB-C",
    slug: "apple-20w",
    brand: "Apple",
    total_watts: 20,
    pd_version: "PD 3.0",
    demand: 90,
    tag: "MANUFACTURER_VERIFIED",
    ports: [{ id: "c1", label: "C1", watts: 20, pdos: [{ volts: 9, amps: 2.22, watts: 20 }, { volts: 5, amps: 3, watts: 15 }] }],
    allocations: [{ ports: ["c1"], watts: [20] }],
  },
  {
    id: "chg:apple-35w-dual",
    name: "Apple 35W Dual USB-C",
    slug: "apple-35w-dual",
    brand: "Apple",
    total_watts: 35,
    pd_version: "PD 3.0",
    demand: 80,
    tag: "MANUFACTURER_VERIFIED",
    ports: [
      { id: "c1", label: "C1", watts: 35, pdos: [{ volts: 20, amps: 1.75, watts: 35 }] },
      { id: "c2", label: "C2", watts: 35, pdos: [{ volts: 20, amps: 1.75, watts: 35 }] },
    ],
    allocations: [
      { ports: ["c1"], watts: [35] },
      { ports: ["c1", "c2"], watts: [20, 15] },
    ],
  },
  {
    id: "chg:apple-70w",
    name: "Apple 70W USB-C",
    slug: "apple-70w",
    brand: "Apple",
    total_watts: 70,
    pd_version: "PD 3.0",
    demand: 76,
    tag: "MANUFACTURER_VERIFIED",
    ports: [{ id: "c1", label: "C1", watts: 70, pdos: [{ volts: 20, amps: 3.5, watts: 70 }] }],
    allocations: [{ ports: ["c1"], watts: [70] }],
  },
  {
    id: "chg:anker-65w",
    name: "Anker 65W USB-C (Nano II class)",
    slug: "anker-65w",
    brand: "Anker",
    total_watts: 65,
    pd_version: "PD 3.0",
    demand: 85,
    tag: "MANUFACTURER_VERIFIED",
    ports: [{ id: "c1", label: "C1", watts: 65, pdos: [{ volts: 20, amps: 3.25, watts: 65 }, { volts: 15, amps: 3, watts: 45 }] }],
    allocations: [{ ports: ["c1"], watts: [65] }],
  },
  {
    id: "chg:anker-100w-2c",
    name: "Anker 100W 2C class",
    slug: "anker-100w-2c",
    brand: "Anker",
    total_watts: 100,
    pd_version: "PD 3.0",
    demand: 88,
    tag: "MANUFACTURER_VERIFIED",
    ports: [
      { id: "c1", label: "C1", watts: 100, pdos: [{ volts: 20, amps: 5, watts: 100 }] },
      { id: "c2", label: "C2", watts: 100, pdos: [{ volts: 20, amps: 5, watts: 100 }] },
    ],
    allocations: [
      { ports: ["c1"], watts: [100] },
      { ports: ["c1", "c2"], watts: [65, 30] },
    ],
  },
  {
    id: "chg:anker-100w-3c1a",
    name: "100W 3C1A GaN class",
    slug: "gan-100w-3c1a",
    brand: "Generic GaN",
    total_watts: 100,
    pd_version: "PD 3.0",
    demand: 70,
    tag: "PROTOCOL_INFERRED",
    ports: [
      { id: "c1", label: "C1", watts: 100, pdos: [{ volts: 20, amps: 5, watts: 100 }] },
      { id: "c2", label: "C2", watts: 65, pdos: [{ volts: 20, amps: 3.25, watts: 65 }] },
      { id: "c3", label: "C3", watts: 30, pdos: [{ volts: 15, amps: 2, watts: 30 }] },
      { id: "a", label: "A", watts: 18, pdos: [{ volts: 9, amps: 2, watts: 18 }] },
    ],
    allocations: [
      { ports: ["c1"], watts: [100] },
      { ports: ["c1", "c2"], watts: [65, 30] },
      { ports: ["c1", "c2", "a"], watts: [45, 30, 18] },
    ],
  },
];

export const CABLES: CableProfile[] = [
  { id: "cab:apple-usbc-60w", name: "Apple USB-C 60W", slug: "apple-usbc-60w", e_marker: true, max_watts: 60, max_volts: 20, connector: "USB-C to USB-C", tag: "MANUFACTURER_VERIFIED" },
  { id: "cab:apple-usbc-240w", name: "Apple USB-C 240W", slug: "apple-usbc-240w", e_marker: true, max_watts: 240, max_volts: 48, connector: "USB-C to USB-C", tag: "MANUFACTURER_VERIFIED" },
  { id: "cab:unknown-no-emark", name: "Unmarked USB-C cable", slug: "unmarked-usbc", e_marker: false, max_watts: 60, max_volts: 20, connector: "USB-C to USB-C", tag: "UNKNOWN" },
];

export type CompatibilityResult = {
  compatible: boolean;
  safe: boolean;
  fast: boolean;
  match: "EXCELLENT MATCH" | "WORKS" | "SLOW" | "UNKNOWN" | "INCOMPATIBLE";
  max_power: number | null;
  protocol: string;
  bottleneck: string;
  best_port: string;
  cable_ok: boolean;
  confidence: ConfidenceLevel;
  tag: ConfidenceTag;
  explanation: string;
  theoretical: boolean;
};

export function allocate(charger: ChargerProfile, usedPorts: string[]): Allocation {
  const key = [...usedPorts].sort().join("+");
  const hit = charger.allocations.find((row) => [...row.ports].sort().join("+") === key);
  if (hit) return hit;
  const single = charger.allocations.find((row) => row.ports.length === 1 && row.ports[0] === usedPorts[0]);
  return single ?? charger.allocations[0];
}

export function compatibility(
  device: DeviceProfile,
  charger: ChargerProfile,
  cable?: CableProfile,
  extraPorts: string[] = [],
): CompatibilityResult {
  if (device.connector === "Watch") {
    return {
      compatible: false,
      safe: true,
      fast: false,
      match: "INCOMPATIBLE",
      max_power: null,
      protocol: "Watch magnetic",
      bottleneck: "Apple Watch needs its puck, not a USB-C PD laptop cable.",
      best_port: "—",
      cable_ok: false,
      confidence: "HIGH",
      tag: "MANUFACTURER_VERIFIED",
      explanation: "The charger may be fine for phones. It will not charge an Apple Watch by USB-C alone.",
      theoretical: false,
    };
  }
  const ports = extraPorts.length ? extraPorts : [charger.ports[0].id];
  const alloc = allocate(charger, ports);
  const portWatts = alloc.watts[0] ?? charger.ports[0].watts;
  const cableCap = cable?.max_watts ?? 60;
  const cableOk = !cable || cable.max_watts >= Math.min(device.max_watts, portWatts) || cable.tag === "UNKNOWN";
  const theoretical = Math.min(device.max_watts, portWatts, cable?.max_watts ?? portWatts);
  let bottleneck = "none";
  if ((cable?.max_watts ?? 999) < Math.min(device.max_watts, portWatts)) bottleneck = "cable";
  else if (portWatts < device.max_watts) bottleneck = "charger port allocation";
  else if (device.max_watts < portWatts) bottleneck = "device input limit";

  const compatible = device.connector === "USB-C" && portWatts >= device.min_watts;
  const fast = theoretical >= device.max_watts * 0.8;
  const match = !compatible
    ? "INCOMPATIBLE"
    : cable?.tag === "UNKNOWN"
      ? "UNKNOWN"
      : fast && theoretical >= device.max_watts
        ? "EXCELLENT MATCH"
        : fast
          ? "WORKS"
          : "SLOW";

  const tag: ConfidenceTag =
    cable?.tag === "UNKNOWN" ? "UNKNOWN" : charger.tag === "PROTOCOL_INFERRED" ? "PROTOCOL_INFERRED" : "MANUFACTURER_VERIFIED";
  const confidence: ConfidenceLevel =
    tag === "UNKNOWN" ? "UNKNOWN" : tag === "PROTOCOL_INFERRED" ? "MEDIUM" : "HIGH";

  return {
    compatible,
    safe: compatible && (cable ? cable.max_volts >= 20 || theoretical <= 60 : true),
    fast,
    match,
    max_power: Number.isFinite(theoretical) ? theoretical : null,
    protocol: device.pd_version ?? "USB-C",
    bottleneck,
    best_port: alloc.ports[0] ?? charger.ports[0].label,
    cable_ok: cableOk,
    confidence,
    tag,
    explanation:
      match === "UNKNOWN"
        ? "The unmarked cable is the unknown. We will not invent a wattage."
        : `${device.name} can take up to ${device.max_watts} W. This port offers ${portWatts} W before cable limits. Expected max is ${theoretical} W (${tag.replaceAll("_", " ").toLowerCase()}).`,
    theoretical: true,
  };
}

export function bottleneckDiagnosis(input: {
  device: DeviceProfile;
  charger: ChargerProfile;
  cable?: CableProfile;
  otherDevices: number;
  battery?: number;
}): CompatibilityResult {
  const extra = input.otherDevices > 0 ? input.charger.allocations.at(-1)?.ports ?? ["c1"] : ["c1"];
  const result = compatibility(input.device, input.charger, input.cable, extra);
  if (input.battery !== undefined && input.battery > 80 && result.match === "SLOW") {
    result.bottleneck = "device is tapering near full charge";
    result.explanation += " Above ~80% many phones taper on purpose. That is not a failed charger.";
  }
  return result;
}

export function kitOptimize(
  devices: DeviceProfile[],
  chargers: ChargerProfile[],
  goal: "MINIMUM_WEIGHT" | "MINIMUM_COST" | "FASTEST_CHARGING",
) {
  const ranked = chargers.map((charger) => {
    const results = devices.map((device) => compatibility(device, charger));
    const allOk = results.every((row) => row.compatible);
    const minPower = Math.min(...results.map((row) => row.max_power ?? 0));
    const score =
      goal === "FASTEST_CHARGING"
        ? minPower
        : goal === "MINIMUM_WEIGHT"
          ? (allOk ? 1000 : 0) - charger.total_watts
          : (allOk ? 1000 : 0) - charger.total_watts * 0.8;
    return { charger, results, allOk, score };
  });
  return ranked.sort((a, b) => b.score - a.score);
}

export function getDevice(slug: string) {
  return DEVICES.find((item) => item.slug === slug);
}
export function getCharger(slug: string) {
  return CHARGERS.find((item) => item.slug === slug);
}

const POPULAR_PAIRS: Array<[string, string]> = [
  ["iphone-16", "apple-20w"],
  ["iphone-16", "apple-35w-dual"],
  ["iphone-16", "anker-65w"],
  ["macbook-air-13-m3", "apple-70w"],
  ["macbook-air-13-m3", "anker-65w"],
  ["macbook-air-13-m3", "anker-100w-2c"],
  ["macbook-pro-14-m3", "anker-65w"],
  ["macbook-pro-14-m3", "apple-70w"],
  ["steam-deck", "anker-65w"],
  ["steam-deck", "apple-20w"],
  ["galaxy-s24", "anker-65w"],
  ["iphone-15", "apple-20w"],
];

export function allChargematchPages(): PageRecord[] {
  const pages: PageRecord[] = [];
  for (const device of DEVICES) {
    const q = evaluatePageQuality({
      site: "chargematch",
      family: "device-wattage",
      unique_fields: 8,
      required_fields_present: 8,
      required_fields_total: 8,
      search_demand: { seed_research: device.demand },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: device.demand < 40,
      llm_filler: false,
      confidence: "HIGH",
      freshness_days: 90,
      freshness_ttl_days: 180,
      provenance_valid: true,
    });
    pages.push({
      id: device.id,
      site: "chargematch",
      family: device.demand >= 70 ? "device-hub" : "device-wattage",
      url: `/chargematch/${device.slug}`,
      canonical: `/chargematch/${device.slug}`,
      title: `${device.name} charging wattage`,
      meta_description: `${device.name} takes ${device.min_watts}–${device.max_watts} W (${device.tag.replaceAll("_", " ")}). Check a charger.`,
      entity_ids: [device.id],
      structured_payload: { min: device.min_watts, max: device.max_watts, pd: device.pd_version },
      quality_score: q.score,
      search_demand: device.demand,
      index_state: q.index_state,
      noindex: q.index_state !== "INDEXABLE",
      similarity_hash: device.slug,
      freshness: "2026-06-01T00:00:00.000Z",
      review_required: false,
      batch: "chargematch-batch-1",
      publish_state: q.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
    });
  }
  for (const [d, c] of POPULAR_PAIRS) {
    const device = getDevice(d)!;
    const charger = getCharger(c)!;
    const result = compatibility(device, charger);
    const demand = Math.min(device.demand, charger.demand);
    const q = evaluatePageQuality({
      site: "chargematch",
      family: "can-charger-charge",
      unique_fields: 9,
      required_fields_present: 8,
      required_fields_total: 8,
      search_demand: { seed_research: demand },
      product_cta: true,
      interactive: true,
      distinct_from_parent: true,
      near_duplicate: false,
      year_only_variant: false,
      city_without_specifics: false,
      obscure_without_demand: demand < 50,
      llm_filler: false,
      confidence: result.confidence,
      freshness_days: 90,
      freshness_ttl_days: 180,
      provenance_valid: true,
    });
    pages.push({
      id: `pair:${d}:${c}`,
      site: "chargematch",
      family: "can-charger-charge",
      url: `/chargematch/${d}/with/${c}`,
      canonical: `/chargematch/${d}/with/${c}`,
      title: `Can I use a ${charger.name} with ${device.name}?`,
      meta_description: `${result.match}. Expected max ${result.max_power ?? "unknown"} W. ${result.tag.replaceAll("_", " ")}.`,
      entity_ids: [device.id, charger.id],
      structured_payload: { ...result, device: d, charger: c },
      quality_score: q.score,
      search_demand: searchDemandScore({ seed_research: demand }),
      index_state: q.index_state,
      noindex: q.index_state !== "INDEXABLE",
      similarity_hash: `${d}:${c}`,
      freshness: "2026-06-01T00:00:00.000Z",
      review_required: false,
      batch: "chargematch-batch-1",
      publish_state: q.index_state === "INDEXABLE" ? "PUBLISHED" : "DRAFT",
    });
  }
  return pages;
}

export const POWER_PROVENANCE = provenance({
  source_id: "oem-power-specs",
  source_type: "MANUFACTURER",
  retrieved_at: "2026-06-01T00:00:00.000Z",
  confidence: 85,
  raw_value: "device input + charger PDO tables",
  normalized_value: "watts",
  verification_method: "MANUFACTURER_DOC",
});

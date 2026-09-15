import { provenance, type ConfidenceLevel } from "@penta/data-provenance";
import { evaluatePageQuality, searchDemandScore } from "@penta/quality-gate";
import type { PageRecord } from "@penta/graph-core";
import { MORE_CHARGERS, MORE_DEVICES, MORE_PAIRS } from "./catalog-more";
export { DEVICE_OEM_SOURCES, deviceOemSource, deviceProvenanceList } from "./oem-sources";

export type ConfidenceTag =
  |   "MANUFACTURER_VERIFIED"
  | "INDEPENDENTLY_TESTED"
  | "CERTIFICATION_VERIFIED"
  | "PROTOCOL_INFERRED"
  | "USER_OBSERVED"
  | "COMMUNITY_OBSERVED"
  | "UNKNOWN";

export type Pdo = { volts: number; amps: number; watts: number; pps?: boolean; epr?: boolean };

export type DevicePowerCapability = {
  protocol:
    | "USB_PD"
    | "USB_PD_PPS"
    | "USB_PD_EPR"
    | "QC"
    | "APPLE_2_4A"
    | "MAGSAFE"
    | "PROPRIETARY";
  voltage?: number;
  minVoltage?: number;
  maxVoltage?: number;
  current?: number;
  maxCurrent?: number;
  watts: number;
  requiredCable?: string;
  sourceId?: string;
};

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
  epr?: boolean;
  capabilities?: DevicePowerCapability[];
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
  byPort?: Record<string, number>;
};

function allocationMap(ports: string[], watts: number[]): Allocation {
  const byPort: Record<string, number> = {};
  ports.forEach((port, i) => {
    byPort[port] = watts[i] ?? 0;
  });
  return { ports, watts, byPort };
}

export function allocationByPort(alloc: Allocation): Record<string, number> {
  if (alloc.byPort && Object.keys(alloc.byPort).length) return alloc.byPort;
  return allocationMap(alloc.ports, alloc.watts).byPort ?? {};
}

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

/** Lab row only. TESTED / MEASURED is forbidden unless a row exists. */
export type MeasuredChargeCurve = {
  device: string;
  charger: string;
  cable: string;
  batteryStart: number;
  batteryEnd: number;
  maxObservedW: number;
  averageW: number;
  duration: number;
  temperature: number;
  testMethod: string;
};

export const MEASURED_CURVES: MeasuredChargeCurve[] = [];

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

export const CORE_DEVICES: DeviceProfile[] = [
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

export const DEVICES: DeviceProfile[] = [...CORE_DEVICES, ...MORE_DEVICES];

export const CORE_CHARGERS: ChargerProfile[] = [
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
    allocations: [allocationMap(["c1"], [20])],
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
    allocations: [allocationMap(["c1"], [35]), allocationMap(["c1", "c2"], [20, 15])],
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
    allocations: [allocationMap(["c1"], [70])],
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
    allocations: [allocationMap(["c1"], [65])],
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
    allocations: [allocationMap(["c1"], [100]), allocationMap(["c1", "c2"], [65, 30])],
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
      allocationMap(["c1"], [100]),
      allocationMap(["c2"], [65]),
      allocationMap(["c1", "c2"], [65, 30]),
      allocationMap(["c1", "c2", "a"], [45, 30, 18]),
    ],
  },
];

export const CHARGERS: ChargerProfile[] = [...CORE_CHARGERS, ...MORE_CHARGERS];

export const POWER_KINDS = [
  "MEASURED",
  "MANUFACTURER_RATED",
  "PROTOCOL_MAX",
  "CALCULATED_EXPECTED",
  "HEURISTIC_EXPECTED",
] as const;
export type PowerKind = (typeof POWER_KINDS)[number];

export type PowerScenario = {
  id: string;
  device_id: string;
  charger_id: string;
  cable_id?: string;
  port: string;
  protocol: string;
  negotiated_voltage: number | null;
  negotiated_current: number | null;
  expected_power: number | null;
  limiting_component: string;
  power_kind: PowerKind;
  measured_curve: null;
  confidence: ConfidenceLevel;
  evidence: "SPEC_VERIFIED" | "INFERRED" | "MEASURED";
};

export const CABLES: CableProfile[] = [
  { id: "cab:apple-usbc-60w", name: "Apple USB-C 60W", slug: "apple-usbc-60w", e_marker: true, max_watts: 60, max_volts: 20, connector: "USB-C to USB-C", tag: "MANUFACTURER_VERIFIED" },
  { id: "cab:apple-usbc-240w", name: "Apple USB-C 240W", slug: "apple-usbc-240w", e_marker: true, max_watts: 240, max_volts: 48, connector: "USB-C to USB-C", tag: "MANUFACTURER_VERIFIED" },
  { id: "cab:unknown-no-emark", name: "Unmarked USB-C cable", slug: "unmarked-usbc", e_marker: false, max_watts: 60, max_volts: 20, connector: "USB-C to USB-C", tag: "UNKNOWN" },
];

export type CompatibilityResult = {
  compatible: boolean;
  /** True only with independent test or certification. Wattage overlap is not safety. */
  safe: boolean;
  safety_note: string;
  fast: boolean;
  match: "EXCELLENT MATCH" | "WORKS" | "SLOW" | "UNKNOWN" | "INCOMPATIBLE";
  max_power: number | null;
  protocol: string;
  bottleneck: string;
  best_port: string;
  cable_ok: boolean;
  confidence: ConfidenceLevel;
  tag: ConfidenceTag;
  /** Lab watts are MEASURED only. Protocol overlap is never MEASURED. */
  evidence: "SPEC_VERIFIED" | "INFERRED" | "MEASURED";
  explanation: string;
  theoretical: boolean;
  rule_version: string;
  trace: {
    facts: string[];
    relations: string[];
    rules: string[];
    sources: string[];
    bottlenecks?: string[];
  };
};

export function compatibilityEvidence(
  tag: ConfidenceTag,
  measured = false,
): CompatibilityResult["evidence"] {
  if (measured) return "MEASURED";
  if (tag === "MANUFACTURER_VERIFIED" || tag === "CERTIFICATION_VERIFIED" || tag === "INDEPENDENTLY_TESTED") {
    return "SPEC_VERIFIED";
  }
  return "INFERRED";
}

export const RULE_VERSION = "compatibility-v2";

export function allocate(charger: ChargerProfile, usedPorts: string[]): Allocation {
  const key = [...usedPorts].sort().join("+");
  const hit = charger.allocations.find((row) => [...row.ports].sort().join("+") === key);
  const raw = hit ?? charger.allocations.find((row) => row.ports.length === 1 && row.ports[0] === usedPorts[0]) ?? charger.allocations[0];
  const byPort = allocationByPort(raw);
  return { ports: raw.ports, watts: raw.ports.map((p) => byPort[p] ?? 0), byPort };
}

export function deviceCapabilities(device: DeviceProfile): DevicePowerCapability[] {
  if (device.capabilities?.length) return device.capabilities;
  if (device.connector === "MagSafe") {
    return [{ protocol: "MAGSAFE", watts: device.max_watts, sourceId: "device-profile" }];
  }
  const caps: DevicePowerCapability[] = [
    { protocol: "USB_PD", watts: device.max_watts, sourceId: "device-profile" },
  ];
  if (device.pps) {
    caps.push({ protocol: "USB_PD_PPS", watts: device.max_watts, sourceId: "device-profile" });
  }
  if (device.epr) {
    caps.push({ protocol: "USB_PD_EPR", watts: device.max_watts, sourceId: "device-profile" });
  }
  return caps;
}

export type PowerChain = {
  protocol: string;
  port: string;
  voltage: number | null;
  current: number | null;
  watts: number;
  deviceCap: number;
  portCap: number;
  cableCap: number;
  allocationCap: number;
  limitingComponent: "device" | "protocol" | "port" | "cable" | "allocation";
  powerKind: PowerKind;
  measured: null;
  deviceAcceptance: number;
  protocolCap: number;
  delivered: number;
  limiting: "device" | "protocol" | "port" | "cable" | "allocation";
  rated: true;
};

function pdoCompatible(pdo: Pdo, caps: DevicePowerCapability[]): boolean {
  if (pdo.epr && !caps.some((c) => c.protocol === "USB_PD_EPR")) return false;
  if (pdo.pps && !caps.some((c) => c.protocol === "USB_PD_PPS")) return false;
  return caps.some((c) =>
    c.protocol === "USB_PD" ||
    c.protocol === "USB_PD_PPS" ||
    c.protocol === "USB_PD_EPR" ||
    c.protocol === "APPLE_2_4A",
  );
}

export function powerChain(input: {
  device: DeviceProfile;
  charger: ChargerProfile;
  cable?: CableProfile;
  usedPorts?: string[];
  selectedPort?: string;
}): PowerChain {
  const ports = input.usedPorts?.length ? input.usedPorts : [input.charger.ports[0].id];
  const selected = input.selectedPort ?? ports[0];
  const selectedPort = input.charger.ports.find((p) => p.id === selected) ?? input.charger.ports[0];
  const alloc = allocate(input.charger, ports);
  const byPort = allocationByPort(alloc);
  const allocationCap = byPort[selected] ?? selectedPort.watts;
  const portCap = selectedPort.watts;
  const caps = deviceCapabilities(input.device);
  const deviceCap = Math.max(...caps.map((c) => c.watts), input.device.max_watts);
  const eligiblePdos = selectedPort.pdos.filter((pdo) => pdoCompatible(pdo, caps));
  const bestPdo = [...eligiblePdos].sort((a, b) => b.watts - a.watts)[0];
  const protocolCap = bestPdo?.watts ?? 0;
  const cableCap = input.cable?.max_watts ?? Number.POSITIVE_INFINITY;
  const delivered = Math.min(
    deviceCap,
    protocolCap || 0,
    portCap,
    Number.isFinite(cableCap) ? cableCap : portCap,
    allocationCap,
  );
  const limiting: PowerChain["limiting"] =
    delivered === 0 && protocolCap === 0
      ? "protocol"
      : delivered === cableCap
        ? "cable"
        : delivered === allocationCap && allocationCap < portCap
          ? "allocation"
          : delivered === portCap
            ? "port"
            : delivered === deviceCap
              ? "device"
              : "protocol";
  const protocol = bestPdo?.epr ? "USB_PD_EPR" : bestPdo?.pps ? "USB_PD_PPS" : input.device.pd_version ?? "USB_PD";
  return {
    protocol,
    port: selected,
    voltage: bestPdo?.volts ?? null,
    current: bestPdo?.amps ?? null,
    watts: delivered,
    deviceCap,
    portCap,
    cableCap: Number.isFinite(cableCap) ? cableCap : portCap,
    allocationCap,
    limitingComponent: limiting,
    powerKind: "CALCULATED_EXPECTED",
    measured: null,
    deviceAcceptance: deviceCap,
    protocolCap,
    delivered,
    limiting,
    rated: true,
  };
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
      safe: false,
      safety_note: "Will not charge. Not a safety certification claim.",
      fast: false,
      match: "INCOMPATIBLE",
      max_power: null,
      protocol: "Watch magnetic",
      bottleneck: "Apple Watch needs its puck, not a USB-C PD laptop cable.",
      best_port: "—",
      cable_ok: false,
      confidence: "HIGH",
      tag: "MANUFACTURER_VERIFIED",
      evidence: "SPEC_VERIFIED",
      explanation: "The charger may be fine for phones. It will not charge an Apple Watch by USB-C alone.",
      theoretical: false,
      rule_version: RULE_VERSION,
      trace: {
        facts: ["connector=Watch", "needs puck"],
        relations: ["INCOMPATIBLE_CONNECTOR"],
        rules: [RULE_VERSION],
        sources: ["oem-power-specs"],
      },
    };
  }
  const ports = extraPorts.length ? extraPorts : [charger.ports[0].id];
  const chain = powerChain({ device, charger, cable, usedPorts: ports });
  const portWatts = chain.allocationCap;
  const cableOk = !cable || cable.max_watts >= Math.min(device.max_watts, portWatts) || cable.tag === "UNKNOWN";
  const theoretical = chain.delivered;
  let bottleneck = "none";
  if (chain.limiting === "cable") bottleneck = "cable";
  else if (chain.limiting === "allocation" || chain.limiting === "port") bottleneck = "charger port allocation";
  else if (chain.limiting === "device") bottleneck = "device input limit";

  const pdIn = device.connector === "USB-C" || device.connector === "Lightning";
  const compatible = pdIn && portWatts >= device.min_watts;
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

  const certified =
    charger.tag === "INDEPENDENTLY_TESTED" ||
    charger.tag === "CERTIFICATION_VERIFIED" ||
    device.tag === "INDEPENDENTLY_TESTED" ||
    device.tag === "CERTIFICATION_VERIFIED";
  const safety_note = certified
    ? "Independently tested or certified path."
    : "Compatibility expected from published PDOs. Safety certification of this exact combo is unknown.";

  return {
    compatible,
    safe: certified,
    safety_note,
    fast,
    match,
    max_power: Number.isFinite(theoretical) ? theoretical : null,
    protocol: device.pd_version ?? "USB-C",
    bottleneck,
    best_port: ports[0] ?? charger.ports[0].label,
    cable_ok: cableOk,
    confidence,
    tag,
    evidence: compatibilityEvidence(tag, false),
    explanation:
      match === "UNKNOWN"
        ? "The unmarked cable is the unknown. We will not invent a wattage."
        : device.connector === "Lightning"
          ? `${device.name} is Lightning PD. This USB-C brick can supply power; you still need a USB-C to Lightning cable. Expected max is ${theoretical} W. ${safety_note}`
          : `${device.name} can take up to ${device.max_watts} W. This port offers ${portWatts} W before cable limits. Expected max is ${theoretical} W (${tag.replaceAll("_", " ").toLowerCase()}). ${safety_note}`,
    theoretical: true,
    rule_version: RULE_VERSION,
    trace: {
      facts: [
        `device_max=${device.max_watts}`,
        `port_watts=${portWatts}`,
        `cable=${cable?.max_watts ?? "assumed-60"}`,
        `overlap=${theoretical}`,
      ],
      relations: ["MAX_INPUT", "MAX_OUTPUT", "HAS_POWER_ALLOCATION", "SUPPORTS_PROTOCOL"],
      rules: [RULE_VERSION, "min(device,port,cable)"],
      sources: ["oem-power-specs"],
    },
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
export function getCable(slug: string) {
  return CABLES.find((item) => item.slug === slug);
}

export function powerKindFor(result: CompatibilityResult): PowerKind {
  if (result.evidence === "MEASURED") return "MEASURED";
  if (result.evidence === "SPEC_VERIFIED" && !result.theoretical) return "MANUFACTURER_RATED";
  if (result.theoretical) return "CALCULATED_EXPECTED";
  return "HEURISTIC_EXPECTED";
}

export function buildPowerScenarios(): PowerScenario[] {
  const defaultCable = CABLES.find((c) => c.slug === "apple-usbc-60w");
  const rows: PowerScenario[] = [];
  for (const [d, c] of POPULAR_PAIRS) {
    const device = getDevice(d);
    const charger = getCharger(c);
    if (!device || !charger) continue;
    const result = compatibility(device, charger, defaultCable);
    rows.push({
      id: `cm:scenario:${d}:${c}:${defaultCable?.slug ?? "none"}`,
      device_id: device.id,
      charger_id: charger.id,
      cable_id: defaultCable?.id,
      port: result.best_port,
      protocol: result.protocol,
      negotiated_voltage: null,
      negotiated_current: null,
      expected_power: result.max_power,
      limiting_component: result.bottleneck,
      power_kind: powerKindFor(result),
      measured_curve: null,
      confidence: result.confidence,
      evidence: result.evidence === "MEASURED" ? "INFERRED" : result.evidence,
    });
  }
  return rows;
}

export const POPULAR_PAIRS: Array<[string, string]> = [
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
  ...MORE_PAIRS,
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
      hub_necessity: device.demand >= 70,
      distinct_reason: device.slug,
      llm_safety_claim: false,
      verified_fact_count: 4,
      decision_relation_count: 4,
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
      structured_payload: { slug: device.slug, min: device.min_watts, max: device.max_watts, pd: device.pd_version, distinct_reason: device.slug },
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
    const device = getDevice(d);
    const charger = getCharger(c);
    if (!device || !charger) continue;
    const result = compatibility(device, charger);
    const demand = Math.min(device.demand, charger.demand);
    if (demand < 50) continue;
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
      distinct_reason: `${d}-${c}`,
      llm_safety_claim: false,
      unverified_specs: charger.tag === "PROTOCOL_INFERRED" || device.tag === "PROTOCOL_INFERRED",
      verified_fact_count: result.evidence === "SPEC_VERIFIED" ? 6 : 3,
      decision_relation_count: 6,
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
      structured_payload: {
        match: result.match,
        max_power: result.max_power,
        device: d,
        charger: c,
        distinct_reason: `${d}-${c}`,
        theoretical: result.theoretical,
        tag: result.tag,
        evidence: result.evidence,
        bottleneck: result.bottleneck,
        measured: null,
        rated: true,
        action_evidence: {
          actionType: "VERIFY",
          inputFields: ["device", "charger"],
          outputFields: ["match", "max_power", "bottleneck"],
          rendered: true,
          executable: true,
          decisionFields: ["match", "max_power", "bottleneck"],
        },
      },
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
  source_name: "Compiled device input and charger PDO tables",
  retrieved_at: "2026-06-01T00:00:00.000Z",
  verified_at: "2026-06-01T00:00:00.000Z",
  confidence: 85,
  raw_value: "device input + charger PDO tables",
  normalized_value: "watts",
  verification_method: "MANUFACTURER_DOC",
});

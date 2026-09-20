export type HardwareRepresentation = "exact" | "class";

export type DeviceClassId = "phone" | "laptop" | "tablet" | "handheld" | "small";
export type ChargerClassId = "compact" | "gan" | "multiport";
export type CableClassId = "usbc";

export type DeviceMedia = {
  classId: DeviceClassId;
  hero: string;
  front: string;
  port: string;
  representation: HardwareRepresentation;
  label: string;
};

export type ChargerMedia = {
  classId: ChargerClassId;
  hero: string;
  front: string;
  portSide: string;
  representation: HardwareRepresentation;
  label: string;
};

export type CableMedia = {
  classId: CableClassId;
  hero: string;
  connectorA: string;
  connectorB: string;
  cableType: string;
  ratedWatts?: number;
  representation: HardwareRepresentation;
  label: string;
};

const CLASS_LABEL = "Class reference";

const DEVICE_CLASS: Record<DeviceClassId, DeviceMedia> = {
  phone: {
    classId: "phone",
    hero: "/media/chargematch/phone-class.png",
    front: "/media/chargematch/phone-class.png",
    port: "/media/chargematch/phone-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  laptop: {
    classId: "laptop",
    hero: "/media/chargematch/laptop-class.png",
    front: "/media/chargematch/laptop-class.png",
    port: "/media/chargematch/laptop-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  tablet: {
    classId: "tablet",
    hero: "/media/chargematch/tablet-class.png",
    front: "/media/chargematch/tablet-class.png",
    port: "/media/chargematch/tablet-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  handheld: {
    classId: "handheld",
    hero: "/media/chargematch/tablet-class.png",
    front: "/media/chargematch/tablet-class.png",
    port: "/media/chargematch/tablet-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  small: {
    classId: "small",
    hero: "/media/chargematch/phone-class.png",
    front: "/media/chargematch/phone-class.png",
    port: "/media/chargematch/phone-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
};

const CHARGER_CLASS: Record<ChargerClassId, ChargerMedia> = {
  compact: {
    classId: "compact",
    hero: "/media/chargematch/charger-small.png",
    front: "/media/chargematch/charger-small.png",
    portSide: "/media/chargematch/charger-small.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  gan: {
    classId: "gan",
    hero: "/media/chargematch/charger-gan.png",
    front: "/media/chargematch/charger-gan.png",
    portSide: "/media/chargematch/charger-gan.png",
    representation: "class",
    label: CLASS_LABEL,
  },
  multiport: {
    classId: "multiport",
    hero: "/media/chargematch/charger-multiport-class.png",
    front: "/media/chargematch/charger-multiport-class.png",
    portSide: "/media/chargematch/charger-multiport-class.png",
    representation: "class",
    label: CLASS_LABEL,
  },
};

const CABLE_CLASS: CableMedia = {
  classId: "usbc",
  hero: "/media/chargematch/cable-usbc-class.png",
  connectorA: "/media/chargematch/cable-usbc-class.png",
  connectorB: "/media/chargematch/cable-usbc-class.png",
  cableType: "USB-C to USB-C",
  representation: "class",
  label: CLASS_LABEL,
};

export function deviceClassOf(slug: string): DeviceClassId {
  if (slug.includes("macbook")) return "laptop";
  if (slug.includes("ipad") || slug.includes("tab")) return "tablet";
  if (slug.includes("steam") || slug.includes("switch")) return "handheld";
  if (slug.includes("watch") || slug.includes("airpods")) return "small";
  return "phone";
}

export function chargerClassOf(watts: number, ports: number): ChargerClassId {
  if (ports >= 2) return "multiport";
  if (watts <= 35) return "compact";
  return "gan";
}

export function deviceMediaOf(slug: string): DeviceMedia {
  return DEVICE_CLASS[deviceClassOf(slug)];
}

export function chargerMediaOf(watts: number, ports: number): ChargerMedia {
  return CHARGER_CLASS[chargerClassOf(watts, ports)];
}

export function cableMediaOf(ratedWatts?: number): CableMedia {
  return { ...CABLE_CLASS, ratedWatts };
}

export function hardwareHonesty(representation: HardwareRepresentation) {
  if (representation === "exact") return "Exact product media";
  return "Class reference · representative hardware view";
}

export type AutospecVisualStatus = "PASS" | "WEAK" | "MISSING";

export type VehicleAssetRow = {
  identity: string;
  makeSlug: string;
  generationSlug: string;
  bodyAsset: string | null;
  engineVisual: string | null;
  tyresVisual: string | null;
  batteryVisual: string | null;
  serviceVisual: string | null;
  status: AutospecVisualStatus;
  source: string;
  note: string;
};

const SYSTEM_CLASS = {
  engine: {
    src: "/media/autospec/engine-bay-class.png",
    label: "System class reference",
    note: "Representative engine-bay view. Not the exact bay of the selected variant.",
  },
  tyres: {
    src: "/media/autospec/tyre-wheel-class.png",
    label: "System class reference",
    note: "Representative wheel / tyre / brake area. Not the fitted wheel of this identity.",
  },
  battery: {
    src: "/media/autospec/battery-12v-class.png",
    label: "System class reference",
    note: "Representative 12V electrical hardware. Not a radiograph of this vehicle.",
  },
  service: {
    src: "/media/autospec/workshop-service-class.png",
    label: "System class reference",
    note: "Representative workshop context. Not a live service booking or this car on a lift.",
  },
} as const;

export const AUTOSPEC_SYSTEM_CLASS = SYSTEM_CLASS;

export const AUTOSPEC_ASSET_MANIFEST: VehicleAssetRow[] = [
  {
    identity: "BMW 320d G20 B47D20",
    makeSlug: "bmw",
    generationSlug: "g20",
    bodyAsset: "/media/autospec/bmw-g20.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "Licensed G20 body still. Engine/tyres/battery/service are class-reference scenes, not this variant.",
  },
  {
    identity: "Toyota Corolla Hybrid E210",
    makeSlug: "toyota",
    generationSlug: "e210",
    bodyAsset: "/media/autospec/toyota-corolla-e210.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Alexander-93 · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "E210 body still. System scenes are class references.",
  },
  {
    identity: "Volkswagen Golf Mk8",
    makeSlug: "volkswagen",
    generationSlug: "mk8",
    bodyAsset: "/media/autospec/vw-golf-mk8.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Vauxford · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "Mk8 body still. System scenes are class references.",
  },
  {
    identity: "Tesla Model 3 Highland RWD",
    makeSlug: "tesla",
    generationSlug: "highland",
    bodyAsset: "/media/autospec/tesla-model-3-highland.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Mliu92 · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "Highland body is not a drive-unit photograph. Engine-bay class still is combustion-bay class, labelled as such.",
  },
  {
    identity: "Mercedes-Benz C220d W206",
    makeSlug: "mercedes-benz",
    generationSlug: "w206",
    bodyAsset: "/media/autospec/mercedes-w206.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "W206 body. Not a C220d-specific engine bay.",
  },
  {
    identity: "Audi A4 B9",
    makeSlug: "audi",
    generationSlug: "b9",
    bodyAsset: "/media/autospec/audi-a4-b9.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Alexander-93 · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "Body still only for identity. Systems are class references.",
  },
  {
    identity: "Peugeot 308 III P21",
    makeSlug: "peugeot",
    generationSlug: "p21",
    bodyAsset: "/media/autospec/peugeot-308-p21.jpg",
    engineVisual: SYSTEM_CLASS.engine.src,
    tyresVisual: SYSTEM_CLASS.tyres.src,
    batteryVisual: SYSTEM_CLASS.battery.src,
    serviceVisual: SYSTEM_CLASS.service.src,
    status: "WEAK",
    source: "Body: Thesupermat · Wikimedia Commons · CC BY-SA 4.0. Systems: authored class stills.",
    note: "Body still only for identity. Systems are class references.",
  },
];

export function autospecAssetOf(makeSlug: string, generationSlug: string): VehicleAssetRow | null {
  return AUTOSPEC_ASSET_MANIFEST.find((row) => row.makeSlug === makeSlug && row.generationSlug === generationSlug) ?? null;
}

export function autospecSystemMedia(zone: "engine" | "tyres" | "battery" | "service") {
  return SYSTEM_CLASS[zone];
}

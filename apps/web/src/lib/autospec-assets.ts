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

export const AUTOSPEC_ASSET_MANIFEST: VehicleAssetRow[] = [
  {
    identity: "BMW 320d G20 B47D20",
    makeSlug: "bmw",
    generationSlug: "g20",
    bodyAsset: "/media/autospec/bmw-g20.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0",
    note: "Licensed G20 body still only. Engine/tyres/battery/service stay technical plates — not mechanical photography.",
  },
  {
    identity: "Toyota Corolla Hybrid E210",
    makeSlug: "toyota",
    generationSlug: "e210",
    bodyAsset: "/media/autospec/toyota-corolla-e210.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Alexander-93 · Wikimedia Commons · CC BY-SA 4.0",
    note: "Body still only. No bay/fitment/battery rasters on file.",
  },
  {
    identity: "Volkswagen Golf Mk8",
    makeSlug: "volkswagen",
    generationSlug: "mk8",
    bodyAsset: "/media/autospec/vw-golf-mk8.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Vauxford · Wikimedia Commons · CC BY-SA 4.0",
    note: "Body still only.",
  },
  {
    identity: "Tesla Model 3 Highland RWD",
    makeSlug: "tesla",
    generationSlug: "highland",
    bodyAsset: "/media/autospec/tesla-model-3-highland.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Mliu92 · Wikimedia Commons · CC BY-SA 4.0",
    note: "Body still only. Highland body is not a drive-unit photograph.",
  },
  {
    identity: "Mercedes-Benz C220d W206",
    makeSlug: "mercedes-benz",
    generationSlug: "w206",
    bodyAsset: "/media/autospec/mercedes-w206.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Dinkun Chen · Wikimedia Commons · CC BY-SA 4.0",
    note: "W206 body. Not a C220d-specific engine bay.",
  },
  {
    identity: "Audi A4 B9",
    makeSlug: "audi",
    generationSlug: "b9",
    bodyAsset: "/media/autospec/audi-a4-b9.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Alexander-93 · Wikimedia Commons · CC BY-SA 4.0",
    note: "Body still only.",
  },
  {
    identity: "Peugeot 308 III P21",
    makeSlug: "peugeot",
    generationSlug: "p21",
    bodyAsset: "/media/autospec/peugeot-308-p21.jpg",
    engineVisual: null,
    tyresVisual: null,
    batteryVisual: null,
    serviceVisual: null,
    status: "WEAK",
    source: "Thesupermat · Wikimedia Commons · CC BY-SA 4.0",
    note: "Body still only.",
  },
];

export function autospecAssetOf(makeSlug: string, generationSlug: string): VehicleAssetRow | null {
  return AUTOSPEC_ASSET_MANIFEST.find((row) => row.makeSlug === makeSlug && row.generationSlug === generationSlug) ?? null;
}

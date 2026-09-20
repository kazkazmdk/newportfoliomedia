export const SITES = [
  "fixcode",
  "autospec",
  "wearthere",
  "chargematch",
  "tripcost",
] as const;

export type SiteId = (typeof SITES)[number];

export function isSiteId(value: string): value is SiteId {
  return (SITES as readonly string[]).includes(value);
}

export const SITE_LABEL: Record<SiteId, string> = {
  fixcode: "FixCode",
  autospec: "AutoSpec",
  wearthere: "WearThere",
  chargematch: "ChargeMatch",
  tripcost: "TripCost",
};

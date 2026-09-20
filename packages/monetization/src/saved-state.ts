import type { SiteId } from "./sites";

/** Local saved-state foundations. The product engines stay usable without an account. */
export const SAVED_KINDS = {
  fixcode: "saved_issue",
  autospec: "garage_vehicle",
  chargematch: "saved_device",
  tripcost: "saved_route",
  wearthere: "saved_trip",
} as const;

export type SavedKind = (typeof SAVED_KINDS)[SiteId];

export type SavedItem = {
  id: string;
  site: SiteId;
  kind: SavedKind;
  label: string;
  entityId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

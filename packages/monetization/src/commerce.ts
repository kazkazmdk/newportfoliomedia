import type { SiteId } from "./sites";
import type { LeadKind } from "./leads";

export type CommerceSurface = {
  site: SiteId;
  title: string;
  body: string;
  leadKind: LeadKind;
  shopEnabled: false;
  pricesPublished: false;
  inventory: [];
};

export const COMMERCE_SURFACE: Record<SiteId, CommerceSurface> = {
  fixcode: {
    site: "fixcode",
    title: "Next safe step",
    body: "Open the manufacturer document on file, or store a local service request. No parts catalogue is sold here.",
    leadKind: "service_request",
    shopEnabled: false,
    pricesPublished: false,
    inventory: [],
  },
  autospec: {
    site: "autospec",
    title: "Next ownership step",
    body: "Use the interval on file. No dealer marketplace or invented SKU list is attached.",
    leadKind: "service_request",
    shopEnabled: false,
    pricesPublished: false,
    inventory: [],
  },
  wearthere: {
    site: "wearthere",
    title: "Capsule, not a shop",
    body: "The packing list is climate-typical. Missing pieces are gaps, not product recommendations with prices.",
    leadKind: "sales_inquiry",
    shopEnabled: false,
    pricesPublished: false,
    inventory: [],
  },
  chargematch: {
    site: "chargematch",
    title: "Check current manufacturer specs",
    body: "Wattage is negotiated from rated facts. This is not a charger store and no partner buy-link exists.",
    leadKind: "sales_inquiry",
    shopEnabled: false,
    pricesPublished: false,
    inventory: [],
  },
  tripcost: {
    site: "tripcost",
    title: "Modelled cost, not a ticket",
    body: "Compare the corridor. No carrier checkout and no live fare API is contracted.",
    leadKind: "sales_inquiry",
    shopEnabled: false,
    pricesPublished: false,
    inventory: [],
  },
};

export function assertNoPublicRateCard(price?: number | string | null): void {
  if (price != null && price !== "") {
    throw new Error("No public rate card or invented price may be published.");
  }
}

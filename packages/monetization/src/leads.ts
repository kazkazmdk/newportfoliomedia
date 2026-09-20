import type { SiteId } from "./sites";

export const LEAD_KINDS = [
  "service_request",
  "sales_inquiry",
  "data_license",
  "api_access",
  "widget_embed",
  "correction",
] as const;

export type LeadKind = (typeof LEAD_KINDS)[number];

export const LEAD_STATES = [
  "RECEIVED",
  "STORED_LOCAL",
  "UNASSIGNED",
  "CLOSED_NO_NETWORK",
] as const;

export type LeadState = (typeof LEAD_STATES)[number];

export type LeadRecord = {
  id: string;
  site: SiteId;
  kind: LeadKind;
  state: LeadState;
  entityId?: string;
  message: string;
  contact: string;
  assignedPartnerId: null;
  createdAt: string;
};

export const EMPTY_NETWORK_COPY: Record<SiteId, string> = {
  fixcode:
    "No workshop network is contracted. This request is stored on this machine only. It is not sent to a technician.",
  autospec:
    "No dealer or independent garage network is contracted. The request stays local and unassigned.",
  wearthere:
    "No retailer or publisher program is contracted. The request is stored locally for a future evaluation.",
  chargematch:
    "No hardware partner or lab program is contracted. Compatibility does not become a product listing.",
  tripcost:
    "No carrier, OTA, or booking partner is contracted. This is not a ticket purchase.",
};

export function createLeadDraft(input: {
  id: string;
  site: SiteId;
  kind: LeadKind;
  entityId?: string;
  message: string;
  contact: string;
  createdAt?: string;
}): LeadRecord {
  return {
    id: input.id,
    site: input.site,
    kind: input.kind,
    state: "STORED_LOCAL",
    entityId: input.entityId,
    message: input.message.trim(),
    contact: input.contact.trim(),
    assignedPartnerId: null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function assertLeadCannotAssign(lead: LeadRecord): void {
  if (lead.assignedPartnerId !== null) {
    throw new Error("No partner directory exists. A lead cannot be assigned.");
  }
  if (lead.state !== "STORED_LOCAL" && lead.state !== "UNASSIGNED" && lead.state !== "RECEIVED" && lead.state !== "CLOSED_NO_NETWORK") {
    throw new Error(`Illegal lead state ${lead.state}.`);
  }
}

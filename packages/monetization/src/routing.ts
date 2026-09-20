import type { SiteId } from "./sites";
import type { LeadKind } from "./leads";

export const LEAD_LIFECYCLE = [
  "RECEIVED",
  "QUALIFIED",
  "MATCHING",
  "ROUTED",
  "ACCEPTED",
  "REJECTED",
  "CONVERTED",
  "CLOSED",
  "UNASSIGNED",
] as const;

export type LeadLifecycle = (typeof LEAD_LIFECYCLE)[number];

export type PartnerRecord = {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  countries: string[];
  regions: string[];
  sites: SiteId[];
  status: "active" | "inactive" | "fixture";
};

export type RoutingInput = {
  site: SiteId;
  kind: LeadKind;
  country?: string;
  capability?: string;
  partners: PartnerRecord[];
};

export type RoutingResult =
  | { state: "UNASSIGNED"; partnerId: null; reason: "no_active_partner" }
  | { state: "MATCHING"; partnerId: string; reason: "fixture_or_contracted" };

export function routeLead(input: RoutingInput): RoutingResult {
  const active = input.partners.filter((partner) => partner.status === "active");
  const matched = active.find((partner) => {
    if (!partner.sites.includes(input.site)) return false;
    if (input.capability && !partner.capabilities.includes(input.capability)) return false;
    if (input.country && partner.countries.length && !partner.countries.includes(input.country)) return false;
    return true;
  });
  if (!matched) return { state: "UNASSIGNED", partnerId: null, reason: "no_active_partner" };
  return { state: "MATCHING", partnerId: matched.id, reason: "fixture_or_contracted" };
}

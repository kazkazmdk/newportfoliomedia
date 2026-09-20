import type { SiteId } from "./sites";
import type { PlatformEvent } from "./events";
import type { LeadRecord } from "./leads";
import type { ObservationRecord } from "./observations";

export type FlywheelCounts = {
  site: SiteId | "platform";
  events: number;
  toolsCompleted: number;
  outboundClicks: number;
  leads: number;
  observations: number;
  apiCalls: number;
};

export type WinnerSignal = {
  site: SiteId;
  score: number;
  reasons: string[];
  claim: "internal_opportunity_only";
};

export function flywheelCounts(
  site: SiteId | "platform",
  events: PlatformEvent[],
  leads: LeadRecord[],
  observations: ObservationRecord[],
): FlywheelCounts {
  const scopedEvents = site === "platform" ? events : events.filter((event) => event.site === site);
  const scopedLeads = site === "platform" ? leads : leads.filter((lead) => lead.site === site);
  const scopedObs = site === "platform" ? observations : observations.filter((row) => row.site === site);
  return {
    site,
    events: scopedEvents.length,
    toolsCompleted: scopedEvents.filter((event) => event.name === "tool_completed").length,
    outboundClicks: scopedEvents.filter((event) => event.name === "outbound_click").length,
    leads: scopedLeads.length,
    observations: scopedObs.length,
    apiCalls: scopedEvents.filter((event) => event.name === "api_called").length,
  };
}

/** Internal ranking from in-repo activity only. Never a market or revenue claim. */
export function winnerSignal(input: {
  site: SiteId;
  indexablePages: number;
  engineApis: number;
  verifiedFacts: number;
  localEvents: number;
  localLeads: number;
}): WinnerSignal {
  const score =
    input.indexablePages * 2 +
    input.engineApis * 20 +
    input.verifiedFacts +
    input.localEvents +
    input.localLeads * 3;
  const reasons = [
    `${input.indexablePages} INDEXABLE pages in the assembled catalog`,
    `${input.engineApis} first-party engine routes present`,
    `${input.verifiedFacts} verified-or-sourced facts counted on catalog pages`,
    `${input.localEvents} locally stored events`,
    `${input.localLeads} locally stored leads (unassigned)`,
  ];
  return { site: input.site, score, reasons, claim: "internal_opportunity_only" };
}

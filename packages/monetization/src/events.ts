import type { SiteId } from "./sites";
import type { IntentKind } from "./intent";

export const MONETIZATION_EVENTS = [
  "page_view",
  "search",
  "tool_started",
  "tool_completed",
  "decision_viewed",
  "outbound_click",
  "affiliate_click",
  "lead_submitted",
  "observation_submitted",
  "feedback_positive",
  "feedback_negative",
  "api_called",
  "widget_loaded",
  "widget_completed",
  "key_created",
  "key_revoked",
  "meter_exceeded",
] as const;

export type MonetizationEventName = (typeof MONETIZATION_EVENTS)[number];

export type PlatformEvent = {
  id: string;
  name: MonetizationEventName;
  site: SiteId | "platform";
  intent?: IntentKind;
  entityId?: string;
  path?: string;
  properties: Record<string, unknown>;
  at: string;
};

export function isMonetizationEvent(name: string): name is MonetizationEventName {
  return (MONETIZATION_EVENTS as readonly string[]).includes(name);
}

/** Affiliate clicks require a contracted partner. None exist in-repo. */
export function affiliateAllowed(partnerId?: string): boolean {
  return Boolean(partnerId && partnerId !== "none" && partnerId !== "unspecified");
}

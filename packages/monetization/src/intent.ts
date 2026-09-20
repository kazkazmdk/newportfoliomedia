import { isSiteId, type SiteId } from "./sites";

export const INTENT_KINDS = [
  "diagnose",
  "check_compatibility",
  "compare_route",
  "inspect_vehicle",
  "pack_trip",
  "research",
  "operator",
  "unknown",
] as const;

export type IntentKind = (typeof INTENT_KINDS)[number];

export const INTENT_FUNNEL = [
  "discover",
  "tool",
  "decision",
  "outbound",
  "lead",
  "retain",
] as const;

export type IntentFunnel = (typeof INTENT_FUNNEL)[number];

export type ClassifiedIntent = {
  site: SiteId | "unknown";
  kind: IntentKind;
  funnel: IntentFunnel;
  entityHint?: string;
  commercial: boolean;
  reason: string;
};

const B2B_SEGMENTS = new Set([
  "developers",
  "api",
  "widgets",
  "data",
  "business",
  "docs",
  "contact-sales",
]);

export function classifyIntent(input: {
  path: string;
  query?: Record<string, string | undefined>;
}): ClassifiedIntent {
  const parts = input.path.split("/").filter(Boolean);
  const sitePart = parts[0] ?? "";
  const site = isSiteId(sitePart) ? sitePart : "unknown";
  const second = parts[1] ?? "";
  const third = parts[2] ?? "";

  if (site === "unknown") {
    return {
      site,
      kind: "unknown",
      funnel: "discover",
      commercial: false,
      reason: "Path is not a product surface.",
    };
  }

  if (B2B_SEGMENTS.has(second)) {
    return {
      site,
      kind: "operator",
      funnel: second === "contact-sales" ? "lead" : "retain",
      commercial: true,
      reason: `Operator surface /${second}. No public rate card.`,
    };
  }

  if (site === "fixcode") {
    if (second === "diagnose" || parts.length >= 4) {
      return {
        site,
        kind: "diagnose",
        funnel: "decision",
        entityHint: parts.slice(1).join("/") || input.query?.code,
        commercial: false,
        reason: "Diagnostic tree — next action is official source or a stored local request.",
      };
    }
    return { site, kind: "research", funnel: "discover", commercial: false, reason: "FixCode index or brand list." };
  }

  if (site === "chargematch") {
    if (third === "with" || second === "kit") {
      return {
        site,
        kind: "check_compatibility",
        funnel: "decision",
        entityHint: parts.slice(1).join("/"),
        commercial: false,
        reason: "Compatibility bench — wattage is negotiated, not a shop SKU.",
      };
    }
    return { site, kind: "research", funnel: "discover", commercial: false, reason: "ChargeMatch device index." };
  }

  if (site === "tripcost") {
    if (third === "to") {
      return {
        site,
        kind: "compare_route",
        funnel: "decision",
        entityHint: `${second}-${parts[3] ?? ""}`,
        commercial: false,
        reason: "Modelled corridor compare — not a live fare or booking.",
      };
    }
    return { site, kind: "research", funnel: "discover", commercial: false, reason: "TripCost atlas home." };
  }

  if (site === "autospec") {
    if (second === "garage" || parts.length >= 5) {
      return {
        site,
        kind: "inspect_vehicle",
        funnel: "decision",
        entityHint: parts.slice(1).join("/"),
        commercial: false,
        reason: "Vehicle identity / service interval — no invented parts marketplace.",
      };
    }
    return { site, kind: "research", funnel: "discover", commercial: false, reason: "AutoSpec make index." };
  }

  if (site === "wearthere") {
    if (third && (parts[3] === "packing" || parts[3] === "what-to-wear" || second === "trip")) {
      return {
        site,
        kind: "pack_trip",
        funnel: "decision",
        entityHint: parts.slice(1, 3).join("/"),
        commercial: false,
        reason: "Capsule / climate typical — not a forecast shop.",
      };
    }
    return { site, kind: "research", funnel: "discover", commercial: false, reason: "WearThere destination index." };
  }

  return { site, kind: "unknown", funnel: "discover", commercial: false, reason: "Unclassified product path." };
}

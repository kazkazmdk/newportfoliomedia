import type { SiteId } from "./sites";
import { affiliateAllowed } from "./events";

export type OutboundLink = {
  id: string;
  site: SiteId;
  href: string;
  label: string;
  sourceName: string;
  affiliate: false;
  partnerId: null;
  reason: string;
};

export function officialOutbound(input: {
  id: string;
  site: SiteId;
  href: string;
  label: string;
  sourceName: string;
}): OutboundLink {
  if (!isHttpUrl(input.href)) {
    throw new Error("Outbound href must be an absolute http(s) URL.");
  }
  if (affiliateAllowed()) {
    throw new Error("Affiliate is not allowed without a contracted partner id.");
  }
  return {
    id: input.id,
    site: input.site,
    href: input.href,
    label: input.label,
    sourceName: input.sourceName,
    affiliate: false,
    partnerId: null,
    reason: "Official or manufacturer URL already on file. Not an affiliate hop.",
  };
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

import type { SiteId } from "./sites";
import { classifyIntentV2, type IntentProfile } from "./intent-v2";
import { COMMERCE_SURFACE } from "./commerce";

export type MonetizationContext = {
  path: string;
  site: SiteId;
  official?: { href: string; label: string; sourceName: string };
  offers?: Array<{ id: string; live: boolean }>;
  partners?: Array<{ id: string; status: string }>;
  sponsored?: boolean;
  b2b?: boolean;
};

export type ResolvedSurface =
  | { kind: "official_outbound"; href: string; label: string; sourceName: string; affiliate: false }
  | { kind: "affiliate_offer"; offerId: string; labelled: true }
  | { kind: "sponsored"; labelled: true }
  | { kind: "lead_unassigned"; reason: string }
  | { kind: "b2b_cta"; href: string }
  | { kind: "none"; reason: string };

export function resolveMonetizationSurface(context: MonetizationContext): {
  intent: IntentProfile;
  surfaces: ResolvedSurface[];
} {
  const intent = classifyIntentV2({ path: context.path });
  const surfaces: ResolvedSurface[] = [];
  if (context.official) {
    surfaces.push({ kind: "official_outbound", ...context.official, affiliate: false });
  }
  const liveOffers = (context.offers ?? []).filter((offer) => offer.live);
  if (liveOffers[0] && intent.affiliateSuitability !== "NONE") {
    surfaces.push({ kind: "affiliate_offer", offerId: liveOffers[0].id, labelled: true });
  }
  if (context.sponsored) surfaces.push({ kind: "sponsored", labelled: true });
  const activePartners = (context.partners ?? []).filter((row) => row.status === "active");
  if (intent.leadSuitability === "HIGH" || intent.leadSuitability === "CONDITIONAL") {
    if (activePartners.length === 0) {
      surfaces.push({ kind: "lead_unassigned", reason: COMMERCE_SURFACE[context.site].body });
    }
  }
  if (context.b2b || intent.class === "B2B_OPERATOR") {
    surfaces.push({ kind: "b2b_cta", href: `/${context.site}/developers` });
  }
  if (surfaces.length === 0) {
    surfaces.push({ kind: "none", reason: "No live offer, partner, or official URL is on file." });
  }
  return { intent, surfaces };
}

export function offerIsLive(input: { checkedAt: string; expiresAt?: string | null; maxAgeHours?: number }): boolean {
  const maxAge = (input.maxAgeHours ?? 24) * 3600_000;
  const checked = new Date(input.checkedAt).getTime();
  if (Number.isNaN(checked)) return false;
  if (Date.now() - checked > maxAge) return false;
  if (input.expiresAt && new Date(input.expiresAt).getTime() < Date.now()) return false;
  return true;
}

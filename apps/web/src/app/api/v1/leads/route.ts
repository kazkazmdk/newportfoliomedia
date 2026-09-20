import { EMPTY_NETWORK_COPY, isSiteId, LEAD_KINDS, routeLead, type LeadKind } from "@penta/monetization";
import { hashOptional, publicLeadView, type StoredLead } from "@penta/platform-data";
import { readJsonBody } from "@/lib/read-json";
import { localDevActor } from "@/lib/dev-session";
import { newId, repo } from "@/lib/platform-store";
import { fail, limited, ok, recordEvent, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Lead listing requires local session.", requestIdOf(request));
  return ok(request, { leads: (await repo().listLeads()).map(publicLeadView) });
}

export async function POST(request: Request) {
  const blocked = limited(request, "v1-leads", 8);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    site?: string;
    kind?: string;
    entityId?: string;
    message?: string;
    contact?: string;
    company?: string;
    consent?: boolean;
    sourcePage?: string;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, requestIdOf(request));
  const { site, kind, entityId, message, contact, company, consent, sourcePage } = parsed.value;
  if (company) return ok(request, { ignored: true, reason: "honeypot" });
  if (!site || !isSiteId(site)) return fail("invalid_request", "unknown_site", requestIdOf(request));
  if (!kind || !(LEAD_KINDS as readonly string[]).includes(kind)) return fail("invalid_request", "unknown_lead_kind", requestIdOf(request));
  if (!consent) return fail("invalid_request", "consent_required", requestIdOf(request));
  if (!message?.trim() || message.length > 2000 || !contact?.trim() || contact.length > 200) {
    return fail("invalid_request", "message_and_contact_required", requestIdOf(request));
  }
  const partners = await repo().listPartners();
  const routed = routeLead({
    site,
    kind: kind as LeadKind,
    partners: partners.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      capabilities: row.capabilities,
      countries: [],
      regions: row.regions,
      sites: [site],
      status: row.status,
    })),
  });
  const now = new Date();
  const lead: StoredLead = {
    id: newId("lead"),
    site,
    kind,
    state: routed.state,
    entityId,
    message: message.trim(),
    contact: contact.trim(),
    assignedPartnerId: routed.partnerId,
    consentVersion: "2026-09-20",
    consentTimestamp: now.toISOString(),
    sourcePage,
    privacyNoticeVersion: "2026-09-20",
    ipHash: hashOptional(request.headers.get("x-forwarded-for")),
    userAgentHash: hashOptional(request.headers.get("user-agent")),
    retentionUntil: new Date(now.getTime() + 180 * 86400000).toISOString(),
    deletedAt: null,
    createdAt: now.toISOString(),
  };
  await repo().addLead(lead);
  await recordEvent({ name: "lead_submitted", site, entityId, properties: { kind, leadId: lead.id, state: lead.state } });
  return ok(request, {
    lead: { id: lead.id, site: lead.site, state: lead.state, assignedPartnerId: lead.assignedPartnerId, retentionUntil: lead.retentionUntil },
    network: routed.partnerId ? "matched" : "empty",
    message: routed.partnerId ? "Matched a contracted partner." : EMPTY_NETWORK_COPY[site],
  });
}

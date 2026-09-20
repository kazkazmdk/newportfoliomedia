import { NextResponse } from "next/server";
import { createLeadDraft, EMPTY_NETWORK_COPY, isSiteId, LEAD_KINDS, type LeadKind } from "@penta/monetization";
import { readJsonBody } from "@/lib/read-json";
import { mutateStore, newId } from "@/lib/platform-store";
import { limited, recordEvent } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-leads", 20);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    site?: string;
    kind?: string;
    entityId?: string;
    message?: string;
    contact?: string;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const { site, kind, entityId, message, contact } = parsed.value;
  if (!site || !isSiteId(site)) return NextResponse.json({ error: "unknown_site" }, { status: 400 });
  if (!kind || !(LEAD_KINDS as readonly string[]).includes(kind)) {
    return NextResponse.json({ error: "unknown_lead_kind" }, { status: 400 });
  }
  if (!message?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: "message_and_contact_required" }, { status: 400 });
  }
  const lead = mutateStore((store) => {
    const row = createLeadDraft({
      id: newId("lead"),
      site,
      kind: kind as LeadKind,
      entityId,
      message,
      contact,
    });
    store.leads.push(row);
    return row;
  });
  recordEvent({ name: "lead_submitted", site, entityId, properties: { kind, leadId: lead.id } });
  return NextResponse.json({
    lead: { ...lead, assignedPartnerId: null },
    network: "empty",
    message: EMPTY_NETWORK_COPY[site],
  });
}

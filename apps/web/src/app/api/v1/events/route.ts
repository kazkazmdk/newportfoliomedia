import { NextResponse } from "next/server";
import { isMonetizationEvent, isSiteId } from "@penta/monetization";
import { readJsonBody } from "@/lib/read-json";
import { limited, recordEvent } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-events", 80);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    name?: string;
    site?: string;
    path?: string;
    entityId?: string;
    properties?: Record<string, unknown>;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const { name, site, path, entityId, properties } = parsed.value;
  if (!name || !isMonetizationEvent(name)) return NextResponse.json({ error: "unknown_event" }, { status: 400 });
  if (!site || (site !== "platform" && !isSiteId(site))) {
    return NextResponse.json({ error: "unknown_site" }, { status: 400 });
  }
  if (name === "affiliate_click") {
    return NextResponse.json(
      { error: "affiliate_unavailable", message: "No contracted partner exists. Use outbound_click for official sources." },
      { status: 409 },
    );
  }
  const event = recordEvent({
    name,
    site,
    path,
    entityId,
    properties: properties ?? {},
  });
  return NextResponse.json({ event, persisted: "local" });
}

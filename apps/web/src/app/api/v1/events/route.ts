import { isMonetizationEvent, isSiteId } from "@penta/monetization";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, ok, recordEvent, requestIdOf } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-events", 80);
  if (blocked) return blocked;
  const id = requestIdOf(request);
  const parsed = await readJsonBody<{
    name?: string;
    site?: string;
    path?: string;
    entityId?: string;
    properties?: Record<string, unknown>;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, id);
  const { name, site, path, entityId, properties } = parsed.value;
  if (!name || !isMonetizationEvent(name)) return fail("invalid_request", "unknown_event", id);
  if (!site || (site !== "platform" && !isSiteId(site))) return fail("invalid_request", "unknown_site", id);
  if (name === "affiliate_click") {
    return fail("offer_unavailable", "No contracted affiliate program exists. Use outbound_click.", id);
  }
  await recordEvent({ name, site, path, entityId, properties: properties ?? {} });
  return ok(request, { persisted: "repository", name, site });
}

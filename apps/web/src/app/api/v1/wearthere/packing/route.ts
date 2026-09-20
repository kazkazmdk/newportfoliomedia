import { DESTINATIONS, capsuleFor, type StyleId } from "@penta/wearthere";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, logRequest, ok, recordEvent, requireEngine } from "@/lib/v1";

export async function POST(request: Request) {
  const started = Date.now();
  const blocked = limited(request, "v1-wearthere", 40);
  if (blocked) return blocked;
  const auth = await requireEngine(request, "wearthere");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{ destination?: string; month?: number; style?: StyleId }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, auth.requestId);
  const dest = DESTINATIONS.find((d) => d.slug === parsed.value.destination);
  if (!dest) {
    await logRequest({ request, site: "wearthere", status: 404, started, keyId: auth.key.id, organizationId: auth.key.organizationId, errorCode: "unknown_entity" });
    return fail("unknown_entity", "Unknown destination.", auth.requestId);
  }
  const plan = capsuleFor(dest, parsed.value.month ?? 10, parsed.value.style ?? "classic");
  await recordEvent({ name: "api_called", site: "wearthere", entityId: dest.id, path: "/api/v1/wearthere/packing", properties: { keyId: auth.key.id } });
  await logRequest({ request, site: "wearthere", status: 200, started, keyId: auth.key.id, organizationId: auth.key.organizationId, entityId: dest.id });
  return ok(request, {
    pieces: plan.pieces.map((p) => ({ name: p.name, warmth: p.warmth, layer: p.layer })),
    outfits: plan.outfits,
    weight_kg: plan.weight_kg,
    weather_kind: plan.weather_kind,
    missing: plan.missing,
    coverage: plan.coverage,
    rule_version: plan.rule_version,
    usage: { remaining: auth.remaining, limit: auth.limit, site: "wearthere", price: null },
  });
}

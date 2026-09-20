import { compareRoute, getRoute } from "@penta/tripcost";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, logRequest, ok, recordEvent, requireEngine } from "@/lib/v1";

export async function POST(request: Request) {
  const started = Date.now();
  const blocked = limited(request, "v1-tripcost", 40);
  if (blocked) return blocked;
  const auth = await requireEngine(request, "tripcost");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{
    origin?: string;
    destination?: string;
    travellers?: number;
    true_cost?: boolean;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, auth.requestId);
  const route = getRoute(parsed.value.origin ?? "", parsed.value.destination ?? "");
  if (!route) {
    await logRequest({ request, site: "tripcost", status: 404, started, keyId: auth.key.id, organizationId: auth.key.organizationId, errorCode: "unknown_entity" });
    return fail("unknown_entity", "Unknown corridor.", auth.requestId);
  }
  const result = compareRoute(route, parsed.value.travellers ?? 1, parsed.value.true_cost ?? false);
  await recordEvent({ name: "api_called", site: "tripcost", entityId: route.id, path: "/api/v1/tripcost/compare", properties: { keyId: auth.key.id } });
  await logRequest({ request, site: "tripcost", status: 200, started, keyId: auth.key.id, organizationId: auth.key.organizationId, entityId: route.id });
  return ok(request, { ...result, usage: { remaining: auth.remaining, limit: auth.limit, site: "tripcost", price: null } });
}

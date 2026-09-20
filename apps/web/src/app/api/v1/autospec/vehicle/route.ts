import { checkFitment, getVehicle, nextService } from "@penta/autospec";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, logRequest, ok, recordEvent, requireEngine } from "@/lib/v1";

export async function POST(request: Request) {
  const started = Date.now();
  const blocked = limited(request, "v1-autospec", 40);
  if (blocked) return blocked;
  const auth = await requireEngine(request, "autospec");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{
    make?: string;
    model?: string;
    generation?: string;
    variant?: string;
    km?: number;
    part?: string;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, auth.requestId);
  const vehicle = getVehicle(
    parsed.value.make ?? "",
    parsed.value.model ?? "",
    parsed.value.generation ?? "",
    parsed.value.variant ?? "",
  );
  if (!vehicle) {
    await logRequest({ request, site: "autospec", status: 404, started, keyId: auth.key.id, organizationId: auth.key.organizationId, errorCode: "unknown_entity" });
    return fail("unknown_entity", "Unknown vehicle identity.", auth.requestId);
  }
  await recordEvent({ name: "api_called", site: "autospec", entityId: vehicle.id, path: "/api/v1/autospec/vehicle", properties: { keyId: auth.key.id } });
  await logRequest({ request, site: "autospec", status: 200, started, keyId: auth.key.id, organizationId: auth.key.organizationId, entityId: vehicle.id });
  const usage = { remaining: auth.remaining, limit: auth.limit, site: "autospec" as const, price: null };
  if (parsed.value.part) return ok(request, { fitment: checkFitment(vehicle, parsed.value.part), usage });
  return ok(request, {
    vehicle: vehicle.id,
    engine: vehicle.engine_code,
    market: vehicle.market,
    schedule:
      parsed.value.km != null
        ? nextService(vehicle, parsed.value.km)
        : vehicle.services.map((item) => ({ ...item, km_left: null, months_left: null })),
    usage,
  });
}

import { compatibility, getCharger, getDevice } from "@penta/chargematch";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, logRequest, ok, recordEvent, requireEngine } from "@/lib/v1";

export async function POST(request: Request) {
  const started = Date.now();
  const blocked = limited(request, "v1-chargematch", 60);
  if (blocked) return blocked;
  const auth = await requireEngine(request, "chargematch");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{ device?: string; charger?: string }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, auth.requestId);
  const device = getDevice(parsed.value.device ?? "");
  const charger = getCharger(parsed.value.charger ?? "");
  if (!device || !charger) {
    await logRequest({ request, site: "chargematch", status: 404, started, keyId: auth.key.id, organizationId: auth.key.organizationId, errorCode: "unknown_entity" });
    return fail("unknown_entity", "Unknown device or charger.", auth.requestId);
  }
  const result = compatibility(device, charger);
  await recordEvent({
    name: "api_called",
    site: "chargematch",
    entityId: `${device.id}+${charger.id}`,
    path: "/api/v1/chargematch/compatibility",
    properties: { keyId: auth.key.id, limiting: result.bottleneck },
  });
  await logRequest({ request, site: "chargematch", status: 200, started, keyId: auth.key.id, organizationId: auth.key.organizationId, entityId: device.id });
  return ok(request, {
    compatible: result.compatible,
    safe: result.safe,
    safety_note: result.safety_note,
    max_power: result.max_power,
    protocol: result.protocol,
    bottleneck: result.bottleneck,
    confidence: result.confidence,
    tag: result.tag,
    explanation: result.explanation,
    evidence: result.evidence,
    theoretical: result.theoretical,
    rule_version: result.rule_version,
    trace: result.trace,
    usage: { remaining: auth.remaining, limit: auth.limit, site: "chargematch", price: null },
  });
}

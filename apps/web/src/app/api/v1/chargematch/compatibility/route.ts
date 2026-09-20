import { NextResponse } from "next/server";
import { compatibility, getCharger, getDevice } from "@penta/chargematch";
import { readJsonBody } from "@/lib/read-json";
import { limited, recordEvent, requireKey } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-chargematch", 60);
  if (blocked) return blocked;
  const auth = requireKey(request, "read:engine");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{ device?: string; charger?: string }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const device = getDevice(parsed.value.device ?? "");
  const charger = getCharger(parsed.value.charger ?? "");
  if (!device || !charger) {
    return NextResponse.json({ error: "unknown_entity", confidence: "UNKNOWN" }, { status: 404 });
  }
  const result = compatibility(device, charger);
  recordEvent({
    name: "api_called",
    site: "chargematch",
    entityId: `${device.id}+${charger.id}`,
    path: "/api/v1/chargematch/compatibility",
    properties: { keyId: auth.key.id, limiting: result.bottleneck },
  });
  return NextResponse.json({
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
    meter: { calls: auth.meter.calls, price: null },
  });
}

import { NextResponse } from "next/server";
import { compatibility, getCharger, getDevice } from "@penta/chargematch";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`chargematch:${clientKey(request)}`, 60);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = (await request.json()) as { device?: string; charger?: string };
  const device = getDevice(body.device ?? "");
  const charger = getCharger(body.charger ?? "");
  if (!device || !charger) {
    return NextResponse.json({ error: "unknown_entity", confidence: "UNKNOWN" }, { status: 404 });
  }
  const result = compatibility(device, charger);
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
    theoretical: result.theoretical,
    rule_version: result.rule_version,
    trace: result.trace,
  });
}

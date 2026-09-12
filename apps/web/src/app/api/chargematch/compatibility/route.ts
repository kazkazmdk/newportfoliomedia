import { NextResponse } from "next/server";
import { compatibility, getCharger, getDevice } from "@penta/chargematch";

export async function POST(request: Request) {
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
    max_power: result.max_power,
    protocol: result.protocol,
    bottleneck: result.bottleneck,
    confidence: result.confidence,
    explanation: result.explanation,
  });
}

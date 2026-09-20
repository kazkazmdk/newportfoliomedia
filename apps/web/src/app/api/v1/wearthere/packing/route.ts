import { NextResponse } from "next/server";
import { DESTINATIONS, capsuleFor, type StyleId } from "@penta/wearthere";
import { readJsonBody } from "@/lib/read-json";
import { limited, recordEvent, requireKey } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-wearthere", 40);
  if (blocked) return blocked;
  const auth = requireKey(request, "read:engine");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{
    destination?: string;
    month?: number;
    style?: StyleId;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const dest = DESTINATIONS.find((d) => d.slug === parsed.value.destination);
  if (!dest) return NextResponse.json({ error: "unknown_destination" }, { status: 404 });
  const plan = capsuleFor(dest, parsed.value.month ?? 10, parsed.value.style ?? "classic");
  recordEvent({
    name: "api_called",
    site: "wearthere",
    entityId: dest.id,
    path: "/api/v1/wearthere/packing",
    properties: { keyId: auth.key.id },
  });
  return NextResponse.json({
    pieces: plan.pieces.map((p) => ({ name: p.name, warmth: p.warmth, layer: p.layer })),
    outfits: plan.outfits,
    weight_kg: plan.weight_kg,
    weather_kind: plan.weather_kind,
    missing: plan.missing,
    coverage: plan.coverage,
    rule_version: plan.rule_version,
    meter: { calls: auth.meter.calls, price: null },
  });
}

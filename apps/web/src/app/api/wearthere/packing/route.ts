import { NextResponse } from "next/server";
import { DESTINATIONS, capsuleFor, type StyleId } from "@penta/wearthere";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/read-json";

export async function POST(request: Request) {
  const limited = rateLimit(`wearthere:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const parsed = await readJsonBody<{
    destination?: string;
    month?: number;
    style?: StyleId;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const dest = DESTINATIONS.find((d) => d.slug === parsed.value.destination);
  if (!dest) return NextResponse.json({ error: "unknown_destination" }, { status: 404 });
  const plan = capsuleFor(dest, parsed.value.month ?? 10, parsed.value.style ?? "classic");
  return NextResponse.json({
    pieces: plan.pieces.map((p) => ({ name: p.name, warmth: p.warmth, layer: p.layer })),
    outfits: plan.outfits,
    weight_kg: plan.weight_kg,
    weather_kind: plan.weather_kind,
    missing: plan.missing,
    coverage: plan.coverage,
    rule_version: plan.rule_version,
  });
}

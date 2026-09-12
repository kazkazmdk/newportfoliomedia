import { NextResponse } from "next/server";
import { DESTINATIONS, capsuleFor, type StyleId } from "@penta/wearthere";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    destination?: string;
    month?: number;
    style?: StyleId;
  };
  const dest = DESTINATIONS.find((d) => d.slug === body.destination);
  if (!dest) return NextResponse.json({ error: "unknown_destination" }, { status: 404 });
  const plan = capsuleFor(dest, body.month ?? 10, body.style ?? "classic");
  return NextResponse.json({
    pieces: plan.pieces.map((p) => p.name),
    outfits: plan.outfits,
    weight_kg: plan.weight_kg,
    weather_kind: plan.weather_kind,
    missing: plan.missing,
  });
}

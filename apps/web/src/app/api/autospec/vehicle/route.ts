import { NextResponse } from "next/server";
import { checkFitment, getVehicle, nextService } from "@penta/autospec";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`autospec:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = (await request.json()) as {
    make?: string;
    model?: string;
    generation?: string;
    variant?: string;
    km?: number;
    part?: string;
  };
  const vehicle = getVehicle(
    body.make ?? "",
    body.model ?? "",
    body.generation ?? "",
    body.variant ?? "",
  );
  if (!vehicle) {
    return NextResponse.json({ error: "unknown_vehicle" }, { status: 404 });
  }
  if (body.part) {
    return NextResponse.json({ fitment: checkFitment(vehicle, body.part) });
  }
  return NextResponse.json({
    vehicle: vehicle.id,
    engine: vehicle.engine_code,
    market: vehicle.market,
    schedule: nextService(vehicle, body.km ?? 0, 12),
  });
}

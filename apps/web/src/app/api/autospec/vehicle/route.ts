import { NextResponse } from "next/server";
import { checkFitment, getVehicle, nextService } from "@penta/autospec";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/read-json";

export async function POST(request: Request) {
  const limited = rateLimit(`autospec:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const parsed = await readJsonBody<{
    make?: string;
    model?: string;
    generation?: string;
    variant?: string;
    km?: number;
    part?: string;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const vehicle = getVehicle(
    parsed.value.make ?? "",
    parsed.value.model ?? "",
    parsed.value.generation ?? "",
    parsed.value.variant ?? "",
  );
  if (!vehicle) {
    return NextResponse.json({ error: "unknown_vehicle" }, { status: 404 });
  }
  if (parsed.value.part) {
    return NextResponse.json({ fitment: checkFitment(vehicle, parsed.value.part) });
  }
  return NextResponse.json({
    vehicle: vehicle.id,
    engine: vehicle.engine_code,
    market: vehicle.market,
    schedule:
      parsed.value.km != null
        ? nextService(vehicle, parsed.value.km)
        : vehicle.services.map((item) => ({ ...item, km_left: null, months_left: null })),
  });
}

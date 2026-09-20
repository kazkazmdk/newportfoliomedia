import { NextResponse } from "next/server";
import { checkFitment, getVehicle, nextService } from "@penta/autospec";
import { readJsonBody } from "@/lib/read-json";
import { limited, recordEvent, requireKey } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-autospec", 40);
  if (blocked) return blocked;
  const auth = requireKey(request, "read:engine");
  if (!auth.ok) return auth.response;
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
  if (!vehicle) return NextResponse.json({ error: "unknown_vehicle" }, { status: 404 });
  recordEvent({
    name: "api_called",
    site: "autospec",
    entityId: vehicle.id,
    path: "/api/v1/autospec/vehicle",
    properties: { keyId: auth.key.id },
  });
  if (parsed.value.part) {
    return NextResponse.json({ fitment: checkFitment(vehicle, parsed.value.part), meter: { calls: auth.meter.calls, price: null } });
  }
  return NextResponse.json({
    vehicle: vehicle.id,
    engine: vehicle.engine_code,
    market: vehicle.market,
    schedule:
      parsed.value.km != null
        ? nextService(vehicle, parsed.value.km)
        : vehicle.services.map((item) => ({ ...item, km_left: null, months_left: null })),
    meter: { calls: auth.meter.calls, price: null },
  });
}

import { NextResponse } from "next/server";
import { checkFitment, getVehicle, nextService } from "@penta/autospec";

export async function POST(request: Request) {
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
    schedule: nextService(vehicle, body.km ?? 0, 12),
  });
}

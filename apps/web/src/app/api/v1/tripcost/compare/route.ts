import { NextResponse } from "next/server";
import { compareRoute, getRoute } from "@penta/tripcost";
import { readJsonBody } from "@/lib/read-json";
import { limited, recordEvent, requireKey } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-tripcost", 40);
  if (blocked) return blocked;
  const auth = requireKey(request, "read:engine");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{
    origin?: string;
    destination?: string;
    travellers?: number;
    true_cost?: boolean;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const route = getRoute(parsed.value.origin ?? "", parsed.value.destination ?? "");
  if (!route) return NextResponse.json({ error: "unknown_route" }, { status: 404 });
  const result = compareRoute(route, parsed.value.travellers ?? 1, parsed.value.true_cost ?? false);
  recordEvent({
    name: "api_called",
    site: "tripcost",
    entityId: route.id,
    path: "/api/v1/tripcost/compare",
    properties: { keyId: auth.key.id },
  });
  return NextResponse.json({ ...result, meter: { calls: auth.meter.calls, price: null } });
}

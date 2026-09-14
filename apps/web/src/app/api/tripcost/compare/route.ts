import { NextResponse } from "next/server";
import { compareRoute, getRoute } from "@penta/tripcost";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/read-json";

export async function POST(request: Request) {
  const limited = rateLimit(`tripcost:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const parsed = await readJsonBody<{
    origin?: string;
    destination?: string;
    travellers?: number;
    true_cost?: boolean;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const route = getRoute(parsed.value.origin ?? "", parsed.value.destination ?? "");
  if (!route) return NextResponse.json({ error: "unknown_route" }, { status: 404 });
  return NextResponse.json(compareRoute(route, parsed.value.travellers ?? 1, parsed.value.true_cost ?? false));
}

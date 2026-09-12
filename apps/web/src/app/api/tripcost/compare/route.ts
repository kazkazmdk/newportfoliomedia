import { NextResponse } from "next/server";
import { compareRoute, getRoute } from "@penta/tripcost";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(`tripcost:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = (await request.json()) as {
    origin?: string;
    destination?: string;
    travellers?: number;
    true_cost?: boolean;
  };
  const route = getRoute(body.origin ?? "", body.destination ?? "");
  if (!route) return NextResponse.json({ error: "unknown_route" }, { status: 404 });
  return NextResponse.json(compareRoute(route, body.travellers ?? 1, body.true_cost ?? false));
}

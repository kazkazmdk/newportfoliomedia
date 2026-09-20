import { NextResponse } from "next/server";
import { meterView } from "@penta/platform-api";
import { readStore } from "@/lib/platform-store";
import { limited, requireKey } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-meter", 40);
  if (blocked) return blocked;
  const auth = requireKey(request, "read:engine");
  if (!auth.ok) return auth.response;
  const buckets = readStore().meter.filter((row) => row.keyId === auth.key.id).map(meterView);
  return NextResponse.json({
    keyId: auth.key.id,
    site: auth.key.site,
    buckets,
    rateCard: null,
    price: null,
  });
}

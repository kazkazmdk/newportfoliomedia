import { NextResponse } from "next/server";
import { monetizationReadiness } from "@/lib/readiness";
import { limited } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-readiness", 20);
  if (blocked) return blocked;
  return NextResponse.json(monetizationReadiness());
}

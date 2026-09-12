import { NextResponse } from "next/server";
import { fullOpsPayload } from "@penta/catalog";

export async function GET() {
  return NextResponse.json(fullOpsPayload());
}

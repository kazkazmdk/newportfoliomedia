import { NextResponse } from "next/server";
import { launchReport } from "@penta/catalog";

export async function GET() {
  return NextResponse.json(launchReport());
}

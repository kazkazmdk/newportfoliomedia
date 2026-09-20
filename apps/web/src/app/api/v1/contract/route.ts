import { NextResponse } from "next/server";
import { contractManifest } from "@penta/platform-api";

export async function GET() {
  return NextResponse.json(contractManifest());
}

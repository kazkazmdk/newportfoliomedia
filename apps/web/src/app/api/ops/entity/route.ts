import { NextResponse } from "next/server";
import { entityInspector, pageExplainability, buildCatalog } from "@penta/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const pageUrl = url.searchParams.get("url");
  if (pageUrl) {
    const page = [...buildCatalog().pages.values()].find((row) => row.url === pageUrl);
    if (!page) return NextResponse.json({ error: "unknown_page" }, { status: 404 });
    return NextResponse.json(pageExplainability(page));
  }
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const row = entityInspector(id);
  if (!row) return NextResponse.json({ error: "unknown_entity" }, { status: 404 });
  return NextResponse.json(row);
}

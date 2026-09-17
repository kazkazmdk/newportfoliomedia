import { buildCatalog } from "@penta/catalog";
import {
  SITEMAP_SEGMENT_IDS,
  absoluteSitemapLoc,
  parseSitemapSegmentId,
  sitemapSegmentPages,
  urlsetXml,
} from "@penta/publishing-core";

export function generateStaticParams() {
  return [
    ...SITEMAP_SEGMENT_IDS.map((id) => ({ id })),
    ...SITEMAP_SEGMENT_IDS.map((id) => ({ id: `${id}.xml` })),
  ];
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!parseSitemapSegmentId(id)) {
    return new Response("Not found", { status: 404 });
  }
  const pages = sitemapSegmentPages([...buildCatalog().pages.values()], id);
  const xml = urlsetXml(
    pages.map((page) => ({
      loc: absoluteSitemapLoc(page.canonical),
      lastmod: page.freshness || undefined,
    })),
  );
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

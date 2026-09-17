import {
  SITEMAP_SEGMENT_IDS,
  absoluteSitemapLoc,
  globalNoindex,
  sitemapIndexXml,
  urlsetXml,
} from "@penta/publishing-core";

export function GET() {
  if (globalNoindex()) {
    return new Response(urlsetXml([]), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
  const xml = sitemapIndexXml(SITEMAP_SEGMENT_IDS.map((id) => absoluteSitemapLoc(`/sitemaps/${id}.xml`)));
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

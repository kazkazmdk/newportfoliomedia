import { SITEMAP_SEGMENT_IDS, globalNoindex } from "@penta/publishing-core";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (globalNoindex()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/ops", "/api/", "/fixcode/diagnose", "/autospec/garage", "/wearthere/trip", "/chargematch/kit", "/tripcost/compare"],
    },
    sitemap: ["/sitemap.xml", "/sitemaps.xml", ...SITEMAP_SEGMENT_IDS.map((id) => `/sitemaps/${id}.xml`)],
  };
}

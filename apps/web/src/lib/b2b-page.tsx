import { pageMeta } from "@/lib/seo";
import { b2bPage, type B2BSurface } from "@/lib/b2b-catalog";
import { B2BSurface as Surface } from "@/components/b2b-surface";
import type { SiteId } from "@penta/monetization";

export function b2bMetadata(site: SiteId, surface: B2BSurface) {
  const page = b2bPage(site, surface);
  return pageMeta({
    title: page.title,
    description: page.lede,
    canonical: `/${site}/${surface}`,
    noindex: true,
  });
}

export function B2BRoute({ site, surface }: { site: SiteId; surface: B2BSurface }) {
  return <Surface page={b2bPage(site, surface)} />;
}

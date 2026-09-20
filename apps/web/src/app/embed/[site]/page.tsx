import { notFound } from "next/navigation";
import { isSiteId } from "@penta/monetization";
import { pageMeta } from "@/lib/seo";
import { EmbedTool } from "@/components/embed-tool";

export const metadata = pageMeta({
  title: "Penta embed",
  description: "Same-origin product widget. Empty catalogs stay empty.",
  canonical: "/embed",
  noindex: true,
});

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ site: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { site } = await params;
  if (!isSiteId(site)) notFound();
  const query = await searchParams;
  return (
    <main className={`px-embed is-${site}`}>
      <EmbedTool site={site} query={query} />
    </main>
  );
}

import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Widgets · local",
  description: "Widget installations and allowed origins.",
  canonical: "/platform/widgets",
  noindex: true,
});

export default async function PlatformWidgets() {
  const store = repo();
  const boot = await store.bootstrapLocalDev();
  const widgets = await store.listWidgets(boot.org.id);
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">{boot.org.name}</p>
      <h1>Widgets</h1>
      <PlatformNav current="/platform/widgets" />
      {widgets.length === 0 ? (
        <p>No installations. Create one with POST /api/v1/widgets from this local session.</p>
      ) : (
        <pre><code>{JSON.stringify(widgets.map((row) => ({
          id: row.id,
          site: row.site,
          origins: row.allowedOrigins,
          branding: row.brandingMode,
          revokedAt: row.revokedAt,
          script: `/widgets/v1/${row.site}.js?installation=${row.id}`,
        })), null, 2)}</code></pre>
      )}
    </main>
  );
}

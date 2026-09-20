import { periodStart } from "@penta/platform-api";
import { SITES } from "@penta/monetization";
import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Usage · local",
  description: "Org + site API usage. No invented totals.",
  canonical: "/platform/usage",
  noindex: true,
});

export default async function PlatformUsage() {
  const store = repo();
  const boot = await store.bootstrapLocalDev();
  const start = periodStart("month");
  const rows = await Promise.all(
    SITES.map(async (site) => ({
      site,
      api: await store.usage(boot.org.id, site, "api_calls", start),
      widgets: await store.usage(boot.org.id, site, "widget_checks", start),
    })),
  );
  const logs = await store.listRequestLogs(20);
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">Period {start}</p>
      <h1>Usage</h1>
      <PlatformNav current="/platform/usage" />
      {rows.every((row) => row.api.used === 0 && row.widgets.used === 0) ? (
        <p>No metered calls this period.</p>
      ) : (
        <pre><code>{JSON.stringify(rows, null, 2)}</code></pre>
      )}
      <section className="px-b2b-section">
        <h2>Request log</h2>
        {logs.length === 0 ? <p>Empty.</p> : (
          <pre><code>{logs.map((row) => `${row.requestId} ${row.site} ${row.status} ${row.latencyMs}ms`).join("\n")}</code></pre>
        )}
      </section>
    </main>
  );
}

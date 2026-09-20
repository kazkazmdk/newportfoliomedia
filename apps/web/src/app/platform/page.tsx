import { periodStart } from "@penta/platform-api";
import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Penta platform · local dashboard",
  description: "Local-only operator dashboard. No public prices. No invented usage.",
  canonical: "/platform",
  noindex: true,
});

export default async function PlatformHome() {
  const store = repo();
  const boot = await store.bootstrapLocalDev();
  const keys = await store.listKeys(boot.org.id);
  const leads = await store.listLeads();
  const widgets = await store.listWidgets(boot.org.id);
  const logs = await store.listRequestLogs(8);
  const observations = await store.listObservations();
  const entitlement = await store.entitlement(boot.org.id, "chargematch", "api_calls");
  const start = periodStart(entitlement?.period ?? "month");
  const month = await store.usage(boot.org.id, "chargematch", "api_calls", start);
  const errors = logs.filter((row) => row.status >= 400);
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">Local organization · {boot.org.slug}</p>
      <h1>Platform</h1>
      <p className="px-b2b-lede">
        Dev session only. This is not a hosted account. Keys default to engine:read and usage:read.
        A FixCode key cannot call ChargeMatch.
      </p>
      <PlatformNav current="/platform" />
      <ul className="px-b2b-section">
        <li>Keys: {keys.length}</li>
        <li>ChargeMatch month usage: {month.used}{entitlement ? ` / ${entitlement.limit}` : ""}</li>
        <li>Leads stored: {leads.length} (unassigned unless a contracted partner exists)</li>
        <li>Widget installations: {widgets.length}</li>
        <li>Observations: {observations.length}</li>
      </ul>
      <section className="px-b2b-section">
        <h2>Recent requests</h2>
        {logs.length === 0 ? <p>No API calls recorded yet.</p> : (
          <pre><code>{logs.map((row) => `${row.timestamp} ${row.site} ${row.route} ${row.status}`).join("\n")}</code></pre>
        )}
      </section>
      <section className="px-b2b-section">
        <h2>Recent errors</h2>
        {errors.length === 0 ? <p>No recorded API errors.</p> : (
          <pre><code>{errors.map((row) => `${row.status} ${row.route} ${row.errorCode ?? ""}`).join("\n")}</code></pre>
        )}
      </section>
    </main>
  );
}

import { publicLeadView } from "@penta/platform-data";
import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Leads · local",
  description: "Stored leads. Unassigned until a contracted partner exists.",
  canonical: "/platform/leads",
  noindex: true,
});

export default async function PlatformLeads() {
  const store = repo();
  await store.bootstrapLocalDev();
  const leads = (await store.listLeads()).map(publicLeadView);
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">Local intake</p>
      <h1>Leads</h1>
      <PlatformNav current="/platform/leads" />
      {leads.length === 0 ? (
        <p>No leads stored. Partner network is empty, so any future row stays UNASSIGNED.</p>
      ) : (
        <pre><code>{JSON.stringify(leads, null, 2)}</code></pre>
      )}
    </main>
  );
}

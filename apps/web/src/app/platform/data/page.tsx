import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Data requests · local",
  description: "Observations and license inquiries. Nothing is sold as official.",
  canonical: "/platform/data",
  noindex: true,
});

export default async function PlatformData() {
  const store = repo();
  await store.bootstrapLocalDev();
  const observations = await store.listObservations();
  const licenseLeads = (await store.listLeads()).filter((row) => row.kind === "data_license");
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">USER_REPORTED stays USER_REPORTED</p>
      <h1>Data requests</h1>
      <PlatformNav current="/platform/data" />
      <p>License inquiries: {licenseLeads.length}. No export job runs without a signed license.</p>
      {observations.length === 0 ? (
        <p>No observations yet.</p>
      ) : (
        <pre><code>{JSON.stringify(observations.map((row) => ({
          id: row.id,
          site: row.site,
          kind: row.kind,
          state: row.state,
          sourceType: row.sourceType,
          note: row.moderatorNote,
        })), null, 2)}</code></pre>
      )}
    </main>
  );
}

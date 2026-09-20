import { contractManifest } from "@penta/platform-api";
import { postgresReady } from "@penta/platform-data";
import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "Settings · local",
  description: "Local tenancy and persistence adapter.",
  canonical: "/platform/settings",
  noindex: true,
});

export default async function PlatformSettings() {
  const boot = await repo().bootstrapLocalDev();
  const manifest = contractManifest();
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">Local auth only</p>
      <h1>Settings</h1>
      <PlatformNav current="/platform/settings" />
      <pre><code>{JSON.stringify({
        organization: boot.org,
        user: { id: boot.user.id, kind: boot.user.kind, email: boot.user.email },
        role: boot.membership.role,
        persistence: postgresReady() ? "postgres" : "dev_fallback",
        publicSiteLive: process.env.PUBLIC_SITE_LIVE === "true",
        billing: manifest.billing,
        sla: manifest.sla,
        authBlocker: "No external identity provider is configured. Local actor only.",
      }, null, 2)}</code></pre>
    </main>
  );
}

import { publicKeyView } from "@penta/platform-api";
import { pageMeta } from "@/lib/seo";
import { repo } from "@/lib/platform-store";
import { LocalKeyForm } from "@/components/local-key-form";
import { PlatformNav } from "@/components/platform-nav";

export const metadata = pageMeta({
  title: "API keys · local",
  description: "Create hashed local keys. Secret shown once.",
  canonical: "/platform/keys",
  noindex: true,
});

export default async function PlatformKeys() {
  const store = repo();
  const boot = await store.bootstrapLocalDev();
  const keys = (await store.listKeys(boot.org.id)).map(publicKeyView);
  return (
    <main className="px-b2b is-platform">
      <p className="px-b2b-kicker">{boot.org.name}</p>
      <h1>API keys</h1>
      <PlatformNav current="/platform/keys" />
      <p>Default scopes are engine:read and usage:read. The raw token is shown once.</p>
      <LocalKeyForm site="chargematch" />
      {keys.length === 0 ? <p>No keys yet.</p> : (
        <pre><code>{JSON.stringify(keys, null, 2)}</code></pre>
      )}
    </main>
  );
}

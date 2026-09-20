import { isSiteId } from "@penta/monetization";
import { authorize, publicKeyView, type KeyScope } from "@penta/platform-api";
import { readJsonBody } from "@/lib/read-json";
import { localDevActor } from "@/lib/dev-session";
import { repo } from "@/lib/platform-store";
import { fail, limited, ok, recordEvent, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-keys-get", 30);
  if (blocked) return blocked;
  const store = repo();
  await store.bootstrapLocalDev();
  const keys = await store.listKeys();
  const auth = authorize(keys, request, "keys:manage");
  if (auth.ok) {
    const site = inferSite(request);
    return ok(request, {
      keys: keys
        .filter((row) => row.organizationId === auth.key.organizationId && (!site || row.site === site))
        .map(publicKeyView),
      rateCard: null,
    });
  }
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Key listing requires a session or keys:manage.", requestIdOf(request));
  return ok(request, { keys: (await store.listKeys(actor.org.id)).map(publicKeyView), rateCard: null, billing: null });
}

export async function POST(request: Request) {
  const blocked = limited(request, "v1-keys", 10);
  if (blocked) return blocked;
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Public key creation is disabled. Use the local dashboard or a keys:manage bearer.", requestIdOf(request));
  const parsed = await readJsonBody<{ site?: string; label?: string; scopes?: string[] }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, requestIdOf(request));
  if (!parsed.value.site || !isSiteId(parsed.value.site)) return fail("invalid_request", "unknown_site", requestIdOf(request));
  const issued = await repo().createKey({
    organizationId: actor.org.id,
    site: parsed.value.site,
    environment: "development",
    label: parsed.value.label ?? `${parsed.value.site} local`,
    scopes: parsed.value.scopes as KeyScope[] | undefined,
  });
  await recordEvent({ name: "key_created", site: issued.record.site, properties: { keyId: issued.record.id } });
  await repo().addAudit("key.create", actor.user.id, issued.record.id);
  return ok(request, {
    key: publicKeyView(issued.record),
    token: issued.token,
    shownOnce: true,
    rateCard: null,
    billing: null,
    message: "Secret shown once. Default scopes are engine:read and usage:read.",
  });
}

function inferSite(request: Request) {
  const site = new URL(request.url).searchParams.get("site");
  return site && isSiteId(site) ? site : undefined;
}

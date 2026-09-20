import { authorize, periodStart } from "@penta/platform-api";
import { repo } from "@/lib/platform-store";
import { fail, limited, ok, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-meter", 40);
  if (blocked) return blocked;
  const store = repo();
  await store.bootstrapLocalDev();
  const auth = authorize(await store.listKeys(), request, "usage:read");
  if (!auth.ok) return fail(auth.error, auth.message, requestIdOf(request));
  const entitlement = await store.entitlement(auth.key.organizationId, auth.key.site, "api_calls");
  const start = periodStart(entitlement?.period ?? "month");
  const usage = await store.usage(auth.key.organizationId, auth.key.site, "api_calls", start);
  return ok(request, {
    keyId: auth.key.id,
    site: auth.key.site,
    organizationId: auth.key.organizationId,
    usage,
    entitlement: entitlement ? { limit: entitlement.limit, period: entitlement.period, feature: entitlement.feature } : null,
    rateCard: null,
    price: null,
  });
}

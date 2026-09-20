import { isSiteId } from "@penta/monetization";
import { consumeQuota, periodStart } from "@penta/platform-api";
import { assertWidgetAccess } from "@penta/platform-data";
import { repo } from "@/lib/platform-store";
import { fail, limited, ok, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-widget-check", 60);
  if (blocked) return blocked;
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation") ?? "";
  const site = url.searchParams.get("site") ?? "";
  if (!isSiteId(site)) return fail("invalid_request", "unknown_site", requestIdOf(request));
  const origin = request.headers.get("origin") ?? url.searchParams.get("origin") ?? "";
  const store = repo();
  const access = assertWidgetAccess(await store.getWidget(installationId), { site, origin });
  if (!access.ok) return fail(access.code, access.message, requestIdOf(request), { origin });
  const entitlement = await store.entitlement(access.widget.organizationId, site, "widget_checks");
  const start = periodStart(entitlement?.period ?? "month");
  const current = await store.usage(access.widget.organizationId, site, "widget_checks", start);
  const quota = consumeQuota({ entitlement, used: current.used });
  if (!quota.ok) {
    return fail("quota_exceeded", "Monthly widget entitlement exhausted.", requestIdOf(request), {
      site,
      limit: quota.limit,
      used: quota.used,
    });
  }
  await store.incrementUsage(access.widget.organizationId, site, "widget_checks", start, 1);
  const day = new Date().toISOString().slice(0, 10);
  await store.incrementWidgetUsage(access.widget.id, day);
  return ok(request, {
    ok: true,
    installation: access.widget.id,
    site: access.widget.site,
    brandingMode: access.widget.brandingMode,
    remaining: quota.remaining,
  });
}

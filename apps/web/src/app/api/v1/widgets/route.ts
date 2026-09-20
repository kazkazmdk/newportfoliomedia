import { isSiteId } from "@penta/monetization";
import { newWidgetId, widgetPublicKey, type WidgetInstallation } from "@penta/platform-data";
import { readJsonBody } from "@/lib/read-json";
import { localDevActor } from "@/lib/dev-session";
import { repo } from "@/lib/platform-store";
import { fail, limited, ok, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Widget listing requires local session.", requestIdOf(request));
  return ok(request, { widgets: await repo().listWidgets(actor.org.id) });
}

export async function POST(request: Request) {
  const blocked = limited(request, "v1-widgets", 10);
  if (blocked) return blocked;
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Widget creation requires local session.", requestIdOf(request));
  const parsed = await readJsonBody<{
    site?: string;
    name?: string;
    origins?: string[];
    brandingMode?: "BRANDED" | "UNBRANDED";
    theme?: string;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, requestIdOf(request));
  if (!parsed.value.site || !isSiteId(parsed.value.site)) return fail("invalid_request", "unknown_site", requestIdOf(request));
  if (parsed.value.brandingMode === "UNBRANDED") {
    const entitlement = await repo().entitlement(actor.org.id, parsed.value.site, "unbranded_widget");
    if (!entitlement) return fail("forbidden", "UNBRANDED widgets require an entitlement.", requestIdOf(request));
  }
  const row: WidgetInstallation = {
    id: newWidgetId(),
    organizationId: actor.org.id,
    site: parsed.value.site,
    environment: "development",
    name: parsed.value.name ?? `${parsed.value.site} widget`,
    publicKey: widgetPublicKey(),
    allowedOrigins: parsed.value.origins?.length ? parsed.value.origins : ["http://127.0.0.1:43141", "http://localhost:43141"],
    theme: parsed.value.theme,
    brandingMode: parsed.value.brandingMode ?? "BRANDED",
    features: {},
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };
  await repo().createWidget(row);
  return ok(request, { widget: row, script: `/widgets/v1/${row.site}.js?installation=${row.id}` });
}

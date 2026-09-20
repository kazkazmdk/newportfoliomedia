import type { SiteId } from "@penta/monetization";
import type { WidgetInstallation } from "./repository";

export type WidgetAccess =
  | { ok: true; widget: WidgetInstallation }
  | { ok: false; code: "forbidden" | "wrong_product_key" | "quota_exceeded"; message: string };

export function assertWidgetAccess(
  widget: WidgetInstallation | undefined,
  input: { site: SiteId; origin: string },
): WidgetAccess {
  if (!widget || widget.revokedAt) {
    return { ok: false, code: "forbidden", message: "installation_revoked_or_unknown" };
  }
  if (widget.site !== input.site) {
    return { ok: false, code: "wrong_product_key", message: "installation_site_mismatch" };
  }
  if (!input.origin) {
    return { ok: false, code: "forbidden", message: "origin_required" };
  }
  if (widget.allowedOrigins.length && !widget.allowedOrigins.includes(input.origin)) {
    return { ok: false, code: "forbidden", message: "origin_not_allowed" };
  }
  return { ok: true, widget };
}

export function safeWidgetConfig(input: Record<string, unknown> | undefined) {
  const locale = typeof input?.locale === "string" ? input.locale.slice(0, 12) : "en";
  const theme = input?.theme === "dark" || input?.theme === "light" ? input.theme : "light";
  const compact = input?.compact === true;
  const showCta = input?.showCta !== false;
  const branding = input?.branding === "UNBRANDED" ? "UNBRANDED" : "BRANDED";
  const entityId = typeof input?.entityId === "string" ? input.entityId.slice(0, 80) : undefined;
  return { locale, theme, compact, showCta, branding, entityId };
}

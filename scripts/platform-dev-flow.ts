/**
 * Local demonstrable flow (no Vercel, no public prices).
 *
 *   PENTA_PLATFORM_MEMORY=1 pnpm exec tsx scripts/platform-dev-flow.ts
 */
import { consumeQuota, periodStart, requireProductKey } from "@penta/platform-api";
import { MemoryRepository } from "@penta/platform-data";

function req(token: string) {
  return new Request("http://127.0.0.1/api", { headers: { authorization: `Bearer ${token}` } });
}

const repo = new MemoryRepository();
const { org, user } = await repo.bootstrapLocalDev();
const cm = await repo.createKey({ organizationId: org.id, site: "chargematch", environment: "development", label: "cm" });
const pass = requireProductKey(await repo.listKeys(), req(cm.token), "chargematch", "engine:read");
const cross = requireProductKey(await repo.listKeys(), req(cm.token), "fixcode", "engine:read");
const entitlement = await repo.entitlement(org.id, "chargematch", "api_calls");
const start = periodStart(entitlement?.period ?? "month");
await repo.incrementUsage(org.id, "chargematch", "api_calls", start, 1);
const used = await repo.usage(org.id, "chargematch", "api_calls", start);
const quota = consumeQuota({ entitlement, used: used.used });
const widget = await repo.createWidget({
  id: "wgt_demo",
  organizationId: org.id,
  site: "chargematch",
  environment: "development",
  name: "bench",
  publicKey: "penta_wgt_demo",
  allowedOrigins: ["http://127.0.0.1:43141"],
  brandingMode: "BRANDED",
  features: {},
  createdAt: new Date().toISOString(),
  revokedAt: null,
});
await repo.addObservation({
  id: "obs_demo",
  site: "chargematch",
  kind: "feedback_correct",
  value: "path matched",
  sourceType: "USER_REPORTED",
  state: "RECEIVED",
  createdAt: new Date().toISOString(),
});
await repo.addLead({
  id: "lead_demo",
  site: "chargematch",
  kind: "sales_inquiry",
  state: "UNASSIGNED",
  message: "Need a widget",
  contact: "dev@localhost",
  assignedPartnerId: null,
  consentVersion: "2026-09-20",
  consentTimestamp: new Date().toISOString(),
  privacyNoticeVersion: "2026-09-20",
  retentionUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
  deletedAt: null,
  createdAt: new Date().toISOString(),
});

console.log(
  JSON.stringify(
    {
      organization: org.id,
      user: user.email,
      chargeMatchKeyWorks: pass.ok,
      sameKeyOnFixCode: cross.ok,
      usageSite: used.site,
      quotaOk: quota.ok,
      widgetOrigins: widget.allowedOrigins,
      observations: (await repo.listObservations()).length,
      leads: (await repo.listLeads()).map((row) => ({ id: row.id, state: row.state, partner: row.assignedPartnerId })),
    },
    null,
    2,
  ),
);

import { describe, expect, it } from "vitest";
import { consumeQuota, periodStart, requireProductKey } from "@penta/platform-api";
import { MemoryRepository } from "./memory";
import { importLegacyStore } from "./import-legacy";
import { anonymizeExpiredLeads } from "./retention";
import { assertWidgetAccess } from "./widgets";

function req(token: string) {
  return new Request("http://local/x", { headers: { authorization: `Bearer ${token}` } });
}

describe("tenancy + quota + isolation", () => {
  it("bootstraps a local org and blocks cross-product keys and over-quota calls", async () => {
    const repo = new MemoryRepository();
    const { org } = await repo.bootstrapLocalDev();
    const fc = await repo.createKey({ organizationId: org.id, site: "fixcode", environment: "development", label: "fc", scopes: ["engine:read"] });
    const cm = await repo.createKey({ organizationId: org.id, site: "chargematch", environment: "development", label: "cm", scopes: ["engine:read"] });
    expect(requireProductKey(await repo.listKeys(), req(fc.token), "fixcode", "engine:read").ok).toBe(true);
    expect(requireProductKey(await repo.listKeys(), req(fc.token), "chargematch", "engine:read").ok).toBe(false);
    expect(requireProductKey(await repo.listKeys(), req(cm.token), "autospec", "engine:read").ok).toBe(false);

    const entitlement = await repo.entitlement(org.id, "chargematch", "api_calls");
    expect(entitlement?.organizationId).toBe(org.id);
    const start = periodStart(entitlement?.period ?? "month");
    await repo.incrementUsage(org.id, "chargematch", "api_calls", start, 1);
    const used = await repo.usage(org.id, "chargematch", "api_calls", start);
    expect(used.site).toBe("chargematch");
    expect(used.used).toBe(1);
    const fcUsage = await repo.usage(org.id, "fixcode", "api_calls", start);
    expect(fcUsage.used).toBe(0);
    if (entitlement) {
      entitlement.limit = 1;
      expect(consumeQuota({ entitlement, used: used.used }).ok).toBe(false);
    }
  });

  it("imports a legacy file store without promoting observations", () => {
    const repo = new MemoryRepository();
    const report = importLegacyStore(repo, {
      keys: [{ id: "key_old", site: "tripcost", hash: "abc", prefix: "penta_local_tripcost_x", label: "old", scopes: ["read:engine"], createdAt: "2026-01-01T00:00:00.000Z", revokedAt: null }],
      leads: [{ id: "lead_old", site: "tripcost", kind: "sales_inquiry", state: "STORED_LOCAL", message: "hi", contact: "a@b.c", assignedPartnerId: null, createdAt: "2026-01-01T00:00:00.000Z" }],
      observations: [{ id: "obs_old", site: "fixcode", kind: "feedback_correct", value: "ok", sourceType: "USER_REPORTED", createdAt: "2026-01-01T00:00:00.000Z" }],
    });
    expect(report.keys).toBe(1);
    expect(repo.keys[0].scopes).toEqual(["engine:read"]);
    expect(repo.observations[0].state).toBe("RECEIVED");
    expect(repo.observations[0].sourceType).toBe("USER_REPORTED");
  });

  it("revokes keys and refuses to delete a live key", async () => {
    const repo = new MemoryRepository();
    const { org } = await repo.bootstrapLocalDev();
    const issued = await repo.createKey({ organizationId: org.id, site: "wearthere", environment: "development", label: "w" });
    expect(await repo.deleteKey(issued.record.id)).toBe(false);
    await repo.revokeKey(issued.record.id);
    expect(await repo.deleteKey(issued.record.id)).toBe(true);
  });

  it("shares quota across keys of the same org+site and isolates products", async () => {
    const repo = new MemoryRepository();
    const { org } = await repo.bootstrapLocalDev();
    await repo.createKey({ organizationId: org.id, site: "chargematch", environment: "development", label: "a" });
    await repo.createKey({ organizationId: org.id, site: "chargematch", environment: "development", label: "b" });
    const start = periodStart("month");
    await repo.incrementUsage(org.id, "chargematch", "api_calls", start, 3);
    await repo.incrementUsage(org.id, "fixcode", "api_calls", start, 1);
    expect((await repo.usage(org.id, "chargematch", "api_calls", start)).used).toBe(3);
    expect((await repo.usage(org.id, "fixcode", "api_calls", start)).used).toBe(1);
  });

  it("enforces widget origin allowlist and revocation", async () => {
    const repo = new MemoryRepository();
    const { org } = await repo.bootstrapLocalDev();
    const widget = await repo.createWidget({
      id: "wgt_1",
      organizationId: org.id,
      site: "chargematch",
      environment: "development",
      name: "bench",
      publicKey: "penta_wgt_1",
      allowedOrigins: ["http://127.0.0.1:43141"],
      brandingMode: "BRANDED",
      features: {},
      createdAt: new Date().toISOString(),
      revokedAt: null,
    });
    expect(assertWidgetAccess(widget, { site: "chargematch", origin: "http://127.0.0.1:43141" }).ok).toBe(true);
    expect(assertWidgetAccess(widget, { site: "chargematch", origin: "https://evil.example" }).ok).toBe(false);
    expect(assertWidgetAccess(widget, { site: "fixcode", origin: "http://127.0.0.1:43141" }).ok).toBe(false);
    await repo.revokeWidget(widget.id);
    expect(assertWidgetAccess(await repo.getWidget(widget.id), { site: "chargematch", origin: "http://127.0.0.1:43141" }).ok).toBe(false);
  });

  it("anonymizes expired leads", async () => {
    const repo = new MemoryRepository();
    await repo.addLead({
      id: "lead_old",
      site: "fixcode",
      kind: "service_request",
      state: "UNASSIGNED",
      message: "secret",
      contact: "person@example.test",
      assignedPartnerId: null,
      consentVersion: "2026-09-20",
      consentTimestamp: "2020-01-01T00:00:00.000Z",
      privacyNoticeVersion: "2026-09-20",
      retentionUntil: "2020-02-01T00:00:00.000Z",
      deletedAt: null,
      createdAt: "2020-01-01T00:00:00.000Z",
    });
    expect(await anonymizeExpiredLeads(repo, new Date("2026-09-20"))).toBe(1);
    expect((await repo.listLeads()).length).toBe(0);
  });

  it("moderates observations without promoting them", async () => {
    const repo = new MemoryRepository();
    await repo.addObservation({
      id: "obs_1",
      site: "chargematch",
      kind: "user_measurement",
      value: "unmeasured",
      sourceType: "USER_OBSERVED",
      state: "RECEIVED",
      createdAt: new Date().toISOString(),
    });
    const merged = await repo.moderateObservation("obs_1", "MERGED_AS_SIGNAL", "duplicate signal");
    expect(merged?.state).toBe("MERGED_AS_SIGNAL");
    expect(merged?.sourceType).toBe("USER_OBSERVED");
    expect(merged?.moderatorNote).toBe("duplicate signal");
  });
});

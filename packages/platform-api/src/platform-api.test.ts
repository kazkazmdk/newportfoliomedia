import { describe, expect, it } from "vitest";
import {
  authorize,
  bumpMeter,
  consumeQuota,
  contractManifest,
  defaultDevEntitlement,
  hashToken,
  issueLocalKey,
  LOCAL_SOFT_CAP,
  matchKey,
  MemoryRateLimiter,
  meterView,
  periodStart,
  requireOrganization,
  requireProductAccess,
  requireProductKey,
  requireRole,
  requireUser,
  revokeKey,
} from "./index";

function req(token?: string) {
  return new Request("http://local/test", token ? { headers: { authorization: `Bearer ${token}` } } : undefined);
}

describe("product key isolation", () => {
  it("lets a FixCode key call FixCode and rejects ChargeMatch / AutoSpec", () => {
    const issued = issueLocalKey({ site: "fixcode", label: "fc", scopes: ["engine:read"] });
    const pass = requireProductKey([issued.record], req(issued.token), "fixcode", "engine:read");
    expect(pass.ok).toBe(true);
    const cm = requireProductKey([issued.record], req(issued.token), "chargematch", "engine:read");
    expect(cm.ok).toBe(false);
    if (!cm.ok) {
      expect(cm.status).toBe(403);
      expect(cm.error).toBe("wrong_product_key");
    }
  });

  it("rejects a ChargeMatch key on AutoSpec and a revoked or malformed token", () => {
    const cm = issueLocalKey({ site: "chargematch", label: "cm", scopes: ["engine:read"] });
    const cross = requireProductKey([cm.record], req(cm.token), "autospec", "engine:read");
    expect(cross.ok).toBe(false);
    if (!cross.ok) expect(cross.error).toBe("wrong_product_key");
    const revoked = requireProductKey([revokeKey(cm.record)], req(cm.token), "chargematch", "engine:read");
    expect(revoked.ok).toBe(false);
    if (!revoked.ok) expect(revoked.status).toBe(401);
    const malformed = requireProductKey([cm.record], req("not-a-key"), "chargematch", "engine:read");
    expect(malformed.ok).toBe(false);
    if (!malformed.ok) expect(malformed.status).toBe(401);
  });

  it("denies missing scope with 403", () => {
    const issued = issueLocalKey({ site: "fixcode", label: "read", scopes: ["engine:read"] });
    const denied = requireProductKey([issued.record], req(issued.token), "fixcode", "keys:manage");
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.status).toBe(403);
  });

  it("defaults to engine:read + usage:read only", () => {
    const issued = issueLocalKey({ site: "tripcost", label: "default" });
    expect(issued.record.scopes).toEqual(["engine:read", "usage:read"]);
    expect(issued.record.hash).toBe(hashToken(issued.token));
    expect(matchKey([issued.record], issued.token)?.organizationId).toBe("org_local_dev");
  });
});

describe("legacy authorize still maps scopes", () => {
  it("accepts engine:read via authorize", () => {
    const issued = issueLocalKey({ site: "fixcode", label: "read", scopes: ["engine:read"] });
    expect(authorize([issued.record], req(issued.token), "engine:read").ok).toBe(true);
    expect(authorize([issued.record], req(issued.token), "keys:manage").ok).toBe(false);
  });
});

describe("quota", () => {
  it("allows under and at quota, blocks over, and shares org totals conceptually", () => {
    const entitlement = defaultDevEntitlement("org_a", "chargematch");
    entitlement.limit = 2;
    expect(consumeQuota({ entitlement, used: 0 }).ok).toBe(true);
    expect(consumeQuota({ entitlement, used: 1 }).ok).toBe(true);
    const over = consumeQuota({ entitlement, used: 2 });
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.code).toBe("quota_exceeded");
  });

  it("resets the monthly period between months", () => {
    expect(periodStart("month", new Date("2026-01-31T23:00:00Z"))).toBe("2026-01-01");
    expect(periodStart("month", new Date("2026-02-01T00:00:00Z"))).toBe("2026-02-01");
  });
});

describe("rate limiter + roles + contract", () => {
  it("returns Retry-After semantics and no public prices", () => {
    const limiter = new MemoryRateLimiter();
    expect(limiter.hit("ip:1", 1, 60_000).ok).toBe(true);
    const blocked = limiter.hit("ip:1", 1, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(requireRole("DEVELOPER", "ADMIN").ok).toBe(false);
    expect(requireRole("OWNER", "ADMIN").ok).toBe(true);
    const manifest = contractManifest();
    expect(manifest.billing).toBeNull();
    expect(manifest.sla).toBeNull();
    expect(manifest.errors.codes).toContain("wrong_product_key");
    expect(requireOrganization(null).ok).toBe(false);
    expect(requireUser(null).ok).toBe(false);
    const issued = issueLocalKey({ site: "fixcode", label: "x" });
    expect(requireProductAccess(issued.record, "tripcost").ok).toBe(false);
  });
});

describe("meter stays on the calling product", () => {
  it("records ChargeMatch usage on ChargeMatch, not FixCode", () => {
    const issued = issueLocalKey({ site: "chargematch", label: "meter" });
    const bumped = bumpMeter([], {
      keyId: issued.record.id,
      site: issued.record.site,
      path: "/api/v1/chargematch/compatibility",
    });
    expect(bumped.current.site).toBe("chargematch");
    expect(meterView(bumped.current).price).toBeNull();
    expect(LOCAL_SOFT_CAP).toBeGreaterThan(0);
  });
});

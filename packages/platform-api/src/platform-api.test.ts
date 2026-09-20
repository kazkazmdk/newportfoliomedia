import { describe, expect, it } from "vitest";
import {
  authorize,
  bumpMeter,
  contractManifest,
  hashToken,
  issueLocalKey,
  LOCAL_SOFT_CAP,
  matchKey,
  meterView,
  revokeKey,
} from "./index";

describe("local keys", () => {
  it("issues a hashed local token and never stores the raw secret twice", () => {
    const issued = issueLocalKey({ site: "tripcost", label: "local bench" });
    expect(issued.token.startsWith("penta_local_tripcost_")).toBe(true);
    expect(issued.record.hash).toBe(hashToken(issued.token));
    expect(issued.record.hash).not.toBe(issued.token);
    expect(matchKey([issued.record], issued.token)?.id).toBe(issued.record.id);
    expect(matchKey([revokeKey(issued.record)], issued.token)).toBeUndefined();
  });

  it("authorizes bearer tokens and denies missing scope", () => {
    const issued = issueLocalKey({
      site: "fixcode",
      label: "read only",
      scopes: ["read:engine"],
    });
    const ok = authorize(
      [issued.record],
      new Request("http://local/test", { headers: { authorization: `Bearer ${issued.token}` } }),
      "read:engine",
    );
    expect(ok.ok).toBe(true);
    const denied = authorize(
      [issued.record],
      new Request("http://local/test", { headers: { authorization: `Bearer ${issued.token}` } }),
      "manage:keys",
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.status).toBe(403);
  });
});

describe("meter", () => {
  it("counts calls and publishes no price", () => {
    const issued = issueLocalKey({ site: "chargematch", label: "meter" });
    let buckets = bumpMeter([], {
      keyId: issued.record.id,
      site: "chargematch",
      path: "/api/v1/chargematch/compatibility",
    }).buckets;
    for (let i = 0; i < LOCAL_SOFT_CAP; i++) {
      buckets = bumpMeter(buckets, {
        keyId: issued.record.id,
        site: "chargematch",
        path: "/api/v1/chargematch/compatibility",
      }).buckets;
    }
    const last = bumpMeter(buckets, {
      keyId: issued.record.id,
      site: "chargematch",
      path: "/api/v1/chargematch/compatibility",
    });
    expect(last.exceeded).toBe(true);
    expect(meterView(last.current).price).toBeNull();
  });
});

describe("contract", () => {
  it("exposes engines without a rate card", () => {
    const manifest = contractManifest();
    expect(manifest.version).toBe("v1");
    expect(manifest.billing).toBeNull();
    expect(manifest.rateCard).toBeNull();
    expect(manifest.hosted).toBe("local_only");
    expect(manifest.engines.fixcode.path).toBe("/api/v1/fixcode/diagnose");
  });
});

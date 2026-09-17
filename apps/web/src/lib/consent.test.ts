import { describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  createConsent,
  parseConsentCookie,
  serializeConsentCookie,
} from "./consent";

describe("cookie consent", () => {
  it("creates an explicit versioned choice with essential storage always on", () => {
    expect(createConsent({ analytics: false, preferences: true }, "2026-09-17T00:00:00.000Z")).toEqual({
      necessary: true,
      analytics: false,
      preferences: true,
      version: 1,
      updatedAt: "2026-09-17T00:00:00.000Z",
    });
  });

  it("round-trips the cookie without accepting unrelated values", () => {
    const consent = createConsent({ analytics: true, preferences: false }, "2026-09-17T00:00:00.000Z");
    const serialized = serializeConsentCookie(consent, true);

    expect(parseConsentCookie(`other=x; ${serialized}`)).toEqual(consent);
    expect(parseConsentCookie(`${CONSENT_COOKIE}=not-json`)).toBeNull();
  });

  it("uses a scoped, same-site, secure 180-day cookie in production", () => {
    const serialized = serializeConsentCookie(createConsent({ analytics: false, preferences: false }), true);
    expect(serialized).toContain("Path=/");
    expect(serialized).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`);
    expect(serialized).toContain("SameSite=Lax");
    expect(serialized).toContain("Secure");
  });

  it("rejects stale policy versions and malformed category values", () => {
    const stale = encodeURIComponent(JSON.stringify({
      necessary: true,
      analytics: false,
      preferences: false,
      version: 0,
      updatedAt: "2026-09-17T00:00:00.000Z",
    }));
    expect(parseConsentCookie(`${CONSENT_COOKIE}=${stale}`)).toBeNull();
  });
});

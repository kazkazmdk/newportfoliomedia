import { describe, expect, it } from "vitest";
import { assertInferenceCannotBecomeOfficial } from "@penta/data-provenance";
import {
  affiliateAllowed,
  assertLeadCannotAssign,
  assertNoPublicRateCard,
  assertObservationNotPromoted,
  classifyIntent,
  COMMERCE_SURFACE,
  createLeadDraft,
  createObservation,
  EMPTY_NETWORK_COPY,
  officialOutbound,
  SITES,
  winnerSignal,
} from "./index";

describe("intent", () => {
  it("classifies product decisions without inventing commerce", () => {
    expect(classifyIntent({ path: "/fixcode/samsung/washer/4c" }).kind).toBe("diagnose");
    expect(classifyIntent({ path: "/chargematch/iphone-16/with/anker-100w-2c" }).kind).toBe("check_compatibility");
    expect(classifyIntent({ path: "/tripcost/paris/to/lyon" }).kind).toBe("compare_route");
    expect(classifyIntent({ path: "/autospec/bmw/3-series/g20/330e" }).kind).toBe("inspect_vehicle");
    expect(classifyIntent({ path: "/wearthere/lisbon/10/packing" }).kind).toBe("pack_trip");
    expect(classifyIntent({ path: "/fixcode/developers" }).kind).toBe("operator");
    expect(classifyIntent({ path: "/fixcode/samsung/washer/4c" }).commercial).toBe(false);
  });
});

describe("honesty", () => {
  it("refuses affiliate, shop, prices, and partner assignment", () => {
    expect(affiliateAllowed()).toBe(false);
    for (const site of SITES) {
      expect(COMMERCE_SURFACE[site].shopEnabled).toBe(false);
      expect(COMMERCE_SURFACE[site].pricesPublished).toBe(false);
      expect(COMMERCE_SURFACE[site].inventory).toEqual([]);
      expect(EMPTY_NETWORK_COPY[site].length).toBeGreaterThan(20);
    }
    expect(() => assertNoPublicRateCard(12)).toThrow(/rate card/i);
    const lead = createLeadDraft({
      id: "lead-1",
      site: "fixcode",
      kind: "service_request",
      message: "Washer 4C after drain check",
      contact: "local@example.test",
    });
    expect(lead.assignedPartnerId).toBeNull();
    expect(lead.state).toBe("STORED_LOCAL");
    assertLeadCannotAssign(lead);
    expect(() => assertLeadCannotAssign({ ...lead, assignedPartnerId: "acme" as unknown as null })).toThrow(/partner/i);
  });

  it("keeps user observations below official / tested", () => {
    const row = createObservation({
      id: "obs-1",
      site: "chargematch",
      kind: "user_measurement",
      value: "wall draw not measured here",
    });
    expect(row.sourceType).toBe("USER_OBSERVED");
    expect(() => assertObservationNotPromoted(row, "TESTED")).toThrow();
    expect(() => assertInferenceCannotBecomeOfficial("USER_REPORTED", "MANUFACTURER")).toThrow();
  });

  it("marks official outbound as non-affiliate", () => {
    const link = officialOutbound({
      id: "out-1",
      site: "chargematch",
      href: "https://support.apple.com/en-us/121029",
      label: "iPhone 16 tech specs",
      sourceName: "Apple support",
    });
    expect(link.affiliate).toBe(false);
    expect(link.partnerId).toBeNull();
    expect(() => officialOutbound({
      id: "bad",
      site: "tripcost",
      href: "/paris",
      label: "relative",
      sourceName: "none",
    })).toThrow(/absolute/i);
  });
});

describe("winner signal", () => {
  it("is an internal opportunity ranking, not a market claim", () => {
    const signal = winnerSignal({
      site: "fixcode",
      indexablePages: 12,
      engineApis: 1,
      verifiedFacts: 40,
      localEvents: 3,
      localLeads: 1,
    });
    expect(signal.claim).toBe("internal_opportunity_only");
    expect(signal.score).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";
import { cableMediaOf, chargerMediaOf, deviceMediaOf, hardwareHonesty } from "./hardware-media";

describe("ChargeMatch hardware media", () => {
  it("maps devices to class rasters, never exact product claims", () => {
    expect(deviceMediaOf("iphone-16").representation).toBe("class");
    expect(deviceMediaOf("macbook-air-13-m3").classId).toBe("laptop");
    expect(deviceMediaOf("ipad-pro-m4").hero).toContain("tablet-class");
    expect(hardwareHonesty("class")).toMatch(/class reference/i);
  });

  it("keeps charger and cable media as class references", () => {
    expect(chargerMediaOf(20, 1).classId).toBe("compact");
    expect(chargerMediaOf(100, 2).classId).toBe("multiport");
    expect(cableMediaOf(60).hero).toContain("cable-usbc");
  });
});

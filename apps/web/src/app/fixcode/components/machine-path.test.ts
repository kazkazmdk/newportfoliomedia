import { describe, expect, it } from "vitest";
import { diagnosticPath, zoneFromText } from "./machine-path";

describe("zoneFromText", () => {
  it("maps drain to pump", () => {
    expect(zoneFromText("drain blocked")).toBe("pump");
  });

  it("maps motor to motor", () => {
    expect(zoneFromText("motor will not spin")).toBe("motor");
  });

  it("maps door lock to door", () => {
    expect(zoneFromText("door lock jammed")).toBe("door");
  });

  it("maps heater to heater", () => {
    expect(zoneFromText("heater element open")).toBe("heater");
  });
});

describe("diagnosticPath", () => {
  it("returns distinct geometry for water steps", () => {
    const source = diagnosticPath("source");
    const hose = diagnosticPath("hose");
    const valve = diagnosticPath("valve");
    const control = diagnosticPath("control");
    const paths = new Set([source.d, hose.d, valve.d, control.d]);
    expect(paths.size).toBe(4);
    expect(control.kind).toBe("signal");
    expect(source.kind).toBe("water");
  });
});

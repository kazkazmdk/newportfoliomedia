import { describe, expect, it } from "vitest";
import { coordOf, corridorKind, greatCircle } from "./geo";

describe("TripCost geography", () => {
  it("uses real city coordinates", () => {
    const paris = coordOf("paris");
    const lyon = coordOf("lyon");
    expect(paris?.lat).toBeGreaterThan(48);
    expect(paris?.lon).toBeGreaterThan(2);
    expect(lyon?.lat).toBeGreaterThan(45);
  });

  it("does not label a corridor as a road route", () => {
    expect(corridorKind("car").label).toBe("Connection corridor");
    expect(corridorKind("car").label).not.toMatch(/road route/i);
    expect(corridorKind("car").note).toMatch(/not a road route/i);
    expect(corridorKind("flight").label).toBe("Great-circle overview");
  });

  it("draws a spherical arc between known cities", () => {
    const line = greatCircle({ lat: 48.8566, lon: 2.3522 }, { lat: 45.764, lon: 4.8357 }, 8);
    expect(line.length).toBeGreaterThan(4);
    expect(line[0][0]).toBeCloseTo(2.3522, 3);
  });
});

import { describe, expect, it } from "vitest";
import {
  destinationSeasonMedia,
  seasonOfMonth,
  seasonProfileOf,
  seasonalMediaCoverage,
} from "./media-catalog";

describe("WearThere seasonal architecture", () => {
  it("does not class Sydney January as winter", () => {
    expect(seasonProfileOf("sydney")).toBe("southern-temperate");
    expect(seasonOfMonth(1, seasonProfileOf("sydney"))).toBe("summer");
    expect(seasonOfMonth(1, "northern-temperate")).toBe("winter");
  });

  it("does not force tropical destinations into temperate seasons", () => {
    expect(seasonProfileOf("singapore")).toBe("tropical");
    expect(["wet", "dry", "humid"]).toContain(seasonOfMonth(1, seasonProfileOf("singapore")));
  });

  it("reports coverage without inventing four images per city", () => {
    const rows = seasonalMediaCoverage();
    expect(rows.length).toBeGreaterThan(5);
    const sydney = rows.find((row) => row.destination === "sydney");
    expect(sydney?.seasonProfile).toBe("southern-temperate");
    expect(sydney?.hemisphere).toBe("south");
  });

  it("maps tropical / desert / southern scenes away from the Tokyo rain fallback", () => {
    expect(destinationSeasonMedia("singapore", 7).hero).not.toContain("tokyo-rain");
    expect(destinationSeasonMedia("dubai", 7).hero).toContain("dubai");
    expect(destinationSeasonMedia("sydney", 1).hero).toContain("sydney");
  });
});

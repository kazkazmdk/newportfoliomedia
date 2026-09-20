import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classifyIntent } from "@penta/monetization";
import { contractManifest } from "@penta/platform-api";

describe("indexation isolation", () => {
  it("does not import opportunityScore into the index recompute path", () => {
    const source = readFileSync("packages/catalog/src/index-recompute.ts", "utf8");
    expect(source).not.toMatch(/opportunityScore/);
    expect(source).not.toMatch(/monetization_potential/);
    expect(source).not.toMatch(/affiliate/);
    expect(source).not.toMatch(/revenue/);
    expect(source).not.toMatch(/partner/);
    expect(source).not.toMatch(/@penta\/platform-data/);
    expect(source).not.toMatch(/@penta\/monetization/);
    expect(source).not.toMatch(/lead value/i);
    expect(source).not.toMatch(/widget_install/);
  });

  it("keeps the v1 contract unpaid and local", () => {
    const manifest = contractManifest();
    expect(manifest.billing).toBeNull();
    expect(manifest.rateCard).toBeNull();
    expect(["dev_fallback", "postgres_when_configured"]).toContain(manifest.hosted);
  });

  it("does not treat operator surfaces as product decisions", () => {
    expect(classifyIntent({ path: "/chargematch/business" }).kind).toBe("operator");
    expect(classifyIntent({ path: "/tripcost/paris/to/lyon" }).kind).toBe("compare_route");
  });
});

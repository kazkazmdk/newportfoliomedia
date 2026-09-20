import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classifyIntent } from "@penta/monetization";
import { contractManifest } from "@penta/platform-api";

describe("indexation isolation", () => {
  it("does not import opportunityScore into the index recompute path", () => {
    const source = readFileSync("packages/catalog/src/index-recompute.ts", "utf8");
    expect(source).not.toMatch(/opportunityScore/);
    expect(source).not.toMatch(/monetization_potential/);
  });

  it("keeps the v1 contract unpaid and local", () => {
    const manifest = contractManifest();
    expect(manifest.billing).toBeNull();
    expect(manifest.rateCard).toBeNull();
    expect(manifest.hosted).toBe("local_only");
  });

  it("does not treat operator surfaces as product decisions", () => {
    expect(classifyIntent({ path: "/chargematch/business" }).kind).toBe("operator");
    expect(classifyIntent({ path: "/tripcost/paris/to/lyon" }).kind).toBe("compare_route");
  });
});

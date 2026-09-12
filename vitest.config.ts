import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@penta/data-provenance": path.resolve("packages/data-provenance/src/index.ts"),
      "@penta/graph-core": path.resolve("packages/graph-core/src/index.ts"),
      "@penta/quality-gate": path.resolve("packages/quality-gate/src/index.ts"),
      "@penta/publishing-core": path.resolve("packages/publishing-core/src/index.ts"),
      "@penta/ai-core": path.resolve("packages/ai-core/src/index.ts"),
      "@penta/analytics": path.resolve("packages/analytics/src/index.ts"),
      "@penta/ui-primitives": path.resolve("packages/ui-primitives/src/index.ts"),
      "@penta/catalog": path.resolve("packages/catalog/src/index.ts"),
      "@penta/fixcode": path.resolve("apps/fixcode/src/index.ts"),
      "@penta/autospec": path.resolve("apps/autospec/src/index.ts"),
      "@penta/wearthere": path.resolve("apps/wearthere/src/index.ts"),
      "@penta/chargematch": path.resolve("apps/chargematch/src/index.ts"),
      "@penta/tripcost": path.resolve("apps/tripcost/src/index.ts"),
    },
  },
});

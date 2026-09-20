import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "tests/**/*.test.ts"],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false,
  },
  resolve: {
    alias: [
      { find: "@penta/demand/import", replacement: path.resolve("packages/demand/src/import.ts") },
      { find: "@penta/demand", replacement: path.resolve("packages/demand/src/index.ts") },
      { find: "@penta/data-provenance", replacement: path.resolve("packages/data-provenance/src/index.ts") },
      { find: "@penta/graph-core", replacement: path.resolve("packages/graph-core/src/index.ts") },
      { find: "@penta/quality-gate", replacement: path.resolve("packages/quality-gate/src/index.ts") },
      { find: "@penta/publishing-core", replacement: path.resolve("packages/publishing-core/src/index.ts") },
      { find: "@penta/ai-core", replacement: path.resolve("packages/ai-core/src/index.ts") },
      { find: "@penta/analytics", replacement: path.resolve("packages/analytics/src/index.ts") },
      { find: "@penta/monetization", replacement: path.resolve("packages/monetization/src/index.ts") },
      { find: "@penta/platform-api", replacement: path.resolve("packages/platform-api/src/index.ts") },
      { find: "@penta/ui-primitives", replacement: path.resolve("packages/ui-primitives/src/index.ts") },
      { find: "@penta/catalog", replacement: path.resolve("packages/catalog/src/index.ts") },
      { find: "@penta/fixcode", replacement: path.resolve("apps/fixcode/src/index.ts") },
      { find: "@penta/autospec", replacement: path.resolve("apps/autospec/src/index.ts") },
      { find: "@penta/wearthere", replacement: path.resolve("apps/wearthere/src/index.ts") },
      { find: "@penta/chargematch", replacement: path.resolve("apps/chargematch/src/index.ts") },
      { find: "@penta/tripcost", replacement: path.resolve("apps/tripcost/src/index.ts") },
    ],
  },
});

import { resolve } from "node:path";
import { importDemandDir } from "@penta/demand/import";

const root = resolve(process.cwd(), process.argv[2] ?? "data/demand");
const result = importDemandDir(root);

if (result.rejected.length) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        root,
        accepted_evidence: result.evidence.length,
        accepted_serp: result.serp.length,
        rejected: result.rejected,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      root,
      evidence: result.evidence.length,
      serp: result.serp.length,
      sources: Object.fromEntries(
        [...new Set(result.evidence.map((row) => row.source))].map((source) => [
          source,
          result.evidence.filter((row) => row.source === source).length,
        ]),
      ),
    },
    null,
    2,
  ),
);

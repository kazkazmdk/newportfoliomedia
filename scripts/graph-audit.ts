import { writeFileSync } from "node:fs";
import { auditGraph, renderAuditMarkdown } from "@penta/catalog/graph-audit";

const audit = auditGraph();
const path = "docs/DEEP_GRAPH_BASELINE.md";
writeFileSync(path, renderAuditMarkdown(audit), "utf8");
console.log(
  JSON.stringify(
    {
      path,
      entities: audit.entities.total,
      relations: audit.relations.total,
      avg: audit.relations.avg_per_entity,
      decision_per_entity: audit.relations.decision_per_entity,
      indexable: audit.pages.INDEXABLE,
      noindex: audit.pages.NOINDEX_PRODUCT,
      graph_only: audit.pages.GRAPH_ONLY,
      quality_mean: audit.quality.mean,
      quality_min: audit.quality.min,
      pct_ge_90: audit.quality.pct_ge_90,
      gate_suspect: audit.quality.gate_suspect,
    },
    null,
    2,
  ),
);

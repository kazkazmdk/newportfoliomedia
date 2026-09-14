import { auditGraph, renderHealthTable } from "@penta/catalog/graph-audit";

const audit = auditGraph();
console.log(renderHealthTable(audit));
console.log("");
console.log(
  `totals entities=${audit.entities.total} relations=${audit.relations.total} INDEX=${audit.pages.INDEXABLE} NOINDEX=${audit.pages.NOINDEX_PRODUCT} GRAPH_ONLY=${audit.pages.GRAPH_ONLY}`,
);

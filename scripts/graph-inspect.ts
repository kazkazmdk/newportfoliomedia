import { entityInspector } from "@penta/catalog";
import { classifyRelation } from "@penta/graph-core";

const id = process.argv[2];
if (!id) {
  console.error("usage: pnpm exec tsx scripts/graph-inspect.ts <entityId>");
  process.exit(1);
}
const row = entityInspector(id);
if (!row) {
  console.error("unknown entity");
  process.exit(2);
}
console.log(
  JSON.stringify(
    {
      entity: { id: row.entity.id, type: row.entity.type, name: row.entity.name, site: row.entity.site },
      facts: row.entity.properties,
      provenance: row.entity.provenance.map((p) => ({
        sourceType: p.source_type,
        sourceId: p.source_id,
        retrievedAt: p.retrieved_at,
        method: p.verification_method,
      })),
      outbound: row.outgoing.map((r) => ({ type: r.type, to: r.to_id, class: classifyRelation(r) })),
      inbound: row.incoming.map((r) => ({ type: r.type, from: r.from_id, class: classifyRelation(r) })),
      decision: row.decision_relevant.length,
      stale: row.stale.length,
      conflicts: row.conflicts,
      pages: row.pages,
    },
    null,
    2,
  ),
);

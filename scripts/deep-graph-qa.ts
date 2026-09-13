import { writeDeepGraphQa, deepGraphQa } from "@penta/catalog/deep-qa";

const path = writeDeepGraphQa("docs/DEEP_GRAPH_QA.md");
const qa = deepGraphQa();
console.log(
  JSON.stringify(
    {
      ok: true,
      path,
      entities: qa.after.entities,
      relations: qa.after.relations,
      decision_relations: qa.after.decision_relations,
      relations_per_entity: qa.after.relations_per_entity,
      indexable: qa.after.indexable,
      quality_avg: qa.after.quality_avg,
      public_site_live: qa.public_site_live,
    },
    null,
    2,
  ),
);

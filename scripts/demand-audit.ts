import { buildCatalog, resetCatalogCache } from "@penta/catalog";
import { importDemandDir } from "@penta/demand/import";
import { resolve } from "node:path";

resetCatalogCache();
const imported = importDemandDir(resolve(process.cwd(), "data/demand"));
if (imported.rejected.length) {
  console.error(JSON.stringify({ ok: false, rejected: imported.rejected }, null, 2));
  process.exit(1);
}

const store = buildCatalog();
const pages = [...store.pages.values()];
const invented = imported.evidence.filter((row) => row.value != null && row.value < 0);
if (invented.length) {
  console.error("negative demand values are forbidden");
  process.exit(1);
}

const editorialIndexable = pages.filter(
  (page) =>
    page.index_state === "INDEXABLE" &&
    (page.structured_payload.demand_class === "UNKNOWN" || page.seo_validation === "NONE"),
);
if (editorialIndexable.length) {
  console.error("editorial-only INDEXABLE pages", editorialIndexable.map((p) => p.url));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      evidence: imported.evidence.length,
      serp: imported.serp.length,
      indexable: pages.filter((p) => p.index_state === "INDEXABLE").length,
      seo_candidate: pages.filter((p) => p.index_state === "SEO_CANDIDATE").length,
    },
    null,
    2,
  ),
);

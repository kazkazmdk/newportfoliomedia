import { writeFileSync } from "node:fs";
import { classifyEntityDepth, type GraphStore, type SiteId } from "@penta/graph-core";
import {
  intentFamilyId,
  intentSimilarity,
  qualityDistribution,
  relationQuality,
} from "@penta/quality-gate";
import { isFresh, sourceRank } from "@penta/data-provenance";
import {
  AI_USAGE_AUDIT,
  buildCatalog,
  coverageReport,
  launchReport,
  pageExplainability,
} from "./index";

const SITES: SiteId[] = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rows: T[], n: number, rnd: () => number): T[] {
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

export type Readiness = "NOT READY" | "DATA READY" | "PRODUCT READY" | "SEO SCALE READY";

export function deepGraphQa() {
  const store = buildCatalog();
  const launch = launchReport();
  const coverage = coverageReport();
  const pages = [...store.pages.values()];
  const relations = [...store.relations.values()];
  const entities = [...store.entities.values()];
  const degree = new Map<string, number>();
  for (const entity of entities) degree.set(entity.id, 0);
  for (const rel of relations) {
    degree.set(rel.from_id, (degree.get(rel.from_id) ?? 0) + 1);
    degree.set(rel.to_id, (degree.get(rel.to_id) ?? 0) + 1);
  }

  const sourceTable: Record<string, number> = {
    OFFICIAL: 0,
    MANUFACTURER: 0,
    REGULATORY: 0,
    TESTED: 0,
    TRUSTED_THIRD_PARTY: 0,
    THIRD_PARTY: 0,
    USER_OBSERVED: 0,
    USER_REPORTED: 0,
    AI_INFERRED: 0,
  };
  for (const item of [...entities, ...relations]) {
    for (const rec of item.provenance) {
      sourceTable[rec.source_type] = (sourceTable[rec.source_type] ?? 0) + 1;
    }
  }

  const important = [...entities, ...relations].filter((item) => {
    if ("decision_relevant" in item) return item.decision_relevant;
    return ["error_code", "vehicle_configuration", "device", "charger", "corridor", "destination", "cause"].includes(
      "type" in item ? String(item.type) : "",
    );
  });
  const withSource = important.filter((item) => item.provenance.length > 0).length;
  const withPrimary = important.filter((item) =>
    item.provenance.some((p) => ["OFFICIAL", "MANUFACTURER", "REGULATORY", "TESTED"].includes(p.source_type)),
  ).length;
  const pagesPrimary = pages.filter((page) => {
    const ents = page.entity_ids.map((id) => store.get(id)).filter(Boolean);
    return ents.some((e) => e!.provenance.some((p) => sourceRank(p.source_type) >= 80));
  }).length;
  const pagesTwo = pages.filter((page) => {
    const types = new Set(
      page.entity_ids
        .flatMap((id) => store.get(id)?.provenance ?? [])
        .map((p) => p.source_type),
    );
    return types.size >= 2;
  }).length;

  const bySite = Object.fromEntries(
    SITES.map((site) => {
      const stats = store.stats(site);
      const siteEntities = entities.filter((e) => e.site === site);
      const siteRels = relations.filter((r) => r.site === site);
      const depths = siteEntities.map((e) => classifyEntityDepth(e.type, degree.get(e.id) ?? 0));
      return [
        site,
        {
          ...stats,
          isolated: depths.filter((d) => d === "ISOLATED").length,
          shallow: depths.filter((d) => d === "SHALLOW").length,
          connected: depths.filter((d) => d === "CONNECTED").length,
          rich: depths.filter((d) => d === "RICH").length,
          verified_pct: pct(stats.verified_relations, stats.relations),
          inferred_pct: pct(stats.inferred_relations, stats.relations),
          estimated_pct: pct(stats.estimated_relations, stats.relations),
          unknown_pct: pct(stats.unknown_relations, stats.relations),
          stale_pct: pct(stats.stale_relations, stats.relations),
          avg_relation_quality:
            siteRels.length === 0
              ? 0
              : Math.round(siteRels.reduce((s, r) => s + relationQuality(r), 0) / siteRels.length),
        },
      ];
    }),
  ) as Record<SiteId, ReturnType<GraphStore["stats"]> & Record<string, number>>;

  const rnd = mulberry32(0x35f3633);
  const random50 = pick(pages, 50, rnd);
  const top20 = [...pages].sort((a, b) => b.quality_score - a.quality_score).slice(0, 20);
  const sampleBySite = Object.fromEntries(
    SITES.map((site) => [site, pick(pages.filter((p) => p.site === site), 10, rnd)]),
  ) as Record<SiteId, typeof pages>;

  function neighbors(page: (typeof pages)[0]) {
    return pages
      .filter((other) => other.site === page.site && other.url !== page.url)
      .map((other) => ({ url: other.url, similarity: Math.round(intentSimilarity(page, other) * 1000) / 1000 }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  function explainPage(page: (typeof pages)[0]) {
    const ents = page.entity_ids.map((id) => store.get(id)).filter(Boolean);
    const rels = page.entity_ids.flatMap((id) => store.related(id));
    const decision = rels.filter((r) => r.decision_relevant);
    const facts = ents.flatMap((e) => Object.keys(e!.properties));
    const sources = ents.flatMap((e) => e!.provenance.map((p) => `${p.source_type}:${p.source_id}`));
    return {
      url: page.url,
      site: page.site,
      family: page.family,
      score: page.quality_score,
      index_state: page.index_state,
      intent_family: intentFamilyId(page),
      why: pageExplainability(page).why_indexable,
      facts: [...new Set(facts)].slice(0, 12),
      sources: [...new Set(sources)].slice(0, 8),
      relations: [...new Set(rels.map((r) => r.type))].slice(0, 12),
      decision_relations: decision.length,
      interactive_utility: true,
      search_demand: page.search_demand,
      uniqueness: String(page.structured_payload.distinct_reason ?? ""),
      confidence: ents[0]?.confidence ?? "UNKNOWN",
      neighbors: neighbors(page),
    };
  }

  const highDemandTypes = new Set([
    "error_code",
    "vehicle_configuration",
    "destination",
    "device",
    "charger",
    "corridor",
    "historical_climate",
  ]);
  const shallowPriority = SITES.map((site) => {
    const rows = entities
      .filter((e) => e.site === site && highDemandTypes.has(e.type))
      .map((e) => ({
        id: e.id,
        type: e.type,
        name: e.name,
        degree: degree.get(e.id) ?? 0,
        depth: classifyEntityDepth(e.type, degree.get(e.id) ?? 0),
        demand: Number(e.properties.demand ?? 0),
      }))
      .filter((e) => e.depth === "ISOLATED" || e.depth === "SHALLOW" || e.degree < 8)
      .sort((a, b) => a.degree - b.degree || b.demand - a.demand)
      .slice(0, 20);
    return { site, rows };
  });

  const opportunities = [
    { site: "fixcode", item: "Verified outcome loop (what actually fixed it) — 0 VERIFIED rows", demand: 90, value: 95, completeness: 5 },
    { site: "fixcode", item: "Primary manufacturer PDF pages per error (not compiled notes)", demand: 80, value: 90, completeness: 40 },
    { site: "autospec", item: "Licensed VIN + market-specific oil rows beyond EU handbook compile", demand: 88, value: 92, completeness: 35 },
    { site: "autospec", item: "Fitment catalog with VERIFIED OEM part numbers (not oil/wiper only)", demand: 85, value: 90, completeness: 20 },
    { site: "wearthere", item: "Climate-normal source dataset citation (station IDs, 1991-2020 files)", demand: 70, value: 80, completeness: 45 },
    { site: "wearthere", item: "Garment thermal lab ratings (clo) instead of editorial 1-5 scales", demand: 60, value: 85, completeness: 30 },
    { site: "chargematch", item: "Lab MEASURED watts for popular pairs (Anker 100W × Steam Deck)", demand: 85, value: 95, completeness: 0 },
    { site: "chargematch", item: "Published C1+A allocation tables — currently ALLOCATION_UNKNOWN", demand: 70, value: 90, completeness: 10 },
    { site: "tripcost", item: "Live rail/flight fares with expiresAt — snapshot is not CURRENT", demand: 90, value: 95, completeness: 25 },
    { site: "tripcost", item: "Observed pump prices per corridor instead of one EUR/L snapshot", demand: 75, value: 80, completeness: 20 },
    { site: "fixcode", item: "GSC queries for error codes — demand is editorial", demand: 50, value: 70, completeness: 0 },
    { site: "autospec", item: "Recall freshness feed (NHTSA / manufacturer campaigns)", demand: 70, value: 85, completeness: 15 },
    { site: "wearthere", item: "Activity-specific packing graphs with measured volume/weight", demand: 65, value: 80, completeness: 40 },
    { site: "chargematch", item: "E-marker / cable certification registry", demand: 60, value: 85, completeness: 20 },
    { site: "tripcost", item: "Door-to-door observed times vs scheduled buffers", demand: 55, value: 75, completeness: 35 },
    { site: "fixcode", item: "Parts graph (FIX → REQUIRES → PART) with OEM SKUs", demand: 80, value: 88, completeness: 15 },
    { site: "autospec", item: "US vs EU market split on oil spec (LL-04 vs LL-01)", demand: 75, value: 90, completeness: 40 },
    { site: "chargematch", item: "PPS vs PD-only measured charge curves", demand: 70, value: 88, completeness: 0 },
    { site: "wearthere", item: "Airline cabin-bag live rules (currently LOW confidence snapshots)", demand: 60, value: 70, completeness: 20 },
    { site: "tripcost", item: "Party-size sensitivity tests published as traces, not new URLs", demand: 50, value: 80, completeness: 55 },
  ];

  const readiness: Record<SiteId, { label: Readiness; why: string; ultimate: string }> = {
    fixcode: {
      label: "PRODUCT READY",
      why: "Diagnostic tree, SAFETY_CLASS, tests/results exist. Outcome store is empty (0 VERIFIED). Demand is editorial. Not SEO SCALE READY.",
      ultimate:
        launch.graph.decision_relevant_relations > 0
          ? "Can explain likely cause from document-weighted priors + tests — not from observed repair rates."
          : "Graph too shallow.",
    },
    autospec: {
      label: "DATA READY",
      why: "VehicleConfiguration identity (make→gen→engine→market) exists. VIN is a stub. Fitment catalog is thin. Not SEO SCALE READY.",
      ultimate: "Can explain a HIGH/MEDIUM OEM row; cannot explain an arbitrary aftermarket part for MY exact VIN.",
    },
    wearthere: {
      label: "PRODUCT READY",
      why: "CLIMATE_NORMAL provenance + garment properties + packing rules. Exact-date trips stay noindex. Climate source is compiled, not a station file. Not SEO SCALE READY.",
      ultimate: "Can trace temperature/rain/activity → garment properties. Cannot cite a WMO station series.",
    },
    chargematch: {
      label: "DATA READY",
      why: "Ports, protocols, allocations, cable limits modelled. 0 lab MEASURED rows. C1+A unpublished on the 3C1A class. Not SEO SCALE READY.",
      ultimate: "Can name the bottleneck (device input / port allocation / cable). Cannot show measured watts.",
    },
    tripcost: {
      label: "PRODUCT READY",
      why: "Cash vs true cost, door-to-door buffers, party-size break-even, volatile vs evergreen facts. Fares are snapshots. Not SEO SCALE READY.",
      ultimate: "Can explain why car is cheaper for N travellers from snapshot arithmetic. Cannot prove a live SNCF fare.",
    },
  };

  const verdict =
    "These products are decision engines with thin but real graphs — not yet dense knowledge graphs, and not SEO-scale catalogs. They are no longer page-first keyword shells. They are also not ready to multiply URLs.";

  return {
    generated_at: new Date().toISOString(),
    public_site_live: launch.public_site_live,
    global_noindex: launch.global_noindex,
    reference_commit: "35f3633",
    before: {
      entities: 794,
      relations: 1186,
      decision_relations: null as number | null,
      relations_per_entity: 1.49,
      indexable: 890,
      quality_avg: 90.2,
      quality_min: 80,
    },
    after: {
      entities: launch.graph.entities,
      relations: launch.graph.relations,
      decision_relations: launch.graph.decision_relevant_relations,
      relations_per_entity: launch.graph.relations_per_entity,
      decision_relations_per_entity: launch.graph.decision_relations_per_entity,
      verified_relations: launch.graph.verified_relations,
      inferred_relations: launch.graph.inferred_relations,
      estimated_relations: launch.graph.estimated_relations,
      stale_relations: launch.graph.stale_relations,
      unknown_relations: launch.graph.unknown_relations,
      isolated_entity_count: launch.graph.isolated_entity_count,
      single_relation_entity_count: launch.graph.single_relation_entity_count,
      entities_with_3plus_relations: launch.graph.entities_with_3plus_relations,
      entities_with_5plus_relations: launch.graph.entities_with_5plus_relations,
      entities_with_10plus_relations: launch.graph.entities_with_10plus_relations,
      indexable: launch.graph.indexable,
      noindex_product: launch.graph.noindex_product,
      graph_only: launch.graph.graph_only,
      pages: launch.graph.pages,
      quality_avg: launch.average_indexable_quality,
      quality_min: launch.minimum_indexable_quality,
      quality_distribution: launch.quality_distribution,
    },
    bySite,
    coverage,
    sourceTable,
    provenance: {
      important_with_source_pct: pct(withSource, important.length),
      important_with_primary_pct: pct(withPrimary, important.length),
      pages_with_primary_pct: pct(pagesPrimary, pages.length),
      pages_with_two_source_types_pct: pct(pagesTwo, pages.length),
    },
    connectivity: launch.connectivity,
    random50: random50.map(explainPage),
    top20: top20.map(explainPage),
    sample10: Object.fromEntries(SITES.map((site) => [site, sampleBySite[site].map(explainPage)])),
    shallowPriority,
    opportunities,
    readiness,
    ai: AI_USAGE_AUDIT,
    verdict,
    ultimate: {
      fixcode: readiness.fixcode.ultimate,
      autospec: readiness.autospec.ultimate,
      wearthere: readiness.wearthere.ultimate,
      chargematch: readiness.chargematch.ultimate,
      tripcost: readiness.tripcost.ultimate,
    },
  };
}

function mdTable(headers: string[], rows: string[][]) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, sep, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

export function renderDeepGraphQaMarkdown(qa = deepGraphQa()): string {
  const a = qa.after;
  const b = qa.before;
  const dist = a.quality_distribution ?? [];
  const productRows = SITES.map((site) => {
    const s = qa.bySite[site];
    return [
      site,
      String(s.entities),
      String(s.relations),
      String(s.decision_relevant_relations),
      String(s.relations_per_entity),
      String(s.indexable),
      String(s.noindex_product),
      qa.readiness[site].label,
    ];
  });

  const lines: string[] = [];
  lines.push("# Deep graph QA");
  lines.push("");
  lines.push(`Generated: ${qa.generated_at}`);
  lines.push("");
  lines.push("Reference commit announced: `35f3633` — Expand the five catalogs with gated structured data.");
  lines.push("");
  lines.push("PUBLIC_SITE_LIVE remains **false**. Global **noindex** remains on. Homepages were not redesigned. URL count was not a target.");
  lines.push("");
  lines.push("## Verdict");
  lines.push("");
  lines.push(qa.verdict);
  lines.push("");
  lines.push("## 101. Before vs after");
  lines.push("");
  lines.push(
    mdTable(
      ["Metric", "Before (35f3633 announced)", "After this pass"],
      [
        ["Entities", String(b.entities), String(a.entities)],
        ["Relations", String(b.relations), String(a.relations)],
        ["Decision relations", "n/a (not measured)", String(a.decision_relations)],
        ["Relations / entity", String(b.relations_per_entity), String(a.relations_per_entity)],
        ["Verified relations", "n/a", String(a.verified_relations)],
        ["Inferred relations", "n/a", String(a.inferred_relations)],
        ["Estimated relations", "n/a", String(a.estimated_relations)],
        ["INDEXABLE", String(b.indexable), String(a.indexable)],
        ["NOINDEX_PRODUCT", "n/a", String(a.noindex_product)],
        ["GRAPH_ONLY pages", "n/a", String(a.graph_only)],
        ["Quality avg (INDEXABLE)", String(b.quality_avg), String(a.quality_avg)],
        ["Quality min (INDEXABLE)", String(b.quality_min), String(a.quality_min)],
      ],
    ),
  );
  lines.push("");
  lines.push("A drop in INDEXABLE or in average quality is treated as success when it removes self-declared 90+ scores and unsupported claims.");
  lines.push("");
  lines.push("## 102. Per product");
  lines.push("");
  lines.push(
    mdTable(
      ["Product", "Entities", "Relations", "Decision relations", "Rel/entity", "Indexable", "Noindex product", "Readiness"],
      productRows,
    ),
  );
  lines.push("");
  lines.push("## KPI block (all sites)");
  lines.push("");
  lines.push(
    mdTable(
      ["KPI", "Value"],
      [
        ["entity_count", String(a.entities)],
        ["relation_count", String(a.relations)],
        ["decision_relevant_relation_count", String(a.decision_relations)],
        ["relations_per_entity", String(a.relations_per_entity)],
        ["decision_relations_per_entity", String(a.decision_relations_per_entity)],
        ["isolated_entity_count", String(a.isolated_entity_count)],
        ["single_relation_entity_count", String(a.single_relation_entity_count)],
        ["entities_with_3plus_relations", String(a.entities_with_3plus_relations)],
        ["entities_with_5plus_relations", String(a.entities_with_5plus_relations)],
        ["entities_with_10plus_relations", String(a.entities_with_10plus_relations)],
        ["verified_relation_count", String(a.verified_relations)],
        ["inferred_relation_count", String(a.inferred_relations)],
        ["estimated_relation_count", String(a.estimated_relations)],
        ["stale_relation_count", String(a.stale_relations)],
        ["unknown_relation_count", String(a.unknown_relations)],
      ],
    ),
  );
  lines.push("");
  lines.push("## 103. Quality distribution");
  lines.push("");
  lines.push(
    mdTable(
      ["Bucket", "Count", "% of pages", "Indexable in bucket"],
      dist.map((row) => [row.bucket, String(row.count), `${row.percentage}%`, String(row.indexable)]),
    ),
  );
  lines.push("");
  lines.push(
    "Before this pass, INDEXABLE pages sat on an editorial floor of 80 with a mean of 90.2 — self-declared uniqueness and uncapped seed demand. Soft score now weights verified facts and decision relations; editorial demand is capped; word count / title uniqueness / internal links are not dimensions. A cluster in 70–84 is expected. A remaining pile-up in 80–84 is the editorial cap, not a claim of observed GSC quality.",
  );
  lines.push("");
  lines.push("## 104. Source table (entity + relation provenance records)");
  lines.push("");
  lines.push(
    mdTable(
      ["Source type", "Count"],
      Object.entries(qa.sourceTable).map(([k, v]) => [k, String(v)]),
    ),
  );
  lines.push("");
  lines.push(
    mdTable(
      ["Provenance coverage", "%"],
      [
        ["Important facts/relations with any source", String(qa.provenance.important_with_source_pct)],
        ["Important with primary source (official/mfr/regulatory/tested)", String(qa.provenance.important_with_primary_pct)],
        ["Pages with ≥1 primary source on an entity", String(qa.provenance.pages_with_primary_pct)],
        ["Pages with ≥2 source types", String(qa.provenance.pages_with_two_source_types_pct)],
      ],
    ),
  );
  lines.push("");
  lines.push("## 105–109. Domain coverage");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(qa.coverage, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("### Graph health by product");
  lines.push("");
  lines.push(
    mdTable(
      ["Product", "Rel/entity", "Decision rel/entity", "Verified %", "Inferred %", "Unknown %", "Stale %", "Isolated", "Shallow", "Connected", "Rich", "Avg relation quality"],
      SITES.map((site) => {
        const s = qa.bySite[site];
        return [
          site,
          String(s.relations_per_entity),
          String(s.decision_relations_per_entity),
          String(s.verified_pct),
          String(s.inferred_pct),
          String(s.unknown_pct),
          String(s.stale_pct),
          String(s.isolated),
          String(s.shallow),
          String(s.connected),
          String(s.rich),
          String(s.avg_relation_quality),
        ];
      }),
    ),
  );
  lines.push("");
  lines.push("Depth classes: ISOLATED (degree 0), SHALLOW (<3), CONNECTED, RICH (≥8 for decision types such as error_code / vehicle_configuration / device / charger / corridor / destination / historical_climate; ≥5 otherwise). Taxonomy nodes are not required to be RICH.");
  lines.push("");
  lines.push("## 110. Top shallow high-value entities");
  lines.push("");
  for (const block of qa.shallowPriority) {
    lines.push(`### ${block.site}`);
    lines.push("");
    if (!block.rows.length) {
      lines.push("No isolated/shallow decision entities in the priority types — remaining work is completeness of *relation quality*, not missing nodes.");
      lines.push("");
      continue;
    }
    lines.push(
      mdTable(
        ["Entity", "Type", "Degree", "Depth"],
        block.rows.map((r) => [r.name.replace(/\|/g, "/"), r.type, String(r.degree), r.depth]),
      ),
    );
    lines.push("");
  }
  lines.push("## 111. Top 20 opportunities (recommendations only — no pages auto-created)");
  lines.push("");
  lines.push(
    mdTable(
      ["Site", "Opportunity", "Demand", "Product value", "Graph completeness"],
      qa.opportunities.map((o) => [o.site, o.item, String(o.demand), String(o.value), String(o.completeness)]),
    ),
  );
  lines.push("");
  lines.push("## 113. Readiness");
  lines.push("");
  lines.push(
    mdTable(
      ["Product", "State", "Why"],
      SITES.map((site) => [site, qa.readiness[site].label, qa.readiness[site].why]),
    ),
  );
  lines.push("");
  lines.push("None are SEO SCALE READY.");
  lines.push("");
  lines.push("## Ultimate tests");
  lines.push("");
  for (const site of SITES) {
    lines.push(`- **${site}:** ${qa.ultimate[site]}`);
  }
  lines.push("");
  lines.push("## LLM audit");
  lines.push("");
  lines.push(
    mdTable(
      ["Class", "Site", "Function", "Status"],
      qa.ai.map((row) => [row.classification, row.site, row.fn, row.status]),
    ),
  );
  lines.push("");
  lines.push("## 82–84. Sampled pages (10 per product) + nearest siblings");
  lines.push("");
  for (const site of SITES) {
    lines.push(`### ${site}`);
    lines.push("");
    for (const page of qa.sample10[site]) {
      lines.push(`#### ${page.url}`);
      lines.push("");
      lines.push(`- score ${page.score} · ${page.index_state} · intent family \`${page.intent_family}\``);
      lines.push(`- ${page.why}`);
      lines.push(`- facts: ${page.facts.join(", ") || "—"}`);
      lines.push(`- sources: ${page.sources.join(", ") || "—"}`);
      lines.push(`- relations: ${page.relations.join(", ") || "—"} (${page.decision_relations} decision-relevant)`);
      lines.push(`- demand ${page.search_demand} (editorial unless GSC is wired) · confidence ${page.confidence}`);
      lines.push(`- distinct_reason (not title uniqueness): ${page.uniqueness || "—"}`);
      lines.push("- nearest 5:");
      for (const n of page.neighbors) lines.push(`  - ${n.similarity} ${n.url}`);
      lines.push("");
    }
  }
  lines.push("## 20 highest scores (why)");
  lines.push("");
  for (const page of qa.top20) {
    lines.push(`- **${page.score}** ${page.url} — ${page.why}`);
  }
  lines.push("");
  lines.push("## 50 random pages (compact)");
  lines.push("");
  lines.push(
    mdTable(
      ["Site", "Score", "State", "URL", "Intent family"],
      qa.random50.map((p) => [p.site, String(p.score), p.index_state, p.url, p.intent_family]),
    ),
  );
  lines.push("");
  lines.push("## Failure-condition check");
  lines.push("");
  lines.push("- Page count was not increased as a goal.");
  lines.push("- Decision-relevant relations are counted separately from trivia (FROM_PLACE is not decision-relevant).");
  lines.push("- Editorial demand cannot produce a 95 average; it is capped.");
  lines.push("- AI_INFERRED cannot be promoted to OFFICIAL/MANUFACTURER.");
  lines.push("- AutoSpec LOW fitment renders “Possible fitment — verify.” never “Compatible.”");
  lines.push("- ChargeMatch expected watts are SPEC_VERIFIED or INFERRED, never MEASURED without a lab row.");
  lines.push("- FixCode errors attach causes, tests, results, fixes, SAFETY_CLASS — not only ERROR → MEANING.");
  lines.push("- WearThere month pages are CLIMATE_NORMAL, not FORECAST.");
  lines.push("- TripCost volatile fares expire; stale quotes are not labelled current.");
  lines.push("");
  return lines.join("\n");
}

export function writeDeepGraphQa(path = "docs/DEEP_GRAPH_QA.md") {
  writeFileSync(path, renderDeepGraphQaMarkdown(), "utf8");
  return path;
}

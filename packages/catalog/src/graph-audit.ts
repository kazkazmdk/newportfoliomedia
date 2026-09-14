import {
  classifyEdgeKind,
  classifyRelation,
  median,
  percentile,
  type EdgeKind,
  type IndexState,
  type RelationClass,
  type SiteId,
  type TruthStatus,
} from "@penta/graph-core";
import { isFresh, isGenericSourceUrl, validateFactProvenance } from "@penta/data-provenance";
import { qualityDistribution } from "@penta/quality-gate";
import { buildCatalog } from "./index";

export const SITES: SiteId[] = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];

export type DegreeBucket = {
  isolated: number;
  exactly_1: number;
  from_2_to_4: number;
  gte_5: number;
  gte_10: number;
  gte_20: number;
};

function emptyDegree(): DegreeBucket {
  return { isolated: 0, exactly_1: 0, from_2_to_4: 0, gte_5: 0, gte_10: 0, gte_20: 0 };
}

function addDegree(bucket: DegreeBucket, n: number) {
  if (n <= 0) bucket.isolated += 1;
  else if (n === 1) bucket.exactly_1 += 1;
  else if (n <= 4) bucket.from_2_to_4 += 1;
  if (n >= 5) bucket.gte_5 += 1;
  if (n >= 10) bucket.gte_10 += 1;
  if (n >= 20) bucket.gte_20 += 1;
}

function truthStatus(input: {
  inferred?: boolean;
  estimated?: boolean;
  confidence?: string;
  provenance: Array<{
    source_type: string;
    valid_until?: string | null;
    verification_method?: string;
  }>;
  conflicting?: boolean;
}): TruthStatus {
  if (input.conflicting) return "CONFLICTING";
  const until = input.provenance[0]?.valid_until;
  if (until && !isFresh({ valid_until: until } as never)) return "STALE";
  if (input.estimated) return "ESTIMATED";
  if (input.inferred || input.provenance.some((p) => p.source_type === "AI_INFERRED")) return "INFERRED";
  if (input.provenance.some((p) => p.source_type === "USER_REPORTED" || p.source_type === "USER_OBSERVED")) {
    return "REPORTED";
  }
  if (
    input.provenance.some(
      (p) =>
        p.source_type === "TESTED" ||
        p.source_type === "TESTED_INTERNAL" ||
        p.verification_method === "LAB_TEST",
    )
  ) {
    return "TESTED";
  }
  if (
    input.provenance.some((p) => {
      const v = validateFactProvenance({
        source_type: p.source_type as never,
        source_url: (p as { source_url?: string }).source_url,
        source_name: (p as { source_name?: string }).source_name,
        verification_method: p.verification_method as never,
      });
      return v.verified_primary;
    })
  ) {
    return "VERIFIED_PRIMARY";
  }
  if (input.provenance.some((p) => ["PRIMARY_DATABASE", "TRUSTED_THIRD_PARTY"].includes(p.source_type))) {
    return "VERIFIED_SECONDARY";
  }
  if (!input.provenance.length || input.confidence === "UNKNOWN") return "UNKNOWN";
  return "UNKNOWN";
}

export function auditGraph() {
  const store = buildCatalog();
  const entities = [...store.entities.values()];
  const relations = [...store.relations.values()];
  const pages = [...store.pages.values()];

  const degrees = new Map<string, number>();
  const decisionDegrees = new Map<string, number>();
  for (const entity of entities) {
    degrees.set(entity.id, 0);
    decisionDegrees.set(entity.id, 0);
  }
  const seenKeys = new Set<string>();
  let duplicate_relations = 0;
  const relationTypes: Record<string, number> = {};
  const relationClasses: Record<RelationClass, number> = {
    DECISION_RELEVANT: 0,
    DESCRIPTIVE: 0,
    NAVIGATION_ONLY: 0,
    UNKNOWN: 0,
  };
  const truth: Record<TruthStatus, number> = {
    VERIFIED_PRIMARY: 0,
    VERIFIED_SECONDARY: 0,
    TESTED: 0,
    REPORTED: 0,
    INFERRED: 0,
    ESTIMATED: 0,
    STALE: 0,
    UNKNOWN: 0,
    CONFLICTING: 0,
  };
  const edgeKinds: Record<EdgeKind, number> = {
    SOURCE_TRUTH: 0,
    DERIVED_RULE: 0,
    PERSONALIZED_DECISION: 0,
    UNKNOWN: 0,
  };

  for (const rel of relations) {
    const key = `${rel.site}|${rel.type}|${rel.from_id}|${rel.to_id}`;
    if (seenKeys.has(key)) duplicate_relations += 1;
    seenKeys.add(key);
    relationTypes[rel.type] = (relationTypes[rel.type] ?? 0) + 1;
    const cls = classifyRelation(rel);
    relationClasses[cls] += 1;
    degrees.set(rel.from_id, (degrees.get(rel.from_id) ?? 0) + 1);
    degrees.set(rel.to_id, (degrees.get(rel.to_id) ?? 0) + 1);
    if (cls === "DECISION_RELEVANT") {
      decisionDegrees.set(rel.from_id, (decisionDegrees.get(rel.from_id) ?? 0) + 1);
      decisionDegrees.set(rel.to_id, (decisionDegrees.get(rel.to_id) ?? 0) + 1);
    }
    const status = truthStatus({
      inferred: rel.inferred,
      estimated: rel.estimated,
      confidence: rel.confidence,
      provenance: rel.provenance,
      conflicting: store.conflicts.some((c) => c.entity_id === rel.from_id || c.entity_id === rel.to_id),
    });
    truth[status] += 1;
    edgeKinds[classifyEdgeKind(rel)] += 1;
  }

  for (const entity of entities) {
    const status = truthStatus({
      confidence: entity.confidence,
      provenance: entity.provenance,
      conflicting: store.conflicts.some((c) => c.entity_id === entity.id),
    });
    truth[status] += 1;
  }

  const degVals = entities.map((e) => degrees.get(e.id) ?? 0);
  const decisionVals = entities.map((e) => decisionDegrees.get(e.id) ?? 0);
  const degreeBucket = emptyDegree();
  for (const n of degVals) addDegree(degreeBucket, n);

  const entities_by_type: Record<string, number> = {};
  for (const entity of entities) {
    entities_by_type[entity.type] = (entities_by_type[entity.type] ?? 0) + 1;
  }

  const pageStates: Record<string, number> = {
    INDEXABLE: 0,
    SEO_CANDIDATE: 0,
    NOINDEX_PRODUCT: 0,
    GRAPH_ONLY: 0,
    REVIEW_REQUIRED: 0,
    CONFLICTED: 0,
    STALE: 0,
    REDIRECT: 0,
    REMOVED: 0,
  };
  for (const page of pages) {
    pageStates[page.index_state] = (pageStates[page.index_state] ?? 0) + 1;
  }

  const scores = pages.map((p) => p.quality_score).sort((a, b) => a - b);
  const indexScores = pages.filter((p) => p.index_state === "INDEXABLE").map((p) => p.quality_score);
  const dist = qualityDistribution(pages);
  const ge90 = pages.filter((p) => p.quality_score >= 90).length;
  const ge90pct = pages.length ? Math.round((ge90 / pages.length) * 1000) / 10 : 0;

  const bySite = Object.fromEntries(
    SITES.map((site) => {
      const siteEntities = entities.filter((e) => e.site === site);
      const siteRels = relations.filter((r) => r.site === site);
      const sitePages = pages.filter((p) => p.site === site);
      const siteDeg = siteEntities.map((e) => degrees.get(e.id) ?? 0);
      const siteDec = siteEntities.map((e) => decisionDegrees.get(e.id) ?? 0);
      const buckets = emptyDegree();
      for (const n of siteDeg) addDegree(buckets, n);
      const types: Record<string, number> = {};
      for (const entity of siteEntities) types[entity.type] = (types[entity.type] ?? 0) + 1;
      const classes: Record<RelationClass, number> = {
        DECISION_RELEVANT: 0,
        DESCRIPTIVE: 0,
        NAVIGATION_ONLY: 0,
        UNKNOWN: 0,
      };
      for (const rel of siteRels) classes[classifyRelation(rel)] += 1;
      const states: Partial<Record<IndexState, number>> = {};
      for (const page of sitePages) {
        states[page.index_state] = (states[page.index_state] ?? 0) + 1;
      }
      const inferredFacts = [...siteEntities, ...siteRels].filter((row) =>
        "inferred" in row ? row.inferred : row.provenance.some((p) => p.source_type === "AI_INFERRED"),
      ).length;
      const verifiedFacts = [...siteEntities, ...siteRels].filter((row) =>
        row.provenance.some((p) =>
          ["OFFICIAL", "MANUFACTURER", "REGULATORY", "TESTED", "TESTED_INTERNAL"].includes(p.source_type),
        ),
      ).length;
      return [
        site,
        {
          entities: siteEntities.length,
          relations: siteRels.length,
          unique_relations: new Set(siteRels.map((r) => `${r.type}|${r.from_id}|${r.to_id}`)).size,
          pages: sitePages.length,
          rel_per_entity_avg: siteEntities.length
            ? Math.round((siteRels.length / siteEntities.length) * 100) / 100
            : 0,
          rel_per_entity_median: median(siteDeg),
          rel_per_entity_p25: percentile(siteDeg, 0.25),
          rel_per_entity_p75: percentile(siteDeg, 0.75),
          rel_per_entity_p90: percentile(siteDeg, 0.9),
          decision_rel_per_entity: siteEntities.length
            ? Math.round((siteRels.filter((r) => classifyRelation(r) === "DECISION_RELEVANT").length / siteEntities.length) * 100) / 100
            : 0,
          decision_degree_median: median(siteDec),
          degree: buckets,
          entities_by_type: types,
          relation_classes: classes,
          pages_by_state: states,
          verified_facts: verifiedFacts,
          inferred_facts: inferredFacts,
          conflicts: store.conflicts.filter((c) => siteEntities.some((e) => e.id === c.entity_id)).length,
        },
      ];
    }),
  );

  return {
    generated_at: new Date().toISOString(),
    method:
      "Recalculated from in-memory GraphStore after populateDecisionGraph + page builders. Stored README/JSON reports were not read. quality_score comes from evaluatePageQuality at page-build/recompute time, not from a previous markdown.",
    claimed_previous: {
      entities: 794,
      relations: 1186,
      indexable: 890,
      quality_avg: 90.2,
      quality_min: 80,
      relations_per_entity: 1.49,
      note: "Claim only. Not used as a metric.",
    },
    entities: {
      total: entities.length,
      by_type: entities_by_type,
      degree: degreeBucket,
    },
    relations: {
      total: relations.length,
      unique: seenKeys.size,
      duplicate: duplicate_relations,
      types: relationTypes,
      classes: relationClasses,
      avg_per_entity: entities.length ? Math.round((relations.length / entities.length) * 100) / 100 : 0,
      median_per_entity: median(degVals),
      p25: percentile(degVals, 0.25),
      p75: percentile(degVals, 0.75),
      p90: percentile(degVals, 0.9),
      decision_relevant: relationClasses.DECISION_RELEVANT,
      decision_per_entity: entities.length
        ? Math.round((relationClasses.DECISION_RELEVANT / entities.length) * 100) / 100
        : 0,
      decision_degree_median: median(decisionVals),
    },
    truth,
    edge_kinds: edgeKinds,
    provenance_v2: (() => {
      const facts = [...entities, ...relations];
      let exact_url = 0;
      let exact_document = 0;
      let field_level = 0;
      let generic_only = 0;
      let none = 0;
      let verified_exact_primary = 0;
      let verified_exact_regulatory = 0;
      let trusted_dataset = 0;
      let cross = 0;
      let single = 0;
      let conflicted = store.conflicts.length;
      for (const row of facts) {
        const rec = row.provenance[0];
        if (!rec) {
          none += 1;
          continue;
        }
        const v = validateFactProvenance({
          source_type: rec.source_type,
          source_url: rec.source_url,
          source_name: rec.source_name,
          retrieved_at: rec.retrieved_at,
          verified_at: rec.verified_at,
          verification_method: rec.verification_method,
          inferred: "inferred" in row ? Boolean((row as { inferred?: boolean }).inferred) : false,
        });
        if (v.verified_primary && v.level === "PRIMARY_EXACT") verified_exact_primary += 1;
        if (v.level === "REGULATORY_EXACT") verified_exact_regulatory += 1;
        if (v.level === "TRUSTED_DATASET_EXACT") trusted_dataset += 1;
        if (v.level === "CROSS_SOURCE_CONFIRMED") cross += 1;
        if (rec.source_url && !isGenericSourceUrl(rec.source_url)) exact_url += 1;
        else if (rec.source_url && isGenericSourceUrl(rec.source_url)) generic_only += 1;
        if (rec.source_name) exact_document += 1;
        if (rec.source_url || rec.source_name) field_level += 1;
        if (row.provenance.length === 1) single += 1;
      }
      return {
        facts: facts.length,
        exact_url,
        exact_document,
        field_level,
        generic_only,
        none,
        verified_exact_primary,
        verified_exact_regulatory,
        trusted_dataset,
        cross,
        single,
        conflicted,
      };
    })(),
    pages: pageStates,
    quality: {
      mean: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      median: median(scores),
      p10: percentile(scores, 0.1),
      p25: percentile(scores, 0.25),
      p75: percentile(scores, 0.75),
      p90: percentile(scores, 0.9),
      min: scores[0] ?? 0,
      max: scores.at(-1) ?? 0,
      indexable_mean: indexScores.length
        ? Math.round((indexScores.reduce((a, b) => a + b, 0) / indexScores.length) * 10) / 10
        : 0,
      indexable_min: indexScores.length ? Math.min(...indexScores) : 0,
      pct_ge_90: ge90pct,
      gate_suspect: ge90pct > 70,
      distribution: dist,
    },
    bySite,
    conflicts: store.conflicts.length,
  };
}

export function renderAuditMarkdown(audit = auditGraph()): string {
  const lines: string[] = [];
  lines.push("# Deep graph baseline");
  lines.push("");
  lines.push(`Generated: ${audit.generated_at}`);
  lines.push("");
  lines.push(audit.method);
  lines.push("");
  lines.push("## Claimed previous state (not trusted)");
  lines.push("");
  lines.push(
    `794 entities · 1 186 relations (~1.49/entity) · 890 INDEXABLE · quality mean 90.2 / min 80.`,
  );
  lines.push("");
  lines.push("## Recalculated now");
  lines.push("");
  lines.push(`- Entities: **${audit.entities.total}**`);
  lines.push(`- Relations: **${audit.relations.total}** (unique ${audit.relations.unique}, duplicate ${audit.relations.duplicate})`);
  lines.push(`- Relations/entity avg **${audit.relations.avg_per_entity}** · median **${audit.relations.median_per_entity}** · P25 ${audit.relations.p25} · P75 ${audit.relations.p75} · P90 ${audit.relations.p90}`);
  lines.push(`- Decision-relevant relations: **${audit.relations.decision_relevant}** (${audit.relations.decision_per_entity}/entity, median degree ${audit.relations.decision_degree_median})`);
  lines.push(`- Pages INDEXABLE **${audit.pages.INDEXABLE}** · SEO_CANDIDATE **${audit.pages.SEO_CANDIDATE ?? 0}** · NOINDEX_PRODUCT **${audit.pages.NOINDEX_PRODUCT}** · GRAPH_ONLY **${audit.pages.GRAPH_ONLY}** · REVIEW_REQUIRED **${audit.pages.REVIEW_REQUIRED ?? 0}** · CONFLICTED **${audit.pages.CONFLICTED ?? 0}** · STALE **${audit.pages.STALE ?? 0}**`);
  if (audit.edge_kinds) {
    lines.push(`- Edge kinds SOURCE_TRUTH **${audit.edge_kinds.SOURCE_TRUTH}** · DERIVED_RULE **${audit.edge_kinds.DERIVED_RULE}** · PERSONALIZED_DECISION **${audit.edge_kinds.PERSONALIZED_DECISION}** · UNKNOWN **${audit.edge_kinds.UNKNOWN}**`);
  }
  lines.push("");
  lines.push("### Entity degree");
  lines.push("");
  const d = audit.entities.degree;
  lines.push(`isolated ${d.isolated} · exactly 1: ${d.exactly_1} · 2–4: ${d.from_2_to_4} · ≥5: ${d.gte_5} · ≥10: ${d.gte_10} · ≥20: ${d.gte_20}`);
  lines.push("");
  lines.push("### Relation classes");
  lines.push("");
  for (const [k, v] of Object.entries(audit.relations.classes)) lines.push(`- ${k}: ${v}`);
  lines.push("");
  lines.push("### Truth status (entities + relations)");
  lines.push("");
  for (const [k, v] of Object.entries(audit.truth)) lines.push(`- ${k}: ${v}`);
  lines.push("");
  lines.push("### Entities by type");
  lines.push("");
  for (const [k, v] of Object.entries(audit.entities.by_type).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push("");
  lines.push("### Relation types");
  lines.push("");
  for (const [k, v] of Object.entries(audit.relations.types).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push("");
  lines.push("## Per product");
  lines.push("");
  lines.push(
    "| Product | Entities | Relations | Avg | Median | Decision rel/entity | Isolated | ≥5 | ≥10 | INDEX | NOINDEX | GRAPH_ONLY |",
  );
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const site of SITES) {
    const s = audit.bySite[site];
    lines.push(
      `| ${site} | ${s.entities} | ${s.relations} | ${s.rel_per_entity_avg} | ${s.rel_per_entity_median} | ${s.decision_rel_per_entity} | ${s.degree.isolated} | ${s.degree.gte_5} | ${s.degree.gte_10} | ${s.pages_by_state.INDEXABLE ?? 0} | ${s.pages_by_state.NOINDEX_PRODUCT ?? 0} | ${s.pages_by_state.GRAPH_ONLY ?? 0} |`,
    );
  }
  lines.push("");
  lines.push("## Quality distribution (recomputed scores, not a previous report)");
  lines.push("");
  lines.push(
    `mean ${audit.quality.mean} · median ${audit.quality.median} · p10 ${audit.quality.p10} · p25 ${audit.quality.p25} · p75 ${audit.quality.p75} · p90 ${audit.quality.p90} · min ${audit.quality.min} · max ${audit.quality.max}`,
  );
  lines.push("");
  lines.push(`INDEXABLE mean ${audit.quality.indexable_mean} · min ${audit.quality.indexable_min}`);
  lines.push("");
  lines.push(`Share of pages ≥90: **${audit.quality.pct_ge_90}%** — gate suspect: **${audit.quality.gate_suspect}**`);
  lines.push("");
  lines.push("| Bucket | Count | % | INDEXABLE |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const row of audit.quality.distribution) {
    lines.push(`| ${row.bucket} | ${row.count} | ${row.percentage}% | ${row.indexable} |`);
  }
  lines.push("");
  return lines.join("\n");
}

export function renderHealthTable(audit = auditGraph()): string {
  const header =
    "| Metric | FixCode | AutoSpec | WearThere | ChargeMatch | TripCost |\n| --- | ---: | ---: | ---: | ---: | ---: |";
  const row = (label: string, pick: (s: (typeof audit.bySite)[SiteId]) => string | number) =>
    `| ${label} | ${SITES.map((site) => pick(audit.bySite[site])).join(" | ")} |`;
  return [
    header,
    row("Entities", (s) => s.entities),
    row("Relations", (s) => s.relations),
    row("Rel/entity avg", (s) => s.rel_per_entity_avg),
    row("Rel/entity median", (s) => s.rel_per_entity_median),
    row("Decision rel/entity", (s) => s.decision_rel_per_entity),
    row("Isolated", (s) => s.degree.isolated),
    row(">=5 relations", (s) => s.degree.gte_5),
    row(">=10", (s) => s.degree.gte_10),
    row("Verified facts", (s) => s.verified_facts),
    row("Inferred facts", (s) => s.inferred_facts),
    row("Conflicts", (s) => s.conflicts),
    row("INDEX", (s) => s.pages_by_state.INDEXABLE ?? 0),
    row("SEO_CANDIDATE", (s) => s.pages_by_state.SEO_CANDIDATE ?? 0),
    row("NOINDEX", (s) => s.pages_by_state.NOINDEX_PRODUCT ?? 0),
    row("GRAPH_ONLY", (s) => s.pages_by_state.GRAPH_ONLY ?? 0),
    row("REVIEW_REQUIRED", (s) => s.pages_by_state.REVIEW_REQUIRED ?? 0),
  ].join("\n");
}

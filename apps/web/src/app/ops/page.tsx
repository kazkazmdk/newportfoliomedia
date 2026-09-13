import {
  AI_USAGE_AUDIT,
  PROVIDER_HEALTH,
  coverageReport,
  demandBreakdown,
  freshnessBuckets,
  launchReport,
  opportunityQueue,
} from "@penta/catalog";
import { pageMeta } from "@/lib/seo";
import { PROVIDERS } from "@penta/tripcost";
import { EntityInspector } from "./entity-inspector";

export const metadata = pageMeta({
  title: "Ops console",
  description: "Internal catalog, quality, and coverage.",
  canonical: "/ops",
  noindex: true,
});

export default function OpsPage() {
  const report = launchReport();
  const coverage = coverageReport();
  const g = report.graph;
  const fresh = freshnessBuckets();
  const demand = demandBreakdown();
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 font-[family-name:var(--font-geist-sans)]">
      <p className="text-xs tracking-[0.2em] uppercase">Internal</p>
      <h1 className="mt-2 text-4xl">Ops</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555]">
        Graph depth, provenance, quality hard gates. PUBLIC_SITE_LIVE={String(report.public_site_live)}. Global noindex={String(report.global_noindex)}. INDEXABLE is not LIVE.
      </p>
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <article className="border p-4">
          <p>Entities</p>
          <p className="text-2xl">{g.entities}</p>
        </article>
        <article className="border p-4">
          <p>Relations</p>
          <p className="text-2xl">{g.relations}</p>
          <p className="mt-1">{g.decision_relevant_relations} decision · {g.verified_relations} verified · {g.inferred_relations} inferred</p>
        </article>
        <article className="border p-4">
          <p>Indexable pages</p>
          <p className="text-2xl">{g.indexable}</p>
          <p className="mt-1">{g.relations_per_indexable_page} rel/page · {g.relations_per_entity} rel/entity</p>
        </article>
        <article className="border p-4">
          <p>Connectivity</p>
          <p className="mt-1">orphan {report.connectivity.ORPHAN} · isolated {report.connectivity.ISOLATED} · shallow {report.connectivity.SHALLOW} · connected {report.connectivity.CONNECTED} · rich {report.connectivity.RICH}</p>
          <p className="mt-1">{g.isolated_entity_count} isolated · {g.single_relation_entity_count} single-rel · {g.entities_with_3plus_relations} 3+ · {g.entities_with_5plus_relations} 5+ · {g.entities_with_10plus_relations} 10+</p>
        </article>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-5">
        {Object.entries(report.bySite).map(([site, stats]) => (
          <article key={site} className="border border-[#ddd] p-4">
            <h2 className="capitalize">{site}</h2>
            <p className="mt-2 text-sm">
              {stats.entities} entities · {stats.relations} rel ({stats.decision_relevant_relations} decision) · {stats.relations_per_entity} /entity · {stats.indexable} indexable
            </p>
            <p className="mt-1 text-xs">
              verified {stats.verified_relations} · inferred {stats.inferred_relations} · estimated {stats.estimated_relations} · unknown {stats.unknown_relations} · stale {stats.stale_relations}
            </p>
          </article>
        ))}
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2 text-sm">
        <article className="border p-4">
          <h2 className="text-lg">Coverage</h2>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(coverage, null, 2)}</pre>
        </article>
        <article className="border p-4">
          <h2 className="text-lg">Freshness / demand</h2>
          <p className="mt-2">fresh {fresh.fresh} · aging {fresh.aging} · stale {fresh.stale} · expired {fresh.expired}</p>
          <p className="mt-2">Demand on INDEXABLE: editorial {demand.EDITORIAL_JUDGMENT} · GSC {demand.GSC_OBSERVED} (none until GSC is connected)</p>
          <p className="mt-2">Quality avg {report.average_indexable_quality} · min {report.minimum_indexable_quality}</p>
          <ul className="mt-2 grid gap-1 text-xs">
            {report.quality_distribution.map((row) => (
              <li key={row.bucket}>
                {row.bucket}: {row.count} ({row.percentage}%) · indexable {row.indexable}
              </li>
            ))}
          </ul>
        </article>
      </section>
      <EntityInspector />
      <section className="mt-10 text-sm">
        <h2 className="text-xl">Opportunity queue (do not auto-create pages)</h2>
        <ul className="mt-3 grid gap-2">
          {opportunityQueue().map((row) => (
            <li key={row.query} className="border p-3">
              {row.site}: {row.query} · score {row.score} · {row.action}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 text-sm">
        <h2 className="text-xl">AI usage</h2>
        <ul className="mt-3 grid gap-1">
          {AI_USAGE_AUDIT.map((row) => (
            <li key={`${row.site}-${row.fn}`}>
              {row.classification} · {row.site} · {row.fn} — {row.status}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 text-sm">
        <h2 className="text-xl">Provider health</h2>
        <ul className="mt-3 grid gap-1">
          {PROVIDER_HEALTH.map((row) => (
            <li key={row.provider}>
              {row.provider}: last success {row.last_success ?? "never"} · {row.notes}
            </li>
          ))}
          {Object.entries(PROVIDERS).map(([name, meta]) => (
            <li key={name}>
              {name}: replaceability {meta.replaceability}/100 — {meta.notes}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

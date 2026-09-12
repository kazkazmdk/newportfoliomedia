import { buildCatalog, launchReport } from "@penta/catalog";
import { opportunityScore } from "@penta/quality-gate";
import { pageMeta } from "@/lib/seo";
import { PROVIDERS } from "@penta/tripcost";

export const metadata = pageMeta({
  title: "Ops console",
  description: "Internal catalog, quality, and coverage.",
  canonical: "/ops",
  noindex: true,
});

export default function OpsPage() {
  const store = buildCatalog();
  const report = launchReport();
  const pages = [...store.pages.values()].sort((a, b) => b.quality_score - a.quality_score);
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 font-[family-name:var(--font-geist-sans)]">
      <p className="text-xs tracking-[0.2em] uppercase">Internal</p>
      <h1 className="mt-2 text-4xl">Ops</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555]">
        Entities, sources, pages, quality, SEO state. Prelaunch remains globally noindex until PUBLIC_SITE_LIVE=true.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-5">
        {Object.entries(report.bySite).map(([site, stats]) => (
          <article key={site} className="border border-[#ddd] p-4">
            <h2 className="capitalize">{site}</h2>
            <p className="mt-2 text-sm">
              {stats.entities} entities · {stats.relations} rel · {stats.indexable} indexable · {stats.noindex_product} product · {stats.graph_only} graph-only
            </p>
          </article>
        ))}
      </section>
      <section className="mt-10 overflow-x-auto">
        <h2 className="text-xl">Pages</h2>
        <table className="mt-4 w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">URL</th>
              <th>Site</th>
              <th>Family</th>
              <th>Quality</th>
              <th>Demand</th>
              <th>State</th>
              <th>Batch</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-[#eee]">
                <td className="py-2">
                  <a className="underline" href={p.url}>
                    {p.url}
                  </a>
                </td>
                <td>{p.site}</td>
                <td>{p.family}</td>
                <td>{p.quality_score}</td>
                <td>{p.search_demand}</td>
                <td>{p.index_state}</td>
                <td>{p.batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-10">
        <h2 className="text-xl">Opportunity ranking (seed)</h2>
        <p className="mt-2 text-sm">
          Example FixCode 4C:{" "}
          {opportunityScore({
            search_demand: 92,
            data_completeness: 90,
            monetization_potential: 70,
            product_utility: 95,
            competition_difficulty: 55,
          })}
        </p>
      </section>
      <section className="mt-8 text-sm">
        <h2 className="text-xl">External dependency risk</h2>
        <ul className="mt-3 grid gap-1">
          {Object.entries(PROVIDERS).map(([name, meta]) => (
            <li key={name}>
              {name}: replaceability {meta.replaceability}/100 — {meta.notes}
            </li>
          ))}
          <li>Open-Meteo forecast (WearThere): replaceability 70 — optional, climate normals remain.</li>
        </ul>
      </section>
    </main>
  );
}

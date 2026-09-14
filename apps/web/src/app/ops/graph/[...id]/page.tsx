import { entityInspector } from "@penta/catalog";
import { classifyRelation } from "@penta/graph-core";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";

export const metadata = pageMeta({
  title: "Graph inspector",
  description: "Internal entity inspector. Not a public page.",
  canonical: "/ops/graph",
  noindex: true,
});

export default async function GraphInspectorPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  const entityId = id.map((part) => decodeURIComponent(part)).join("/");
  const row = entityInspector(entityId);
  if (!row) notFound();
  const { entity, incoming, outgoing, pages, stale } = row;
  const decisionOut = outgoing.filter((rel) => classifyRelation(rel) === "DECISION_RELEVANT");
  const decisionIn = incoming.filter((rel) => classifyRelation(rel) === "DECISION_RELEVANT");
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.2em]">Internal · GRAPH_ONLY surface</p>
      <h1 className="mt-2 text-3xl">{entity.name}</h1>
      <p className="mt-2 text-sm text-[#555]">
        {entity.id} · {entity.type} · {entity.site} · confidence {entity.confidence}
      </p>
      <section className="mt-8 grid gap-4 text-sm">
        <article className="border p-4">
          <h2 className="text-lg">Facts</h2>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(entity.properties, null, 2)}</pre>
        </article>
        <article className="border p-4">
          <h2 className="text-lg">Provenance</h2>
          <ul className="mt-2 grid gap-1">
            {entity.provenance.map((p) => (
              <li key={`${p.source_id}-${p.retrieved_at}`}>
                {p.source_type} · {p.source_id} · {p.verification_method} · retrieved {p.retrieved_at}
                {p.source_url ? ` · ${p.source_url}` : ""}
              </li>
            ))}
            {!entity.provenance.length ? <li>None</li> : null}
          </ul>
        </article>
        <article className="border p-4">
          <h2 className="text-lg">Relations</h2>
          <p>
            outbound {outgoing.length} ({decisionOut.length} decision) · inbound {incoming.length} (
            {decisionIn.length} decision) · stale {stale.length}
          </p>
          <ul className="mt-2 grid gap-1">
            {outgoing.map((rel) => (
              <li key={rel.id}>
                → {rel.type} {rel.to_id} · {classifyRelation(rel)} · {rel.confidence}
                {rel.inferred ? " · inferred" : ""}
              </li>
            ))}
            {incoming.map((rel) => (
              <li key={rel.id}>
                ← {rel.type} {rel.from_id} · {classifyRelation(rel)} · {rel.confidence}
              </li>
            ))}
          </ul>
        </article>
        <article className="border p-4">
          <h2 className="text-lg">Page candidates</h2>
          <ul className="mt-2 grid gap-1">
            {pages.map((page) => (
              <li key={page.url}>
                {page.url} · {page.index_state} · score {page.quality_score}
              </li>
            ))}
            {!pages.length ? <li>GRAPH_ONLY entity — no page candidate</li> : null}
          </ul>
        </article>
      </section>
    </main>
  );
}

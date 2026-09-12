"use client";

import { useState } from "react";

type InspectorPayload = {
  entity: { id: string; type: string; name: string; confidence: string; properties: Record<string, unknown> };
  incoming: Array<{ id: string; type: string; from_id: string; confidence: string }>;
  outgoing: Array<{ id: string; type: string; to_id: string; confidence: string }>;
  pages: Array<{ url: string; index_state: string; quality_score: number }>;
};

export function EntityInspector() {
  const [id, setId] = useState("veh:bmw:3-series:g20:320d-b47");
  const [data, setData] = useState<InspectorPayload | null>(null);
  const [error, setError] = useState("");

  return (
    <section className="mt-10">
      <h2 className="text-xl">Graph inspector</h2>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const res = await fetch(`/api/ops/entity?id=${encodeURIComponent(id)}`);
          if (!res.ok) {
            setData(null);
            setError("Entity not found");
            return;
          }
          setData((await res.json()) as InspectorPayload);
        }}
      >
        <input className="min-w-[280px] flex-1 border px-3 py-2 text-sm" value={id} onChange={(e) => setId(e.target.value)} />
        <button className="border bg-black px-4 py-2 text-sm text-white" type="submit">
          Inspect
        </button>
      </form>
      {error ? <p className="mt-2 text-sm">{error}</p> : null}
      {data ? (
        <div className="mt-4 grid gap-3 text-sm">
          <p>
            {data.entity.name} · {data.entity.type} · {data.entity.confidence}
          </p>
          <p>{data.outgoing.length} outgoing · {data.incoming.length} incoming · {data.pages.length} pages</p>
          <ul className="grid gap-1">
            {data.outgoing.slice(0, 20).map((rel) => (
              <li key={rel.id}>
                → {rel.type} {rel.to_id} ({rel.confidence})
              </li>
            ))}
            {data.incoming.slice(0, 20).map((rel) => (
              <li key={rel.id}>
                ← {rel.type} {rel.from_id} ({rel.confidence})
              </li>
            ))}
          </ul>
          <ul>
            {data.pages.map((page) => (
              <li key={page.url}>
                <a className="underline" href={page.url}>
                  {page.url}
                </a>{" "}
                {page.index_state} {page.quality_score}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

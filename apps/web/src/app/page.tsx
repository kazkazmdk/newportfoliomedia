import Link from "next/link";
import { launchReport } from "@penta/catalog";

const PRODUCTS = [
  {
    href: "/fixcode",
    name: "FixCode",
    promise: "Show us what's wrong.",
    feel: "Trust",
    note: "Appliance diagnostic engine",
    tone: "border-[#d7d2c8] bg-[#fbfaf6] hover:border-[#1f3d2b]",
  },
  {
    href: "/autospec",
    name: "AutoSpec",
    promise: "Everything your car needs.",
    feel: "Control",
    note: "Car ownership copilot",
    tone: "border-[#d8d0c4] bg-[#f3efe8] hover:border-[#1c2a38]",
  },
  {
    href: "/wearthere",
    name: "WearThere",
    promise: "Know exactly what to wear anywhere.",
    feel: "Desire",
    note: "Travel wardrobe agent",
    tone: "border-[#e4d3c5] bg-[#f7ebe3] hover:border-[#8a4b32]",
  },
  {
    href: "/chargematch",
    name: "ChargeMatch",
    promise: "Will it work?",
    feel: "Certainty",
    note: "Power compatibility engine",
    tone: "border-[#d9d9d6] bg-[#f4f4f2] hover:border-[#111]",
  },
  {
    href: "/tripcost",
    name: "TripCost",
    promise: "Know what this trip will really cost.",
    feel: "Clarity",
    note: "Travel economics engine",
    tone: "border-[#c9d4e0] bg-[#eef3f8] hover:border-[#0b3a6a]",
  },
];

export default function HubPage() {
  const report = launchReport();
  return (
    <div className="min-h-screen bg-[#f3f1ea] text-[#1c1b18]">
      <header className="mx-auto flex max-w-5xl items-end justify-between px-6 pb-10 pt-12">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-[#6b675e]">Penta</p>
          <h1 className="mt-3 max-w-xl font-[family-name:var(--font-geist-sans)] text-4xl leading-tight font-medium tracking-tight">
            Five products. One rule: data becomes a decision, not an article.
          </h1>
        </div>
        <Link href="/ops" className="text-sm underline decoration-[#bfb8a8] underline-offset-4">
          Ops console
        </Link>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 px-6 pb-20 md:grid-cols-2">
        {PRODUCTS.map((product) => (
          <Link
            key={product.href}
            href={product.href}
            className={`rounded-sm border p-6 transition-colors ${product.tone}`}
          >
            <p className="text-xs tracking-[0.18em] uppercase text-[#6f6a64]">{product.feel}</p>
            <h2 className="mt-3 text-2xl tracking-tight">{product.name}</h2>
            <p className="mt-2 text-lg">{product.promise}</p>
            <p className="mt-6 text-sm text-[#5c5a50]">{product.note}</p>
          </Link>
        ))}
        <section className="rounded-sm border border-[#d7d2c8] bg-white p-6 md:col-span-2">
          <h2 className="text-sm tracking-[0.16em] uppercase">Launch graph</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f4c45]">
            Indexable URLs are quality-gated. ChargeMatch stores charger×device relations in the graph without publishing every pair.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <dt className="text-[#6b675e]">Entities</dt>
              <dd className="text-2xl">{report.graph.entities}</dd>
            </div>
            <div>
              <dt className="text-[#6b675e]">Relations</dt>
              <dd className="text-2xl">{report.graph.relations}</dd>
            </div>
            <div>
              <dt className="text-[#6b675e]">Indexable</dt>
              <dd className="text-2xl">{report.graph.indexable}</dd>
            </div>
            <div>
              <dt className="text-[#6b675e]">Graph-only pages</dt>
              <dd className="text-2xl">{report.graph.graph_only}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

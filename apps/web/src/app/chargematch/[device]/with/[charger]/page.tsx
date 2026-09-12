import Link from "next/link";
import { notFound } from "next/navigation";
import { CABLES, CHARGERS, compatibility, getCharger, getDevice } from "@penta/chargematch";
import { allChargematchPages } from "@penta/chargematch";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";
import { ExpertToggle } from "./expert-toggle";

export function generateStaticParams() {
  return allChargematchPages()
    .filter((p) => p.family === "can-charger-charge")
    .map((p) => {
      const parts = p.url.split("/").filter(Boolean);
      return { device: parts[1], charger: parts[3] };
    });
}

export async function generateMetadata({ params }: { params: Promise<{ device: string; charger: string }> }) {
  const { device, charger } = await params;
  const page = allChargematchPages().find((p) => p.url === `/chargematch/${device}/with/${charger}`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function PairPage({ params }: { params: Promise<{ device: string; charger: string }> }) {
  const { device: dSlug, charger: cSlug } = await params;
  const device = getDevice(dSlug);
  const charger = getCharger(cSlug);
  if (!device || !charger) notFound();
  const result = compatibility(device, charger, CABLES[0]);
  const alloc = charger.allocations;
  return (
    <main>
      <Link href={`/chargematch/${device.slug}`} className="text-sm">
        {device.name}
      </Link>
      <p className="cm-mono mt-4 text-sm">{result.tag.replaceAll("_", " ")}</p>
      <h1 className="mt-2 text-4xl md:text-5xl">{result.match}</h1>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="cm-box p-4">
          <dt className="text-sm">Compatible</dt>
          <dd className="cm-mono mt-1 text-2xl">{result.compatible ? "YES" : "NO"}</dd>
        </div>
        <div className="cm-box p-4">
          <dt className="text-sm">Fast charging</dt>
          <dd className="cm-mono mt-1 text-2xl">{result.fast ? "YES" : "NO"}</dd>
        </div>
        <div className="cm-box p-4">
          <dt className="text-sm">Expected max</dt>
          <dd className="cm-mono mt-1 text-2xl">{result.max_power ?? "—"} W</dd>
        </div>
        <div className="cm-box p-4">
          <dt className="text-sm">Best port</dt>
          <dd className="cm-mono mt-1 text-2xl">{result.best_port}</dd>
        </div>
        <div className="cm-box p-4">
          <dt className="text-sm">Cable</dt>
          <dd className="cm-mono mt-1 text-2xl">{result.cable_ok ? "OK" : "LIMIT"}</dd>
        </div>
        <div className="cm-box p-4">
          <dt className="text-sm">Bottleneck</dt>
          <dd className="mt-1">{result.bottleneck}</dd>
        </div>
      </dl>
      <section className="mt-10 cm-box p-5">
        <p className="cm-mono text-sm">{device.name}</p>
        <p className="cm-mono my-2 text-2xl">↓ {result.max_power ?? "?"} W</p>
        <p className="cm-mono">{charger.name}</p>
        <ul className="mt-4 grid gap-1 text-sm">
          {alloc.map((a) => (
            <li key={a.ports.join("+")} className="cm-mono">
              {a.ports.join(" + ")}: {a.watts.map((w, i) => `${a.ports[i]} ${w}W`).join(" · ")}
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-6 max-w-xl leading-7">{result.explanation} Wattage is negotiated, not measured, unless a lab row exists.</p>
      <ExpertToggle chargerName={charger.name} pd={charger.pd_version} ports={charger.ports} />
      <Link className="cm-cta mt-8 inline-block" href="/chargematch/kit">
        Add to My Power Kit
      </Link>
      <div className="mt-10">
        <Feedback site="chargematch" />
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, allAutospecPages, getVehicle, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  const topics = ["oil", "tyres", "battery", "maintenance", "problems"];
  return VEHICLES.flatMap((v) =>
    topics
      .filter((t) => !(t === "oil" && v.oil.capacity_liters === 0))
      .map((topic) => ({
        make: v.make_slug,
        model: v.model_slug,
        gen: v.generation_slug,
        variant: v.variant_slug,
        topic,
      })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string; gen: string; variant: string; topic: string }>;
}) {
  const { make, model, gen, variant, topic } = await params;
  const v = getVehicle(make, model, gen, variant);
  if (!v) return {};
  const page = allAutospecPages().find((p) => p.url === vehicleUrl(v, topic));
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ make: string; model: string; gen: string; variant: string; topic: string }>;
}) {
  const { make, model, gen, variant, topic } = await params;
  const v = getVehicle(make, model, gen, variant);
  if (!v) notFound();
  return (
    <main>
      <Link href={vehicleUrl(v)} className="text-sm">
        {v.make} {v.generation} {v.variant}
      </Link>
      <h1 className="mt-4 text-5xl capitalize">{topic}</h1>
      {topic === "oil" ? (
        <section className="mt-8 as-panel p-6">
          <p className="text-3xl">{v.oil.viscosity}</p>
          <p className="mt-2">{v.oil.spec}</p>
          <p className="mt-2 text-lg">{v.oil.capacity_liters} L {v.oil.with_filter ? "with filter" : ""}</p>
          <p className="mt-3 text-sm leading-6">Market may affect this specification. Scope on file: {v.market.join(", ")}.</p>
        </section>
      ) : null}
      {topic === "tyres" ? (
        <section className="mt-8 as-panel p-6">
          <p>
            {v.tyres.front} / {v.tyres.rear}
          </p>
          <p className="mt-2 text-3xl">
            {v.tyres.pressure_bar_front} / {v.tyres.pressure_bar_rear} bar
          </p>
        </section>
      ) : null}
      {topic === "battery" ? (
        <section className="mt-8 as-panel p-6">
          <p className="text-3xl">{v.battery.type}</p>
          {v.battery.ah ? <p className="mt-2">{v.battery.ah} Ah class</p> : null}
        </section>
      ) : null}
      {topic === "maintenance" ? (
        <ul className="mt-8 grid gap-3">
          {v.services.map((s) => (
            <li key={s.id} className="as-panel p-4">
              <p>{s.name}</p>
              <p className="text-sm">
                {s.interval_km.toLocaleString()} km / {s.interval_months} months {s.spec ?? ""}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {topic === "problems" ? (
        <ul className="mt-8 grid gap-3">
          {v.issues.map((i) => (
            <li key={i.id} className="as-panel p-4">
              <p>{i.title}</p>
              <p className="mt-2 text-sm leading-6">{i.summary}</p>
              <p className="mt-2 text-sm">{i.when_to_stop}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Link className="as-cta mt-10 inline-block" href={`/autospec/garage?make=${make}&model=${model}&gen=${gen}&var=${variant}`}>
        Add to My Garage
      </Link>
    </main>
  );
}

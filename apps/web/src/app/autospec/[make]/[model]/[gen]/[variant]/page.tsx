import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, allAutospecPages, getVehicle, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";

export function generateStaticParams() {
  return VEHICLES.map((v) => ({
    make: v.make_slug,
    model: v.model_slug,
    gen: v.generation_slug,
    variant: v.variant_slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string; gen: string; variant: string }>;
}) {
  const { make, model, gen, variant } = await params;
  const page = allAutospecPages().find((p) => p.url === vehicleUrl(getVehicle(make, model, gen, variant)!));
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function VehicleHub({
  params,
}: {
  params: Promise<{ make: string; model: string; gen: string; variant: string }>;
}) {
  const { make, model, gen, variant } = await params;
  const v = getVehicle(make, model, gen, variant);
  if (!v) notFound();
  const topics = ["oil", "tyres", "battery", "maintenance", "problems"].filter(
    (t) => !(t === "oil" && v.oil.capacity_liters === 0),
  );
  return (
    <main>
      <p className="text-xs tracking-[0.18em] uppercase">
        {v.make} · {v.generation} · {v.engine_code}
      </p>
      <h1 className="mt-4 text-5xl md:text-6xl">
        {v.make} {v.model} {v.variant}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8">
        {v.years[0]}–{v.years.at(-1)} marketing years share this engine/generation. They are not split into thin year URLs. Market on file: {v.market.join(", ")}. Market may affect this specification.
      </p>
      <Link
        href={`/autospec/garage?make=${v.make_slug}&model=${v.model_slug}&gen=${v.generation_slug}&var=${v.variant_slug}`}
        className="as-cta mt-8 inline-block"
      >
        Add to My Garage
      </Link>
      <dl className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="as-panel p-5">
          <dt className="text-sm">Oil</dt>
          <dd className="mt-2 text-2xl">{v.oil.capacity_liters ? `${v.oil.capacity_liters} L` : "EV — none"}</dd>
          <dd className="mt-1 text-sm">{v.oil.spec}</dd>
        </div>
        <div className="as-panel p-5">
          <dt className="text-sm">Tyres</dt>
          <dd className="mt-2 text-2xl">{v.tyres.pressure_bar_front} bar</dd>
          <dd className="mt-1 text-sm">{v.tyres.front}</dd>
        </div>
        <div className="as-panel p-5">
          <dt className="text-sm">Battery</dt>
          <dd className="mt-2 text-2xl">{v.battery.type}</dd>
        </div>
      </dl>
      <ul className="mt-8 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={topic}>
            <Link className="as-panel px-3 py-2 text-sm" href={`${vehicleUrl(v)}/${topic}`}>
              {topic}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <Feedback site="autospec" />
      </div>
    </main>
  );
}

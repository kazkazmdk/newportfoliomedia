import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, allAutospecPages, getVehicle, serviceIntervalLabel, typicalServiceInterval, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";
import { CockpitCell } from "../../../../components/cockpit-cell";
import { IdentityStrip } from "../../../../components/identity-strip";
import { OwnershipTimeline } from "../../../../components/ownership-timeline";
import { VehicleStage } from "../../../../components/vehicle-stage";

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
  const typical = typicalServiceInterval(v);
  return (
    <main>
      <section className="as-hero">
        <div className="as-hero-copy">
          <p className="as-eyebrow">
            {v.make} · {v.generation} · {v.engine_code}
          </p>
          <h1>
            {v.make} {v.model}
            <br />
            {v.variant}
          </h1>
          <p className="as-hero-index">
            {v.generation} · {v.engine_code} · {v.years[0]}–{v.years.at(-1)}
          </p>
          <div className="as-cockpit">
            <CockpitCell
              label="Typical service interval"
              value={typical ? serviceIntervalLabel(typical) : "No interval on file"}
              provenance="Graph interval · no mileage entered"
            />
            <CockpitCell
              label="Oil"
              value={v.oil.capacity_liters ? `${v.oil.spec} · ${v.oil.capacity_liters} L` : "EV — none"}
              provenance="Graph specification"
            />
            <CockpitCell label="Tyres" value={v.tyres.front} provenance="Graph fitment" />
            <CockpitCell label="Battery" value={`12V ${v.battery.type}`} provenance="Graph reference" />
            <CockpitCell
              label="Recalls"
              value={v.recalls.length ? "VIN-specific · check source" : "No active data / check source"}
              provenance="Official portal required"
            />
          </div>
          <p className="as-cockpit-truth">Reference cockpit · no live vehicle connection · unknown values remain unknown.</p>
          <Link href={`/autospec/garage?make=${v.make_slug}&model=${v.model_slug}&gen=${v.generation_slug}&var=${v.variant_slug}`} className="as-cta as-cta-arrow">
            Add to My Garage <span aria-hidden>↗</span>
          </Link>
        </div>
        <VehicleStage makeSlug={v.make_slug} generationSlug={v.generation_slug} identity={`${v.make} ${v.variant} ${v.generation}`} />
      </section>
      <IdentityStrip vehicle={v} />
      <section className="as-scene grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]">Engine</p>
          <p className="as-display mt-3 text-5xl">{v.oil.capacity_liters ? `${v.oil.capacity_liters} L` : "EV — none"}</p>
          <p className="mt-2">{v.oil.spec}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]">Tyres</p>
          <p className="as-display mt-3 text-5xl">{v.tyres.pressure_bar_front} bar</p>
          <p className="mt-2">{v.tyres.front}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]">Battery</p>
          <p className="as-display mt-3 text-5xl">{v.battery.type}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]">Service interval</p>
          <div className="mt-4">
            <OwnershipTimeline items={v.services} mode="interval" />
          </div>
        </div>
      </section>
      <section className="as-scene">
        <p className="text-[11px] uppercase tracking-[0.2em]">Inspect</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {topics.map((topic) => (
            <li key={topic}>
              <Link className="as-add" href={`${vehicleUrl(v)}/${topic}`}>
                {topic}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <Feedback site="autospec" />
        </div>
      </section>
    </main>
  );
}

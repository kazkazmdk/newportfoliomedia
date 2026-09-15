import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, VIN_SUPPORT, allAutospecPages, fitmentScopeOf, getVehicle, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
import { IdentityStrip } from "../../../../../components/identity-strip";
import { VehicleStage } from "../../../../../components/vehicle-stage";

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
  const scope = fitmentScopeOf(v);
  const focus = topic === "oil" || topic === "maintenance" ? "engine" : topic === "tyres" ? "tyres" : topic === "battery" ? "battery" : "service";
  return (
    <main>
      <section className="as-hero">
        <div>
          <Link href={vehicleUrl(v)} className="text-[11px] uppercase tracking-[0.18em]">
            {v.make} {v.generation} {v.variant}
          </Link>
          <h1 className="mt-4 text-6xl capitalize">{topic}</h1>
          <aside className="mt-6 max-w-xl text-sm leading-6">
            <p className="uppercase tracking-[0.14em]">Fitment scope · {scope.confidence}</p>
            <p className="mt-2">
              {scope.make} {scope.model}
              {scope.generation ? ` · generation ${scope.generation}` : ""}
              {scope.engineCode ? ` · engine ${scope.engineCode}` : " · engine UNKNOWN"}
              {scope.yearFrom ? ` · years ${scope.yearFrom}–${scope.yearTo}` : ""}
              {scope.market?.length ? ` · market ${scope.market.join("/")}` : " · market UNKNOWN"}
              {scope.trim?.length ? ` · trim ${scope.trim.join("/")}` : ""}
              {scope.wheelConfig ? ` · wheel ${scope.wheelConfig}` : ""}
            </p>
            <p className="mt-2 text-[var(--as-mute)]">
              Confidence {scope.confidence} · verification UNVERIFIED. EXACT is not VERIFIED.
              Required: {scope.requiredDimensions.join(", ")}. Missing: {scope.missingDimensions.join(", ") || "none"}.
              VIN decode is {VIN_SUPPORT}.
            </p>
          </aside>
        </div>
        <VehicleStage focus={focus} />
      </section>
      <IdentityStrip vehicle={v} />
      <section className="as-scene">
        {topic === "oil" ? (
          <>
            <p className="as-display text-6xl">{v.oil.viscosity}</p>
            <p className="mt-3 text-2xl">{v.oil.spec}</p>
            <p className="mt-2 text-lg">{v.oil.capacity_liters} L {v.oil.with_filter ? "with filter" : ""}</p>
            <p className="mt-3 text-sm leading-6">Market may affect this specification. Scope on file: {v.market.join(", ")}.</p>
          </>
        ) : null}
        {topic === "tyres" ? (
          <>
            <p>
              {v.tyres.front} / {v.tyres.rear}
            </p>
            <p className="as-display mt-3 text-6xl">
              {v.tyres.pressure_bar_front} / {v.tyres.pressure_bar_rear} bar
            </p>
          </>
        ) : null}
        {topic === "battery" ? (
          <>
            <p className="as-display text-6xl">{v.battery.type}</p>
            {v.battery.ah ? <p className="mt-2">{v.battery.ah} Ah class</p> : null}
          </>
        ) : null}
        {topic === "maintenance" ? (
          <ul className="grid gap-3">
            {v.services.map((s) => (
              <li key={s.id} className="border-b border-[var(--as-line)] py-4">
                <p>{s.name}</p>
                <p className="text-sm">
                  {s.interval_km.toLocaleString()} km / {s.interval_months} months {s.spec ?? ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {topic === "problems" ? (
          <ul className="grid gap-3">
            {v.issues.map((i) => (
              <li key={i.id} className="border-b border-[var(--as-line)] py-4">
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
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, MONTHS, allWeartherePages, capsuleFor, indexedMonths } from "@penta/wearthere";
import { classifyClimateModel, seasonLabel } from "@penta/demand";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";

export function generateStaticParams() {
  return DESTINATIONS.flatMap((d) =>
    indexedMonths(d).map((m) => ({ city: d.slug, month: MONTHS[m - 1] })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params;
  const page = allWeartherePages().find((p) => p.url === `/wearthere/${city}/${month}/what-to-wear`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function WearMonthPage({ params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  const monthIdx = MONTHS.indexOf(month) + 1;
  if (!dest || monthIdx < 1) notFound();
  const w = dest.climate[monthIdx - 1];
  const cap = capsuleFor(dest, monthIdx, "classic");
  const model = classifyClimateModel({
    lat: dest.lat,
    months: dest.climate.map((m) => ({ month: m.month, tmax: m.tmax_c, tmin: m.tmin_c, rain_mm: m.rain_mm })),
  });
  const season = seasonLabel(model, monthIdx);
  const skip = cap.pieces.filter((p) => p.warmth >= 5 && w.tmax_c >= 22).map((p) => p.name);
  return (
    <main>
      <p className="text-sm tracking-[0.16em] uppercase text-[#8a4b32]">
        Typical {month} climate — {model.replaceAll("_", " ").toLowerCase()} / {season} — not a forecast
      </p>
      <h1 className="mt-3 text-5xl md:text-6xl">
        What to Wear in {dest.city} in {month[0].toUpperCase() + month.slice(1)}
      </h1>
      <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <article className="wt-card p-6">
          <p className="text-sm tracking-[0.14em] uppercase text-[#8a4b32]">Typical {month[0].toUpperCase() + month.slice(1)} climate</p>
          <p className="mt-3 font-[family-name:var(--font-wt-serif)] text-5xl">
            {w.tmin_c}–{w.tmax_c}°C
          </p>
          <p className="mt-3 text-lg">Range, not today / tomorrow</p>
          <p className="mt-2">About {w.rain_days} rain days · {w.rain_mm} mm monthly normal</p>
          <p className="mt-3 text-sm leading-6">
            Historical climate for the month. No hourly forecast on this public page. Exact trip dates stay private.
          </p>
        </article>
        <article className="wt-card p-6">
          <p className="text-sm">Capsule · packing-v1</p>
          <p className="mt-2 font-[family-name:var(--font-wt-serif)] text-4xl">{cap.pieces.length} pieces</p>
          <p>{cap.outfits} outfits · weather coverage {cap.coverage.weather_coverage}%</p>
          <p className="mt-2 text-sm">Activity coverage {cap.coverage.activity_coverage}%</p>
        </article>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cap.pieces.map((p) => (
          <li key={p.id} className="wt-card p-4">
            <p className="font-[family-name:var(--font-wt-serif)] text-2xl">{p.name}</p>
            <p className="mt-2 text-sm leading-6">
              warmth {p.warmth} · rain {p.water_resistance} · wind {p.wind_resistance} · {p.layer}
            </p>
          </li>
        ))}
      </ul>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">Climate fact</p>
          <p className="mt-2 leading-7">
            Compiled monthly normals for {dest.city}. {w.tmin_c}–{w.tmax_c}°C, {w.rain_mm} mm, ~{w.rain_days} rain days.
          </p>
        </article>
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">Derived packing rule</p>
          <p className="mt-2 leading-7">
            Base / mid / shell from those normals. Not a live forecast. Season model: {model}.
          </p>
        </article>
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">Editorial styling</p>
          <p className="mt-2 leading-7">
            Classic capsule only. Colour and “look” are taste, not climate truth.
          </p>
        </article>
      </section>
      {skip.length ? (
        <section className="mt-8">
          <h2 className="text-3xl">What not to pack</h2>
          <p className="mt-2 max-w-lg leading-7">{skip.join(", ")}</p>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="text-3xl">By activity</h2>
        <p className="mt-2 max-w-lg leading-7">
          {dest.activities_default.join(", ")}. Weather safety stays ahead of style: rain still gets a shell.
        </p>
      </section>
      <Link className="wt-cta mt-8 inline-block" href={`/wearthere/trip?city=${city}&start=2026-10-12&end=2026-10-17&style=classic`}>
        Travelling on exact dates? Build my packing list
      </Link>
      <div className="mt-10">
        <Feedback site="wearthere" />
      </div>
    </main>
  );
}

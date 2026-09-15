import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  allWeartherePages,
  capsuleFor,
  climateModelOf,
  destinationSurfaces,
  resolveWearPeriod,
} from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";

export function generateStaticParams() {
  return DESTINATIONS.flatMap((d) =>
    destinationSurfaces(d).map((s) => ({ city: d.slug, month: s.slug })),
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

export default async function WearPeriodPage({ params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  if (!dest) notFound();
  const resolved = resolveWearPeriod(dest, month);
  if (!resolved) notFound();
  const w = resolved.climate;
  const cap = capsuleFor(dest, resolved.representativeMonth, "classic");
  const model = climateModelOf(dest);
  const skip = cap.pieces.filter((p) => p.warmth >= 5 && w.tmax_c >= 22).map((p) => p.name);
  const label = resolved.surface.label;
  return (
    <main>
      <p className="text-sm tracking-[0.16em] uppercase text-[#8a4b32]">
        Typical {label} climate — {model.replaceAll("_", " ").toLowerCase()} — compiled normals, not a forecast
      </p>
      <h1 className="mt-3 text-5xl md:text-6xl">
        What to Wear in {dest.city} in {label[0].toUpperCase() + label.slice(1)}
      </h1>
      <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <article className="wt-card p-6">
          <p className="text-sm tracking-[0.14em] uppercase text-[#8a4b32]">Typical climate</p>
          <p className="mt-3 font-[family-name:var(--font-wt-serif)] text-5xl">
            {w.tmin_c}–{w.tmax_c}°C
          </p>
          <p className="mt-3 text-lg">Range, not today / tomorrow</p>
          <p className="mt-2">About {w.rain_days} rain days · {w.rain_mm} mm</p>
          <p className="mt-3 text-sm leading-6">
            Source: compiled monthly normals (DATASET_GENERAL). No station ID, no official dataset API locator. Period labelled 1991–2020 in-repo only.
          </p>
        </article>
        <article className="wt-card p-6">
          <p className="text-sm">Packing decision</p>
          <p className="mt-2 font-[family-name:var(--font-wt-serif)] text-4xl">{cap.pieces.length} pieces</p>
          <p>{cap.outfits} outfits · weather coverage {cap.coverage.weather_coverage}%</p>
        </article>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cap.pieces.map((p) => (
          <li key={p.id} className="wt-card p-4">
            <p className="font-[family-name:var(--font-wt-serif)] text-2xl">{p.name}</p>
            <p className="mt-2 text-sm leading-6">
              warmth {p.warmth} · rain {p.water_resistance} · {p.layer}
            </p>
          </li>
        ))}
      </ul>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">Climate source</p>
          <p className="mt-2 leading-7">Compiled in-repo normals. Not TRUSTED_DATASET_EXACT. Season model: {model}.</p>
        </article>
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">Packing decision</p>
          <p className="mt-2 leading-7">Base / mid / shell from those normals. Not a live forecast.</p>
        </article>
        <article className="wt-card p-5">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">What not to pack</p>
          <p className="mt-2 leading-7">{skip.length ? skip.join(", ") : "No heavy layers flagged for this period."}</p>
        </article>
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, MONTHS, allWeartherePages, capsuleFor } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";

export function generateStaticParams() {
  const months = [3, 4, 5, 6, 7, 9, 10, 11];
  return DESTINATIONS.flatMap((d) => months.map((m) => ({ city: d.slug, month: MONTHS[m - 1] })));
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
  return (
    <main>
      <p className="text-sm tracking-[0.16em] uppercase text-[#8a4b32]">Typical weather — not a forecast</p>
      <h1 className="mt-3 text-5xl md:text-6xl">
        What to Wear in {dest.city} in {month[0].toUpperCase() + month.slice(1)}
      </h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="wt-card p-6 md:col-span-2">
          <p className="font-[family-name:var(--font-wt-serif)] text-5xl">
            {w.tmin_c}–{w.tmax_c}°C
          </p>
          <p className="mt-3">About {w.rain_days} rain days · {w.rain_mm} mm</p>
          <p className="mt-2 text-sm leading-6">
            Historical climate for the month. If you already have dates, build a packing list from the actual forecast when it exists.
          </p>
        </article>
        <article className="wt-card p-6">
          <p className="text-sm">Capsule</p>
          <p className="mt-2 font-[family-name:var(--font-wt-serif)] text-4xl">{cap.pieces.length} pieces</p>
          <p>{cap.outfits} outfits</p>
        </article>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cap.pieces.map((p) => (
          <li key={p.id} className="wt-card p-4">
            <p className="font-[family-name:var(--font-wt-serif)] text-2xl">{p.name}</p>
          </li>
        ))}
      </ul>
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

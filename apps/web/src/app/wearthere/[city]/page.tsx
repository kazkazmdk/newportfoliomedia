import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, MONTHS } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ city: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  if (!dest) return {};
  return pageMeta({
    title: `What to wear in ${dest.city}`,
    description: `Month-by-month typical weather and capsules for ${dest.city}.`,
    canonical: `/wearthere/${city}`,
  });
}

export default async function CityHub({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  if (!dest) notFound();
  return (
    <main>
      <h1 className="text-6xl">{dest.city}</h1>
      <p className="mt-3 max-w-lg text-lg">{dest.country}. Typical climate, then exact dates.</p>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {dest.climate.map((m) => (
          <li key={m.month}>
            <Link className="wt-card block p-4" href={`/wearthere/${city}/${MONTHS[m.month - 1]}/what-to-wear`}>
              <p className="capitalize">{MONTHS[m.month - 1]}</p>
              <p className="mt-2 text-2xl font-[family-name:var(--font-wt-serif)]">
                {m.tmin_c}–{m.tmax_c}°
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

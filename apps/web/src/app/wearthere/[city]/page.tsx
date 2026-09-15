import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, climateModelOf, destinationSurfaces } from "@penta/wearthere";
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
    description: `Typical climate and packing for ${dest.city}, consolidated by season when months do not change the decision.`,
    canonical: `/wearthere/${city}`,
  });
}

export default async function CityHub({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  if (!dest) notFound();
  const model = climateModelOf(dest);
  const surfaces = destinationSurfaces(dest);
  return (
    <main>
      <h1 className="text-6xl">{dest.city}</h1>
      <p className="mt-3 max-w-lg text-lg">
        {dest.country}. Climate model: {model.replaceAll("_", " ").toLowerCase()}. Compiled monthly normals — not a forecast.
      </p>
      {surfaces.length === 0 ? (
        <article className="wt-card mt-10 max-w-xl p-6">
          <p className="text-sm uppercase tracking-[0.14em] text-[#8a4b32]">City guide only</p>
          <p className="mt-3 leading-7">
            Equatorial / year-round climate. Twelve near-identical month pages are not generated. Pack for heat and rain, then use exact dates privately.
          </p>
        </article>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {surfaces.map((surface) => (
            <li key={surface.slug}>
              <Link className="wt-card block p-4" href={`/wearthere/${city}/${surface.slug}/what-to-wear`}>
                <p className="capitalize">{surface.label}</p>
                <p className="mt-2 text-sm">{surface.kind === "season" ? "Season page" : "Month page"}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

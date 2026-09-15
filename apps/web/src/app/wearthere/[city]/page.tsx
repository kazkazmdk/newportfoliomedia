import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, capsuleFor, climateModelOf, destinationSurfaces, typicalWeather } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { ClimateRibbon } from "../components/climate-ribbon";
import { DestinationHero } from "../components/destination-hero";
import { WardrobeBoard } from "../components/wardrobe-board";
import { climateCopy, climateMood } from "../components/climate-theme";

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
  const weather = typicalWeather(dest, dest.climate[0]?.month ?? 1);
  const cap = capsuleFor(dest, dest.climate[0]?.month ?? 1, "classic");
  const mood = climateMood(weather, dest.slug);
  return (
    <main>
      <DestinationHero initialCity={dest.slug} />
      <ClimateRibbon weather={weather} />
      <ViewportScene className="wt-scene">
        <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">Scene 02 · climate rhythm</p>
        <p className="wt-serif mt-4 max-w-2xl text-5xl leading-none">{climateCopy(mood)}</p>
        <p className="mt-5 max-w-lg leading-7 opacity-80">
          {dest.country}. Climate model: {model.replaceAll("_", " ").toLowerCase()}. Compiled monthly normals — not a forecast.
        </p>
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">Scene 04 · capsule</p>
        <WardrobeBoard pieces={cap.pieces} />
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">Scene 07 · periods</p>
        {surfaces.length === 0 ? (
          <p className="mt-6 max-w-xl text-2xl leading-snug">
            Equatorial / year-round climate. Twelve near-identical month pages are not generated. Pack for heat and rain, then use exact dates privately.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-8 md:grid-cols-4">
            {surfaces.map((surface) => (
              <li key={surface.slug}>
                <Link className="block border-b border-white/15 py-4" href={`/wearthere/${city}/${surface.slug}/what-to-wear`}>
                  <p className="wt-serif text-3xl capitalize">{surface.label}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] opacity-70">
                    {surface.kind === "season" ? "Season page" : "Month page"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ViewportScene>
    </main>
  );
}

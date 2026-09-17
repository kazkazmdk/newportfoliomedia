import { notFound } from "next/navigation";
import { DESTINATIONS, capsuleFor, climateModelOf, typicalWeather } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { ClimateRibbon } from "../components/climate-ribbon";
import { DestinationHero } from "../components/destination-hero";
import { SeasonRail } from "../components/season-rail";
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
  const weather = typicalWeather(dest, dest.climate[0]?.month ?? 1);
  const cap = capsuleFor(dest, dest.climate[0]?.month ?? 1, "classic");
  const mood = climateMood(weather, dest.slug);
  return (
    <main>
      <DestinationHero initialCity={dest.slug} />
      <ClimateRibbon weather={weather} />
      <ViewportScene className="wt-scene wt-editorial-intro">
        <p className="wt-kicker">Reading {dest.city}</p>
        <p className="wt-serif mt-4 max-w-3xl text-5xl leading-none md:text-7xl">{climateCopy(mood)}</p>
        <p className="mt-5 max-w-lg leading-7 opacity-80">
          {dest.country}. Climate model: {model.replaceAll("_", " ").toLowerCase()}. Compiled monthly normals — not a forecast.
        </p>
      </ViewportScene>
      <ViewportScene className="wt-scene wt-season-section">
        <SeasonRail dest={dest} />
      </ViewportScene>
      <ViewportScene className="wt-scene wt-capsule-section" id="capsule">
        <p className="wt-kicker">First-period capsule</p>
        <h2 className="wt-serif mt-4 max-w-2xl text-5xl leading-none">Every recommendation shows its job.</h2>
        <div className="mt-10">
          <WardrobeBoard pieces={cap.pieces} weather={weather} activities={dest.activities_default} />
        </div>
      </ViewportScene>
    </main>
  );
}

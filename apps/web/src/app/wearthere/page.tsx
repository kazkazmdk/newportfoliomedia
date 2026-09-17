import Link from "next/link";
import { DESTINATIONS, capsuleFor, typicalWeather } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { Marquee, ViewportScene } from "@/components/creative";
import { ClimateRibbon } from "./components/climate-ribbon";
import { DestinationHero } from "./components/destination-hero";
import { ClimateSlider } from "./components/climate-slider";
import { SeasonRail } from "./components/season-rail";
import { WardrobeBoard } from "./components/wardrobe-board";

export const metadata = pageMeta({
  title: "WearThere — Where are you going?",
  description: "Destination, dates, typical climate or forecast, then a capsule you can actually pack.",
  canonical: "/wearthere",
});

export default function WearthereHome() {
  const featured = DESTINATIONS.find((d) => d.slug === "tokyo") ?? DESTINATIONS[0];
  const weather = typicalWeather(featured, 11);
  const capsule = capsuleFor(featured, 11, "classic");
  const cities = [...DESTINATIONS].sort((a, b) => b.demand - a.demand);
  return (
    <main>
      <DestinationHero initialCity={featured.slug} />
      <ClimateRibbon weather={weather} />
      <ViewportScene className="wt-scene wt-capsule-section" id="capsule">
        <div className="wt-section-heading">
          <div>
            <p className="wt-kicker">Your {featured.city} edit · typical November</p>
            <h2 className="mt-4 max-w-2xl text-5xl leading-none md:text-7xl">A small wardrobe, with a reason for every piece.</h2>
          </div>
          <dl className="wt-capsule-stats">
            <div><dt>Pieces</dt><dd>{capsule.pieces.length}</dd></div>
            <div><dt>Outfits</dt><dd>{capsule.outfits}</dd></div>
            <div><dt>Weather coverage</dt><dd>{capsule.coverage.weather_coverage}%</dd></div>
          </dl>
        </div>
        <div className="mt-10">
          <WardrobeBoard pieces={capsule.pieces} weather={weather} activities={featured.activities_default} />
        </div>
      </ViewportScene>
      <ViewportScene className="wt-scene wt-season-section">
        <SeasonRail dest={featured} />
      </ViewportScene>
      <ClimateSlider dest={featured} />
      <ViewportScene id="destinations" className="wt-scene">
        <p className="wt-kicker">Destination index</p>
        <h2 className="wt-serif mt-4 max-w-2xl text-5xl leading-none">Choose a climate, then make it yours.</h2>
        <Marquee className="mt-6 text-5xl">
          {cities.map((d) => (
            <Link key={d.id} href={`/wearthere/${d.slug}`} className="wt-serif">
              {d.city}
            </Link>
          ))}
        </Marquee>
        <ul className="mt-12 grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
          {cities.map((d) => (
            <li key={d.id}>
              <Link href={`/wearthere/${d.slug}`} className="flex items-baseline justify-between border-b border-white/15 py-3">
                <span className="wt-serif text-2xl">{d.city}</span>
                <span className="text-xs uppercase tracking-[0.16em] opacity-70">{d.country}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ViewportScene>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { DESTINATIONS, capsuleFor, typicalWeather } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { destinationMedia } from "@/lib/media-catalog";
import { DestinationHero } from "./components/destination-hero";
import { WardrobeBoard } from "./components/wardrobe-board";
import { climateMood } from "./components/climate-theme";

export const metadata = pageMeta({
  title: "WearThere — Where are you going?",
  description: "Destination, dates, typical climate or forecast, then a capsule you can actually pack.",
  canonical: "/wearthere",
});

const FAMILIES: Array<{ id: string; label: string; match: string[] }> = [
  { id: "cool", label: "Cool / dry", match: ["cool", "polar"] },
  { id: "mild", label: "Mild city", match: ["mild"] },
  { id: "humid", label: "Humid", match: ["humid"] },
  { id: "sun", label: "Hot / bright", match: ["sun"] },
  { id: "rain", label: "Rain-led", match: ["rain"] },
];

export default function WearthereHome() {
  const featured = DESTINATIONS.find((d) => d.slug === "tokyo") ?? DESTINATIONS[0];
  const weather = typicalWeather(featured, 11);
  const capsule = capsuleFor(featured, 11, "classic");
  const cities = [...DESTINATIONS].sort((a, b) => b.demand - a.demand);
  return (
    <main>
      <DestinationHero initialCity={featured.slug} />
      <ViewportScene className="wt-scene wt-capsule-section" id="capsule">
        <div className="wt-section-heading">
          <div>
            <p className="wt-kicker">Your {featured.city} edit · typical November</p>
            <h2 className="mt-4 max-w-2xl text-5xl leading-none md:text-7xl">A small wardrobe, with a reason for every piece.</h2>
          </div>
        </div>
        <div className="mt-10">
          <WardrobeBoard pieces={capsule.pieces} weather={weather} activities={featured.activities_default} />
        </div>
      </ViewportScene>
      <ViewportScene id="destinations" className="wt-scene">
        <p className="wt-kicker">Climate atlas</p>
        <h2 className="wt-serif mt-4 max-w-2xl text-5xl leading-none">Move by weather family, not by continent.</h2>
        <div className="wt-atlas mt-10">
          {FAMILIES.map((family) => {
            const members = cities.filter((d) => family.match.includes(climateMood(typicalWeather(d, 11), d.slug)));
            if (!members.length) return null;
            return (
              <section key={family.id} className="wt-atlas-family">
                <p className="wt-kicker">{family.label}</p>
                <div className="wt-atlas-rail">
                  {members.slice(0, 8).map((d) => {
                    const media = destinationMedia(d.slug);
                    return (
                      <Link key={d.id} href={`/wearthere/${d.slug}`}>
                        <Image src={media.hero} alt={media.heroAlt} width={360} height={240} sizes="180px" />
                        <span className="wt-serif text-2xl">{d.city}</span>
                        <span className="wt-kicker">{d.country}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </ViewportScene>
    </main>
  );
}

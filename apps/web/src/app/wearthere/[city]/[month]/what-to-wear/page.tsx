import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DESTINATIONS,
  allWeartherePages,
  capsuleFor,
  destinationSurfaces,
  resolveWearPeriod,
} from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { Feedback } from "@/components/feedback";
import { ViewportScene } from "@/components/creative";
import { ClimateRibbon } from "../../../components/climate-ribbon";
import { DestinationHero } from "../../../components/destination-hero";
import { SeasonRail } from "../../../components/season-rail";
import { WardrobeBoard } from "../../../components/wardrobe-board";
import { climateCopy, climateMood } from "../../../components/climate-theme";

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
  const skip = cap.pieces.filter((p) => p.warmth >= 5 && w.tmax_c >= 22).map((p) => p.name);
  const label = resolved.surface.label;
  const mood = climateMood(w, dest.slug);
  return (
    <main>
      <DestinationHero initialCity={dest.slug} />
      <ClimateRibbon weather={w} />
      <ViewportScene className="wt-scene wt-editorial-intro">
        <p className="wt-kicker">
          Typical {label} · compiled climate normals
        </p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-none md:text-7xl">
          What to Wear in {dest.city} in {label[0].toUpperCase() + label.slice(1)}
        </h1>
        <p className="wt-serif mt-6 text-3xl">{climateCopy(mood)}</p>
      </ViewportScene>
      <ViewportScene className="wt-scene wt-season-section">
        <SeasonRail dest={dest} active={resolved.surface.slug} />
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="wt-kicker">How it typically feels</p>
        <p className="wt-serif mt-4 text-6xl">
          {w.tmin_c}–{w.tmax_c}°C
        </p>
        <p className="mt-4 max-w-lg leading-7 opacity-80">Range, not today / tomorrow. About {w.rain_days} rain days · {w.rain_mm} mm.</p>
      </ViewportScene>
      <ViewportScene className="wt-scene wt-capsule-section" id="capsule">
        <p className="wt-kicker">Your {dest.city} capsule · {cap.pieces.length} pieces · {cap.outfits} outfits</p>
        <h2 className="wt-serif mt-4 max-w-2xl text-5xl leading-none">Packed for a reason, not a trend.</h2>
        <div className="mt-10">
          <WardrobeBoard pieces={cap.pieces} weather={w} activities={dest.activities_default} />
        </div>
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="wt-kicker">Leave this behind</p>
        <p className="wt-serif mt-4 max-w-xl text-4xl leading-none">
          {skip.length ? skip.join(", ") : "No heavy layers flagged for this period."}
        </p>
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="wt-kicker">Climate source</p>
        <p className="mt-4 max-w-xl leading-7 opacity-80">
          Compiled monthly normals. No station ID, no official dataset API locator. Period labelled 1991–2020 in-repo only. Weather coverage {cap.coverage.weather_coverage}%.
        </p>
        <Link className="wt-cta mt-8 inline-block" href={`/wearthere/trip?city=${city}&start=2026-10-12&end=2026-10-17&style=classic`}>
          Exact dates · private capsule
        </Link>
        <div className="mt-10">
          <Feedback site="wearthere" />
        </div>
      </ViewportScene>
    </main>
  );
}

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
import { NextAction } from "@/components/next-action";
import { ViewportScene } from "@/components/creative";
import { ClimateRibbon } from "../../../components/climate-ribbon";
import { DestinationHero } from "../../../components/destination-hero";
import { SeasonRail } from "../../../components/season-rail";
import { WardrobeBoard } from "../../../components/wardrobe-board";

export function generateStaticParams() {
  return DESTINATIONS.flatMap((d) =>
    destinationSurfaces(d).map((s) => ({ city: d.slug, month: s.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params;
  const page = allWeartherePages().find((p) => p.url === `/wearthere/${city}/${month}/packing`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function PackingPage({ params }: { params: Promise<{ city: string; month: string }> }) {
  const { city, month } = await params;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  if (!dest) notFound();
  const resolved = resolveWearPeriod(dest, month);
  if (!resolved) notFound();
  const w = resolved.climate;
  const cap = capsuleFor(dest, resolved.representativeMonth, "classic");
  const skip = cap.pieces.filter((p) => p.warmth >= 5 && w.tmax_c >= 22).map((p) => p.name);
  const label = resolved.surface.label;
  const bag = w.tmax_c >= 24 && w.rain_days < 8 ? "Carry-on" : "Weekender or checked bag";
  return (
    <main>
      <DestinationHero initialCity={dest.slug} />
      <ClimateRibbon weather={w} />
      <ViewportScene className="wt-scene wt-editorial-intro">
        <p className="wt-kicker">Packing list · typical {label}</p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-none md:text-7xl">
          What to pack for {dest.city} in {label[0].toUpperCase() + label.slice(1)}
        </h1>
        <p className="wt-serif mt-6 text-3xl">{bag}. Quantities for a 5-night stay, not a live forecast.</p>
      </ViewportScene>
      <ViewportScene className="wt-scene wt-season-section">
        <SeasonRail dest={dest} active={resolved.surface.slug} />
      </ViewportScene>
      <ViewportScene className="wt-scene wt-capsule-section" id="capsule">
        <p className="wt-kicker">Suitcase · why each piece earns its place</p>
        <div className="mt-10">
          <WardrobeBoard pieces={cap.pieces} weather={w} activities={dest.activities_default} />
        </div>
      </ViewportScene>
      <ViewportScene className="wt-scene">
        <p className="wt-kicker">Leave this behind</p>
        <p className="wt-serif mt-4 max-w-xl text-4xl leading-none">
          {skip.length ? skip.join(", ") : "No heavy layers flagged for this period."}
        </p>
        <Link className="wt-cta mt-8 inline-block" href={`/wearthere/${city}/${month}/what-to-wear`}>
          Wear decision for the same period
        </Link>
        <div className="mt-10">
          <NextAction site="wearthere" entityId={dest.id} />
          <Feedback site="wearthere" entityId={dest.id} />
        </div>
      </ViewportScene>
    </main>
  );
}

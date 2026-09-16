import Link from "next/link";
import { VEHICLES, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import { vehicleMediaOf } from "@/lib/media-catalog";
import { GarageEntry } from "./garage-entry";
import { VehicleStage } from "./components/vehicle-stage";

export const metadata = pageMeta({
  title: "AutoSpec — What do you drive?",
  description: "Add your car. Oil, tyres, battery, service, recalls — one ownership copilot.",
  canonical: "/autospec",
});

export default function AutospecHome() {
  const featured = VEHICLES[0];
  return (
    <main>
      <section className="as-hero as-hero-onboard">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--as-mute)]">Digital garage</p>
          <h1 className="mt-5 text-5xl leading-[0.9] md:text-7xl">
            What do
            <br />
            you drive?
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[var(--as-mute)]">
            Search a make and generation we already cover. Oil, tyres, battery and service come from the vehicle graph — not a guessed VIN decode.
          </p>
          <GarageEntry />
        </div>
        <VehicleStage
          makeSlug={featured?.make_slug}
          generationSlug={featured?.generation_slug}
          identity={featured ? `${featured.make} ${featured.variant} ${featured.generation}` : undefined}
        />
      </section>
      <section className="as-scene">
        <p className="text-[11px] uppercase tracking-[0.2em]">Once the car is identified</p>
        <p className="as-display mt-4 max-w-xl text-4xl">My vehicle becomes an ownership state.</p>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--as-mute)]">
          Service interval, oil spec, tyre size, 12V battery, and recall portals. Nothing invented beyond the graph.
        </p>
        {featured ? (
          <Link className="as-cta mt-8 inline-block" href={vehicleUrl(featured)}>
            Open {featured.make} {featured.variant}
          </Link>
        ) : null}
      </section>
      <section className="as-scene" id="identities">
        <p className="text-[11px] uppercase tracking-[0.2em]">Covered identities</p>
        <p className="mt-3 max-w-lg text-sm text-[var(--as-mute)]">
          Discover after you know what AutoSpec does. These are generation/engine pages, not a catalogue home.
        </p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {VEHICLES.slice(0, 8).map((v) => (
            <li key={v.id}>
              <Link href={vehicleUrl(v)} className="as-tile">
                {vehicleMediaOf(v.make_slug, v.generation_slug) ? (
                  <Image
                    src={vehicleMediaOf(v.make_slug, v.generation_slug)!.src}
                    alt={`${v.make} ${v.model} ${v.generation}`}
                    width={640}
                    height={320}
                    sizes="(max-width: 800px) 100vw, 40vw"
                    className="as-tile-img"
                  />
                ) : null}
                <p className="text-[11px] uppercase tracking-[0.16em]">{v.generation} {v.engine_code}</p>
                <p className="as-display text-4xl">
                  {v.make}
                  <br />
                  {v.variant}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-[var(--as-mute)]">
          {VEHICLES.length > 8 ? `${VEHICLES.length - 8} more generation/engine pages. ` : ""}
          Other markets are not invented.
        </p>
      </section>
    </main>
  );
}

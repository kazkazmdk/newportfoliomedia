import Link from "next/link";
import { VEHICLES, VIN_SUPPORT, vehicleUrl } from "@penta/autospec";
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
      <section className="as-hero as-hero-onboard as-hero-identify">
        <div className="as-hero-copy">
          <p className="as-eyebrow">Identify your vehicle</p>
          <h1>
            What do
            <br />
            you drive?
          </h1>
          <p className="as-lede">
            Search a covered make, generation and engine. Oil, tyres, battery and official recall portals stay scoped to that identity. Reference data, not simulated live telemetry.
          </p>
          <GarageEntry />
          <div className="as-provenance-bar" aria-label="Data provenance">
            <span><b>Source</b> Vehicle graph</span>
            <span><b>State</b> Reference until you enter checks</span>
            <span><b>VIN</b> {VIN_SUPPORT} · no decode field</span>
          </div>
        </div>
        <VehicleStage
          makeSlug={featured?.make_slug}
          generationSlug={featured?.generation_slug}
          identity={featured ? `${featured.make} ${featured.variant} ${featured.generation}` : undefined}
        />
      </section>
      <section className="as-scene as-state-scene">
        <div className="as-section-heading">
          <p className="as-eyebrow">Ownership state model</p>
          <p className="as-display">One cockpit. Three levels of certainty.</p>
          <p>
            AutoSpec separates action from schedule and reference, so an unknown check never looks healthy by default.
          </p>
        </div>
        <ol className="as-state-grid">
          <li className="is-now">
            <span>01 / Now</span>
            <h2>Needs attention</h2>
            <p>Shown only when entered mileage or checks support an immediate state.</p>
          </li>
          <li className="is-soon">
            <span>02 / Soon</span>
            <h2>Coming by interval</h2>
            <p>Scheduled context based on mileage and the standard maintenance interval.</p>
          </li>
          <li className="is-reference">
            <span>03 / Reference</span>
            <h2>Know the specification</h2>
            <p>Vehicle-graph facts scoped to generation, variant, engine and market.</p>
          </li>
        </ol>
        {featured ? (
          <Link className="as-cta as-cta-arrow" href={vehicleUrl(featured)}>
            Explore a complete vehicle profile <span aria-hidden>↗</span>
          </Link>
        ) : null}
      </section>
      <section className="as-scene" id="identities">
        <div className="as-section-heading as-section-heading-row">
          <div>
            <p className="as-eyebrow">Covered identities</p>
            <p className="as-display">Built around the vehicle, not the catalogue.</p>
          </div>
          <p>
            Every destination below is a generation and engine page. Other markets are not invented.
          </p>
        </div>
        <ul className="as-vehicle-grid">
          {VEHICLES.slice(0, 8).map((v) => (
            <li key={v.id}>
              <Link href={vehicleUrl(v)} className="as-tile">
                <div className="as-tile-topline">
                  <span>Reference profile</span>
                  <span>{v.years[0]}–{v.years.at(-1)}</span>
                </div>
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
                <div>
                  <p className="as-tile-spec">{v.generation} · {v.engine_code}</p>
                  <p className="as-display">{v.make} {v.variant}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="as-coverage-note">
          {VEHICLES.length > 8 ? `${VEHICLES.length - 8} more generation/engine pages. ` : ""}
          Other markets are not invented.
        </p>
      </section>
    </main>
  );
}

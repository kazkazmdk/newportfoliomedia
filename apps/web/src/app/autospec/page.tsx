import Link from "next/link";
import { VEHICLES, VIN_SUPPORT, vehicleUrl } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
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
      <section className="as-cinema">
        <VehicleStage
          makeSlug={featured?.make_slug}
          generationSlug={featured?.generation_slug}
          identity={featured ? `${featured.make} ${featured.variant} ${featured.generation}` : undefined}
          spec={featured ? {
            engineCode: featured.engine_code,
            oilLiters: featured.oil.capacity_liters,
            oilSpec: featured.oil.spec,
            tyreFront: featured.tyres.front,
            tyreRear: featured.tyres.rear,
            batteryType: featured.battery.type,
            serviceLabel: "Interval on file",
          } : undefined}
        />
        <div className="as-cinema-copy">
          <p className="as-eyebrow">Identify</p>
          <h1>{featured ? `${featured.make} ${featured.variant}` : "What do you drive?"}</h1>
          <p className="as-lede">
            {featured ? `${featured.generation} · ${featured.engine_code}` : "Search a covered identity."}
          </p>
          <GarageEntry />
          <details className="as-source">
            <summary>Data & source</summary>
            <p>Vehicle graph · reference until you enter checks · VIN {VIN_SUPPORT} · no decode field · no telemetry.</p>
          </details>
        </div>
      </section>
      <section className="as-scene as-layer-scene">
        <div className="as-own-split">
          <div>
            <p className="as-eyebrow">Ownership interval</p>
            <p className="as-display">Service is a timeline, not a tile.</p>
            <ul className="as-layers">
              <li>
                <span>Now</span>
                <strong>Interval on file</strong>
                <small>Unknown until mileage is entered</small>
              </li>
              <li>
                <span>Oil</span>
                <strong>{featured?.oil.capacity_liters ? `${featured.oil.capacity_liters} L` : "—"}</strong>
                <small>{featured?.oil.spec ?? "Graph specification"}</small>
              </li>
            </ul>
          </div>
          <div>
            <p className="as-eyebrow">Maintenance system</p>
            <p className="as-display">Fitment and 12V</p>
            <ul className="as-layers">
              <li>
                <span>Tyres</span>
                <strong>{featured?.tyres.front ?? "—"}</strong>
                <small>{featured?.tyres.rear && featured.tyres.rear !== featured.tyres.front ? featured.tyres.rear : "Graph fitment"}</small>
              </li>
              <li>
                <span>Battery</span>
                <strong>{featured ? `12V ${featured.battery.type}` : "—"}</strong>
                <small>Graph reference</small>
              </li>
            </ul>
          </div>
        </div>
        {featured ? (
          <Link className="as-cta as-cta-arrow" href={vehicleUrl(featured)}>
            Open the vehicle <span aria-hidden>↗</span>
          </Link>
        ) : null}
      </section>
      <section className="as-scene" id="identities">
        <p className="as-eyebrow">Covered identities</p>
        <p className="as-display">Generation and engine pages only.</p>
        <ul className="as-identity-list">
          {VEHICLES.slice(0, 10).map((v) => (
            <li key={v.id}>
              <Link href={vehicleUrl(v)}>
                <b>{v.make} {v.variant}</b>
                <span>{v.generation} · {v.engine_code}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="as-coverage-note">
          {VEHICLES.length > 10 ? `${VEHICLES.length - 10} more generation/engine pages. ` : ""}
          Other markets are not invented.
        </p>
      </section>
    </main>
  );
}

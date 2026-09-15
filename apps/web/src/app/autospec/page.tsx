import Link from "next/link";
import { VEHICLES, vehicleUrl } from "@penta/autospec";
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
      <section className="as-hero">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--as-mute)]">Digital garage</p>
          <h1 className="mt-5 text-6xl leading-[0.9] md:text-7xl">
            Your car,
            <br />
            understood.
          </h1>
          {featured ? (
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-[var(--as-mute)]">
              {featured.make} {featured.variant} · {featured.generation} · {featured.engine_code}
            </p>
          ) : null}
          <GarageEntry />
        </div>
        <VehicleStage />
      </section>
      <section className="as-scene">
        <p className="text-[11px] uppercase tracking-[0.2em]">Covered identities</p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {VEHICLES.slice(0, 8).map((v) => (
            <li key={v.id}>
              <Link href={vehicleUrl(v)} className="as-tile">
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

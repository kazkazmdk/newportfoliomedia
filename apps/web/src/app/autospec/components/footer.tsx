import Link from "next/link";
import { VEHICLES, vehicleUrl } from "@penta/autospec";
import { CookieSettingsButton } from "@/components/cookie-consent";

const SYSTEMS = ["Body", "Engine", "Tyres", "Battery", "Service"];

export function AutospecFooter() {
  const makes = [...new Set(VEHICLES.map((vehicle) => vehicle.make))].slice(0, 10);
  const models = VEHICLES.slice(0, 8);

  return (
    <footer className="as-manual">
      <div className="as-manual-plate">
        <p>AutoSpec</p>
        <strong>Vehicle database / service manual</strong>
        <span>Graph identity only. No live telemetry.</span>
      </div>
      <div className="as-manual-grid">
        <section>
          <p>Explore</p>
          <ul>
            {makes.map((make) => {
              const sample = VEHICLES.find((vehicle) => vehicle.make === make);
              return (
                <li key={make}>
                  {sample ? <Link href={vehicleUrl(sample)}>{make}</Link> : make}
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <p>Models on file</p>
          <ul>
            {models.map((vehicle) => (
              <li key={vehicle.id}>
                <Link href={vehicleUrl(vehicle)}>{vehicle.make} {vehicle.variant}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <p>Vehicle systems</p>
          <ul className="as-manual-systems">
            {SYSTEMS.map((system) => <li key={system}>{system}</li>)}
          </ul>
        </section>
        <section>
          <p>Data</p>
          <ul>
            <li><Link href="/autospec/garage">Sources</Link></li>
            <li><Link href="/autospec">Methodology</Link></li>
            <li><Link href="/autospec/garage">Corrections</Link></li>
            <li><Link href="/autospec">Coverage</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><CookieSettingsButton /></li>
          </ul>
        </section>
      </div>
    </footer>
  );
}

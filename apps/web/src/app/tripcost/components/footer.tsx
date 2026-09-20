import Link from "next/link";
import { ROUTES } from "@penta/tripcost";
import { CookieSettingsButton } from "@/components/cookie-consent";

const MODES = [
  { id: "train", label: "Train", href: "/tripcost/paris/to/lyon" },
  { id: "car", label: "Car", href: "/tripcost/paris/to/lyon/driving-cost" },
  { id: "ev", label: "EV", href: "/tripcost/paris/to/lyon" },
  { id: "bus", label: "Bus", href: "/tripcost/paris/to/lyon" },
  { id: "flight", label: "Flight", href: "/tripcost/paris/to/barcelona" },
];

export function TripcostFooter() {
  const popular = ROUTES.filter((route) => !route.compare_only).slice(0, 8);
  const countries = [...new Set(ROUTES.flatMap((route) => [route.from.country, route.to.country]))].slice(0, 10);

  return (
    <footer className="tc-atlas-footer">
      <div className="tc-atlas-band" aria-hidden="true">
        <span>48.8566° N 2.3522° E</span>
        <span>connection corridor</span>
        <span>45.7640° N 4.8357° E</span>
      </div>
      <div className="tc-atlas-grid">
        <section>
          <p className="tc-atlas-kicker">TripCost</p>
          <p className="tc-atlas-word">Atlas of modelled corridors. Cash first. True cost optional.</p>
        </section>
        <section>
          <p className="tc-atlas-kicker">Popular routes</p>
          <ul>
            {popular.map((route) => (
              <li key={route.id}>
                <Link href={`/tripcost/${route.from.slug}/to/${route.to.slug}`}>
                  {route.from.name} → {route.to.name}
                  <small>{route.km} km</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <p className="tc-atlas-kicker">Countries on file</p>
          <p className="tc-atlas-countries">{countries.join(" · ")}</p>
          <p className="tc-atlas-kicker">Transport modes</p>
          <ul className="tc-atlas-modes">
            {MODES.map((mode) => (
              <li key={mode.id}><Link href={mode.href}>{mode.label}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p className="tc-atlas-kicker">Operators</p>
          <ul>
            <li><Link href="/tripcost/business">For operators</Link></li>
            <li><Link href="/tripcost/api">Corridor API</Link></li>
            <li><Link href="/tripcost/widgets">Compare widget</Link></li>
            <li><Link href="/tripcost/docs">Cost methodology</Link></li>
            <li><Link href="/tripcost/paris/to/lyon#assumptions">Sources</Link></li>
          </ul>
        </section>
      </div>
      <div className="tc-atlas-legal">
        <p>Modelled prices. No result is a live fare. Geography is OpenStreetMap via OpenFreeMap. Corridors are not turn-by-turn routes.</p>
        <nav aria-label="TripCost legal">
          <Link href="/tripcost">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terms">Terms</Link>
          <CookieSettingsButton />
        </nav>
      </div>
    </footer>
  );
}

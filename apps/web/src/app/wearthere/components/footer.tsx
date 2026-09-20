import Image from "next/image";
import Link from "next/link";
import { DESTINATIONS, MONTHS } from "@penta/wearthere";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { destinationMedia, seasonProfileOf } from "@/lib/media-catalog";

const CLIMATES = [
  { id: "northern-temperate", label: "Temperate" },
  { id: "southern-temperate", label: "Southern hemisphere" },
  { id: "tropical", label: "Tropical" },
  { id: "desert", label: "Desert" },
] as const;

export function WearthereFooter() {
  const list = [...DESTINATIONS].sort((a, b) => a.city.localeCompare(b.city)).slice(0, 16);
  const closer = DESTINATIONS.find((dest) => dest.slug === "lisbon") ?? DESTINATIONS[0];
  const media = destinationMedia(closer.slug);

  return (
    <footer className="wt-colophon">
      <div className="wt-colophon-photo">
        <Image src={media.hero} alt={media.heroAlt} fill sizes="100vw" />
        <p>{closer.city} · illustrative climate media · not a live forecast</p>
      </div>
      <div className="wt-colophon-sheet">
        <p className="wt-colophon-word">WearThere</p>
        <p className="wt-colophon-deck">The last page of the issue: destinations, months, climates, and the method behind the capsule.</p>
        <div className="wt-colophon-cols">
          <section>
            <p>Destinations</p>
            <ul>
              {list.map((dest) => (
                <li key={dest.id}><Link href={`/wearthere/${dest.slug}`}>{dest.city}</Link></li>
              ))}
            </ul>
          </section>
          <section>
            <p>Months</p>
            <ul>
              {MONTHS.map((month) => (
                <li key={month}><Link href="/wearthere/trip">{month}</Link></li>
              ))}
            </ul>
          </section>
          <section>
            <p>Climates</p>
            <ul>
              {CLIMATES.map((climate) => {
                const sample = DESTINATIONS.find((dest) => seasonProfileOf(dest.slug) === climate.id);
                return (
                  <li key={climate.id}>
                    {sample ? <Link href={`/wearthere/${sample.slug}`}>{climate.label}</Link> : climate.label}
                  </li>
                );
              })}
              <li><Link href="/wearthere#capsule">Packing guides</Link></li>
            </ul>
          </section>
          <section>
            <p>Masthead</p>
            <ul>
              <li><Link href="/wearthere">About</Link></li>
              <li><Link href="/wearthere/business">For publishers</Link></li>
              <li><Link href="/wearthere/widgets">Capsule widget</Link></li>
              <li><Link href="/wearthere/docs">Methodology</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><CookieSettingsButton /></li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
}

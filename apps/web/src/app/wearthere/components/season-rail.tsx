import Link from "next/link";
import type { Destination } from "@penta/wearthere";
import { destinationSurfaces, resolveWearPeriod } from "@penta/wearthere";

export function SeasonRail({
  dest,
  active,
}: {
  dest: Destination;
  active?: string;
}) {
  const surfaces = destinationSurfaces(dest);

  if (surfaces.length === 0) {
    return (
      <aside className="wt-season-empty" aria-label={`Season guide for ${dest.city}`}>
        <p className="wt-kicker">Year-round rhythm</p>
        <p className="wt-serif mt-3 text-3xl">Heat and rain stay relatively consistent.</p>
        <p className="mt-3 max-w-xl text-sm leading-6 opacity-75">
          We avoid generating near-identical month pages. Use exact dates to build a private capsule.
        </p>
      </aside>
    );
  }

  return (
    <nav className="wt-season-nav" aria-label={`${dest.city} climate periods`}>
      <div className="wt-season-heading">
        <div>
          <p className="wt-kicker">Seasonal index</p>
          <p className="wt-serif mt-2 text-3xl">Move through the year</p>
        </div>
        <p className="wt-season-hint">Swipe or use Tab and Enter</p>
      </div>
      <ol className="wt-season-rail">
        {surfaces.map((surface, index) => {
          const resolved = resolveWearPeriod(dest, surface.slug);
          if (!resolved) return null;
          const weather = resolved.climate;
          const current = surface.slug === active;
          return (
            <li key={surface.slug} className="wt-season-stop">
              <Link
                href={`/wearthere/${dest.slug}/${surface.slug}/what-to-wear`}
                className="wt-season-link"
                aria-current={current ? "step" : undefined}
              >
                <span className="wt-season-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="wt-serif wt-season-name">{surface.label}</span>
                <span className="wt-season-data">
                  {weather.tmin_c}–{weather.tmax_c}°C
                  <span aria-hidden="true"> · </span>
                  {weather.rain_days} rain days
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

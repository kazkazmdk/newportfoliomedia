import { DESTINATIONS } from "@penta/wearthere";
import { pageMeta } from "@/lib/seo";
import { TripForm } from "./trip-form";

export const metadata = pageMeta({
  title: "WearThere — Where are you going?",
  description: "Destination, dates, typical climate or forecast, then a capsule you can actually pack.",
  canonical: "/wearthere",
});

export default function WearthereHome() {
  const featured = [...DESTINATIONS].sort((a, b) => b.demand - a.demand).slice(0, 8);
  const rest = [...DESTINATIONS].sort((a, b) => b.demand - a.demand).slice(8);
  return (
    <main>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-sm tracking-[0.18em] uppercase text-[#8a4b32]">Travel wardrobe</p>
          <h1 className="mt-4 text-6xl leading-[0.95] md:text-7xl">Where are you going?</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-[#5a4c43]">
            Not a dashboard. Typical weather when the trip is far out. Your forecast when it is close. Then a capsule, not a packing essay.
          </p>
          <TripForm />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.map((d, i) => (
            <a
              key={d.id}
              href={`/wearthere/${d.slug}`}
              className={`wt-card p-5 ${i === 0 ? "col-span-2 min-h-40" : ""}`}
            >
              <p className="text-sm">{d.country}</p>
              <p className="mt-2 font-[family-name:var(--font-wt-serif)] text-3xl">{d.city}</p>
            </a>
          ))}
        </div>
      </div>
      {rest.length > 0 ? (
        <ul className="mt-12 grid gap-2 sm:grid-cols-3 md:grid-cols-4">
          {rest.map((d) => (
            <li key={d.id}>
              <a className="wt-card block px-4 py-3" href={`/wearthere/${d.slug}`}>
                <p className="text-sm">{d.country}</p>
                <p className="font-[family-name:var(--font-wt-serif)] text-xl">{d.city}</p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

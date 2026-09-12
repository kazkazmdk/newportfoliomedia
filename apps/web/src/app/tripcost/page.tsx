import { ROUTES } from "@penta/tripcost";
import { pageMeta } from "@/lib/seo";
import { CompareForm } from "./compare-form";

export const metadata = pageMeta({
  title: "TripCost — Where are you going?",
  description: "Compare the real cost of car, EV, train, bus, and flight. Door-to-door, not block time.",
  canonical: "/tripcost",
});

export default function TripcostHome() {
  return (
    <main>
      <p className="text-xs tracking-[0.2em] uppercase text-[#5a6e82]">Travel economics</p>
      <h1 className="mt-4 text-5xl md:text-6xl">Where are you going?</h1>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[#3d4f63]">
        The map is not the product. The decision is: cash cost, true cost if you ask, and time to the door.
      </p>
      <CompareForm />
      <ul className="mt-12 grid gap-2 sm:grid-cols-2">
        {ROUTES.map((r) => (
          <li key={r.id}>
            <a className="tc-card flex justify-between px-4 py-3" href={`/tripcost/${r.from.slug}/to/${r.to.slug}`}>
              <span>
                {r.from.name} → {r.to.name}
              </span>
              <span className="tc-mono text-sm">{r.km} km</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

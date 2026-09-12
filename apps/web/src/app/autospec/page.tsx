import { VEHICLES } from "@penta/autospec";
import { pageMeta } from "@/lib/seo";
import { GarageEntry } from "./garage-entry";

export const metadata = pageMeta({
  title: "AutoSpec — What do you drive?",
  description: "Add your car. Oil, tyres, battery, service, recalls — one ownership copilot.",
  canonical: "/autospec",
});

export default function AutospecHome() {
  return (
    <main className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-[#6a6258]">Car ownership copilot</p>
        <h1 className="mt-5 text-5xl leading-[1.02] md:text-7xl">What do you drive?</h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-[#4d564e]">
          Not a spec dump. The car stays in the centre. Add it once — oil, tyres, brakes, recalls, and what is due next.
        </p>
        <GarageEntry />
      </div>
      <div className="as-panel relative min-h-[320px] p-8">
        <p className="text-xs tracking-[0.16em] uppercase">Covered in batch 1</p>
        <ul className="mt-6 grid gap-4">
          {VEHICLES.map((v) => (
            <li key={v.id} className="flex items-baseline justify-between border-b border-[#d9d0c0] pb-3">
              <span>
                {v.make} {v.model}
              </span>
              <span className="text-sm text-[#6a6258]">
                {v.generation} {v.engine_code}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[#6a6258]">Other markets and models are not invented.</p>
      </div>
    </main>
  );
}

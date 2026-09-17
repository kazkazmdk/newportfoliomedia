import Link from "next/link";
import { VEHICLES, vehicleUrl } from "@penta/autospec";
import { FooterMeta } from "@/components/footer-meta";

export function AutospecFooter() {
  return (
    <footer className="as-footer">
      <div className="as-footer-intro">
        <p className="as-eyebrow">Garage index</p>
        <p className="as-display">Ownership, with the unknowns left visible.</p>
        <p>Vehicle-graph reference plus the checks you choose to enter. No live connection is implied.</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {VEHICLES.slice(0, 8).map((v) => (
          <li key={v.id}>
            <Link href={vehicleUrl(v)} className="flex justify-between border-b border-[var(--as-line)] py-2 text-sm">
              <span>
                {v.make} {v.variant}
              </span>
              <span className="uppercase tracking-[0.12em] text-[var(--as-mute)]">{v.generation}</span>
            </Link>
          </li>
        ))}
      </ul>
      <FooterMeta
        product="AutoSpec"
        homeHref="/autospec"
        toolHref="/autospec/garage"
        toolLabel="My garage"
        note="Fitment is scoped to the identified generation, variant and engine. Confirm safety-critical work with the official source."
      />
    </footer>
  );
}

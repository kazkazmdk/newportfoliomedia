import Link from "next/link";
import { VEHICLES, vehicleUrl } from "@penta/autospec";

export function AutospecFooter() {
  return (
    <footer className="as-footer">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Garage index</p>
        <p className="as-display mt-4 text-4xl">Ownership OS</p>
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
    </footer>
  );
}

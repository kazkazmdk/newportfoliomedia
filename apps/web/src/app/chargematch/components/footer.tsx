import Link from "next/link";
import { DEVICES } from "@penta/chargematch";

export function ChargematchFooter() {
  return (
    <footer className="cm-footer">
      <div>
        <p className="cm-mono text-[11px] uppercase tracking-[0.2em]">Device matrix</p>
        <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--cm-mute)]">
          Compatibility is negotiated. Measured watts appear only when a lab row exists.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {DEVICES.slice(0, 10).map((d) => (
          <li key={d.id}>
            <Link href={`/chargematch/${d.slug}`} className="flex justify-between border-b border-[var(--cm-line)] py-2 text-sm">
              <span>{d.name}</span>
              <span className="cm-mono">{d.max_watts}W</span>
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}

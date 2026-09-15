"use client";

import { CHARGERS, DEVICES } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SpringButton } from "@/components/creative";

export function ConnectHero({
  deviceSlug = "iphone-16",
  chargerSlug = "apple-20w",
}: {
  deviceSlug?: string;
  chargerSlug?: string;
}) {
  const router = useRouter();
  const [device, setDevice] = useState(deviceSlug);
  const [charger, setCharger] = useState(chargerSlug);
  const d = DEVICES.find((x) => x.slug === device) ?? DEVICES[0];
  const c = CHARGERS.find((x) => x.slug === charger) ?? CHARGERS[0];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/chargematch/${device}/with/${charger}`);
  }

  return (
    <section className="cm-hero">
      <p className="cm-mono text-[11px] uppercase tracking-[0.22em]">Hardware lab · power negotiation</p>
      <form onSubmit={onSubmit} className="cm-connect mt-8">
        <div className="cm-node">
          <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">Device</p>
          <select className="cm-select mt-4 text-3xl" value={device} onChange={(e) => setDevice(e.target.value)}>
            {DEVICES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="cm-mono mt-6 text-sm">{d.min_watts}–{d.max_watts}W</p>
        </div>
        <div className="cm-cable" aria-hidden>
          <svg viewBox="0 0 220 48">
            <path d="M4 24 H216" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <circle className="cm-flow-dot" r="3.5" fill="#ff5a1f" />
          </svg>
          <p className="cm-mono text-[10px] uppercase tracking-[0.2em]">Cable</p>
        </div>
        <div className="cm-node">
          <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">Charger</p>
          <select className="cm-select mt-4 text-3xl" value={charger} onChange={(e) => setCharger(e.target.value)}>
            {CHARGERS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="cm-mono mt-6 text-sm">{c.total_watts}W · {c.ports.length} ports</p>
        </div>
        <div className="md:col-span-3 mt-4 flex flex-wrap gap-3">
          <SpringButton className="cm-cta" type="submit">
            Check power
          </SpringButton>
          <button type="button" className="border border-[var(--cm-ink)] px-4 py-2 text-xs uppercase tracking-[0.16em]" onClick={() => router.push("/chargematch/kit")}>
            Scan my setup
          </button>
        </div>
      </form>
    </section>
  );
}

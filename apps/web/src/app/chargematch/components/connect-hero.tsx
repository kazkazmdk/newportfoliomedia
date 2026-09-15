"use client";

import { CHARGERS, DEVICES } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SpringButton } from "@/components/creative";
import { ChargerObject, DeviceObject } from "./hardware";

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
      <p className="cm-mono text-[11px] uppercase tracking-[0.22em]">Rated path · not measured</p>
      <form onSubmit={onSubmit} className="cm-connect mt-8">
        <div className="cm-node">
          <DeviceObject slug={d.slug} name={d.name} />
          <label className="cm-field">
            <span className="cm-mono text-[10px] uppercase tracking-[0.18em]">Device</span>
            <select className="cm-select mt-2 text-2xl" value={device} onChange={(e) => setDevice(e.target.value)}>
              {DEVICES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <p className="cm-mono mt-4 text-sm">{d.min_watts}–{d.max_watts}W</p>
        </div>
        <div className="cm-cable" aria-hidden>
          <svg viewBox="0 0 220 88">
            <path d="M110 8 V32" stroke="currentColor" strokeWidth="2" />
            <text x="118" y="24" fontSize="10" fill="currentColor">USB-C</text>
            <path d="M110 32 C110 56 110 56 110 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="cm-node">
          <ChargerObject watts={c.total_watts} ports={c.ports.length} />
          <label className="cm-field">
            <span className="cm-mono text-[10px] uppercase tracking-[0.18em]">Charger</span>
            <select className="cm-select mt-2 text-2xl" value={charger} onChange={(e) => setCharger(e.target.value)}>
              {CHARGERS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <p className="cm-mono mt-4 text-sm">{c.total_watts}W · {c.ports.length} ports</p>
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

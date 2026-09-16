"use client";

import { CABLES, CHARGERS, DEVICES, powerChain } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
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
  const chain = useMemo(
    () =>
      powerChain({
        device: d,
        charger: c,
        cable: CABLES[0],
        selectedPort: c.ports[0]?.id,
        usedPorts: [c.ports[0]?.id],
      }),
    [d, c],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/chargematch/${device}/with/${charger}`);
  }

  return (
    <section className="cm-hero">
      <p className="cm-mono text-[11px] uppercase tracking-[0.22em]">Rated path · not measured</p>
      <form onSubmit={onSubmit} className="cm-desk">
        <div className="cm-quick">
          <label className="cm-field">
            <span className="cm-mono text-[10px] uppercase tracking-[0.18em]">Device</span>
            <select
              className="cm-select text-xl md:text-2xl"
              aria-label="Device"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            >
              {DEVICES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="cm-field">
            <span className="cm-mono text-[10px] uppercase tracking-[0.18em]">Charger</span>
            <select
              className="cm-select text-xl md:text-2xl"
              aria-label="Charger"
              value={charger}
              onChange={(e) => setCharger(e.target.value)}
            >
              {CHARGERS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="cm-expected" aria-live="polite">
            <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">Expected</p>
            <p className="cm-mono text-5xl leading-none">{chain.watts}W</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--cm-mute)]">
              Limited by {chain.limitingComponent} · {chain.protocol.replaceAll("_", " ")}
            </p>
          </div>
          <div className="cm-quick-actions">
            <SpringButton className="cm-cta" type="submit">
              Check power
            </SpringButton>
            <button
              type="button"
              className="cm-ghost"
              onClick={() => router.push("/chargematch/macbook-air-13-m3/with/anker-100w-2c")}
            >
              Multiport split
            </button>
          </div>
        </div>
        <div className="cm-connect" aria-hidden>
          <div className="cm-node">
            <DeviceObject slug={d.slug} name={d.name} />
            <p className="cm-mono mt-3 text-sm">{d.min_watts}–{d.max_watts}W</p>
          </div>
          <div className="cm-cable">
            <svg viewBox="0 0 220 88">
              <path d="M110 8 V80" stroke="currentColor" strokeWidth="3" />
              <text x="122" y="48" fontSize="10" fill="currentColor">USB-C</text>
            </svg>
          </div>
          <div className="cm-node">
            <ChargerObject watts={c.total_watts} ports={c.ports.length} />
            <p className="cm-mono mt-3 text-sm">{c.total_watts}W · {c.ports.length} ports</p>
          </div>
        </div>
      </form>
    </section>
  );
}

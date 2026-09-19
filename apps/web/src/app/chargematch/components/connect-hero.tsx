"use client";

import { CABLES, CHARGERS, DEVICES, powerChain } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
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
  const [cable, setCable] = useState(CABLES[0]?.slug ?? "");
  const [port, setPort] = useState(CHARGERS.find((item) => item.slug === chargerSlug)?.ports[0]?.id ?? "c1");
  const d = DEVICES.find((x) => x.slug === device) ?? DEVICES[0];
  const c = CHARGERS.find((x) => x.slug === charger) ?? CHARGERS[0];
  const selectedCable = CABLES.find((x) => x.slug === cable) ?? CABLES[0];
  const selectedPort = c.ports.some((item) => item.id === port) ? port : (c.ports[0]?.id ?? "c1");
  const chain = useMemo(
    () =>
      powerChain({
        device: d,
        charger: c,
        cable: selectedCable,
        selectedPort,
        usedPorts: [selectedPort],
      }),
    [d, c, selectedCable, selectedPort],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/chargematch/${device}/with/${charger}`);
  }

  return (
    <section className="cm-bench-scene">
      <form onSubmit={onSubmit} className="cm-scene-form">
        <div className="cm-stack">
          <div className="cm-pick">
            <DeviceObject slug={d.slug} name={d.name} />
          </div>
          <label className="cm-inline-select">
            Device
            <select aria-label="Device" value={device} onChange={(e) => setDevice(e.target.value)}>
              {DEVICES.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="cm-watt-flow" aria-hidden>
            <i />
            <span className="cm-mono">{chain.watts}W</span>
            <i />
          </div>

          <div className="cm-pick">
            <ChargerObject watts={c.total_watts} ports={c.ports.length} />
          </div>
          <label className="cm-inline-select">
            Charger
            <select aria-label="Charger" value={charger} onChange={(e) => setCharger(e.target.value)}>
              {CHARGERS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <aside className="cm-scene-result cm-verdict" aria-live="polite">
          <p className="cm-result-kicker">Expected</p>
          <div className="cm-verdict-power">
            <strong className="cm-result-watts cm-mono">{chain.watts}<small>W</small></strong>
          </div>
          <p className="cm-field-meta">Accepts up to {d.max_watts}W</p>
          <p className="cm-result-limit">Limit · {chain.limitingComponent} bottleneck</p>
          <p className="cm-result-proto cm-mono">{chain.protocol.replaceAll("_", " ")}</p>
          <div className="cm-scene-meta">
            <label>
              Cable
              <select aria-label="Cable" value={cable} onChange={(e) => setCable(e.target.value)}>
                {CABLES.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              Port
              <select aria-label="Charger port" value={selectedPort} onChange={(e) => setPort(e.target.value)}>
                {c.ports.map((item) => (
                  <option key={item.id} value={item.id}>{item.label} · {item.watts}W</option>
                ))}
              </select>
            </label>
          </div>
          <button className="cm-cta" type="submit">Check this path</button>
          <button type="button" className="cm-ghost" onClick={() => router.push("/chargematch/macbook-air-13-m3/with/anker-100w-2c")}>
            Multiport split
          </button>
          <p className="cm-result-note">Published specs · not a measured wall draw.</p>
        </aside>
      </form>
    </section>
  );
}

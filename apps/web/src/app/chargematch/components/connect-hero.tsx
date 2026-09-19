"use client";

import { CABLES, CHARGERS, DEVICES, powerChain } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CablePath, ChargerObject, DeviceObject } from "./hardware";

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
  const [edit, setEdit] = useState<"device" | "charger" | "more" | null>(null);
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
          <div className="cm-pick is-device">
            <DeviceObject slug={d.slug} name={d.name} />
          </div>
          <div className="cm-watt-flow">
            <CablePath watts={chain.watts} limit={chain.limitingComponent === "cable" || chain.limitingComponent === "device"} />
          </div>
          <div className="cm-pick is-charger">
            <ChargerObject watts={c.total_watts} ports={c.ports.length} />
          </div>
          <div className={`cm-inline-select is-device-field${edit === "device" ? " is-open" : ""}`}>
            <span>
              {d.name}
              <button type="button" onClick={() => setEdit(edit === "device" ? null : "device")}>Change</button>
            </span>
            <select aria-label="Device" value={device} onChange={(e) => setDevice(e.target.value)}>
              {DEVICES.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className={`cm-inline-select is-charger-field${edit === "charger" ? " is-open" : ""}`}>
            <span>
              {c.name}
              <button type="button" onClick={() => setEdit(edit === "charger" ? null : "charger")}>Change</button>
            </span>
            <select aria-label="Charger" value={charger} onChange={(e) => setCharger(e.target.value)}>
              {CHARGERS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <aside className="cm-scene-result" aria-live="polite">
          <div className="cm-verdict">
            <p className="cm-result-kicker">Expected</p>
            <div className="cm-verdict-power">
              <strong className="cm-result-watts cm-mono">{chain.watts}<small>W</small></strong>
            </div>
            <p className="cm-field-meta">Accepts up to {d.max_watts}W</p>
            <p className="cm-result-limit">Limit · {chain.limitingComponent} bottleneck</p>
            <p className="cm-result-proto cm-mono">{chain.protocol.replaceAll("_", " ")}</p>
          </div>
          <details className="cm-why-watts">
            <summary>Why {chain.watts}W?</summary>
            <ol>
              <li>Charger {c.total_watts}W</li>
              <li>Port {c.ports.find((item) => item.id === selectedPort)?.watts ?? "—"}W</li>
              <li>Cable {Number.isFinite(chain.cableCap) ? `${chain.cableCap}W` : "uncapped"}</li>
              <li className={chain.limitingComponent === "device" ? "is-limit" : ""}>Device {d.max_watts}W{chain.limitingComponent === "device" ? " ← limit" : ""}</li>
            </ol>
          </details>
          <button type="button" className="cm-ghost" onClick={() => setEdit(edit === "more" ? null : "more")}>
            Cable & port
          </button>
          <div className={`cm-scene-meta${edit === "more" ? " is-open" : ""}`}>
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

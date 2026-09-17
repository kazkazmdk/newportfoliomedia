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
    <section className="cm-hero cm-home-hero">
      <div className="cm-hero-intro">
        <p className="cm-kicker cm-mono">Rated path · not measured</p>
        <h1>Build the right<br />power path.</h1>
        <p>Match the device, brick, cable, and port. ChargeMatch shows the expected ceiling and the component that sets it.</p>
      </div>

      <form onSubmit={onSubmit} className="cm-builder">
        <div className="cm-builder-panel">
          <div className="cm-builder-heading">
            <p className="cm-mono">Configuration</p>
            <span className="cm-mono">01—03</span>
          </div>

          <label className="cm-builder-step">
            <span className="cm-step-index cm-mono">01</span>
            <span className="cm-field">
              <span className="cm-field-label cm-mono">Device</span>
              <select
                className="cm-select"
                aria-label="Device"
                value={device}
                onChange={(event) => setDevice(event.target.value)}
              >
                {DEVICES.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="cm-field-meta cm-mono">{d.connector} · accepts up to {d.max_watts}W</span>
            </span>
          </label>

          <label className="cm-builder-step">
            <span className="cm-step-index cm-mono">02</span>
            <span className="cm-field">
              <span className="cm-field-label cm-mono">Charger</span>
              <select
                className="cm-select"
                aria-label="Charger"
                value={charger}
                onChange={(event) => setCharger(event.target.value)}
              >
                {CHARGERS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="cm-field-meta cm-mono">{c.total_watts}W total · {c.ports.length} {c.ports.length === 1 ? "port" : "ports"}</span>
            </span>
          </label>

          <div className="cm-builder-step">
            <span className="cm-step-index cm-mono">03</span>
            <div className="cm-field-pair">
              <label className="cm-field">
                <span className="cm-field-label cm-mono">Cable</span>
                <select
                  className="cm-select"
                  aria-label="Cable"
                  value={cable}
                  onChange={(event) => setCable(event.target.value)}
                >
                  {CABLES.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cm-field">
                <span className="cm-field-label cm-mono">Port</span>
                <select
                  className="cm-select"
                  aria-label="Charger port"
                  value={selectedPort}
                  onChange={(event) => setPort(event.target.value)}
                >
                  {c.ports.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} · {item.watts}W
                    </option>
                  ))}
                </select>
              </label>
              <span className="cm-field-meta cm-mono">{selectedCable.max_watts}W cable ceiling · selected {selectedPort.toUpperCase()}</span>
            </div>
          </div>

          <div className="cm-quick-actions">
            <SpringButton className="cm-cta" type="submit">
              Check this path
            </SpringButton>
            <button
              type="button"
              className="cm-ghost"
              onClick={() => router.push("/chargematch/macbook-air-13-m3/with/anker-100w-2c")}
            >
              Explore a multiport split
            </button>
          </div>
        </div>

        <div className="cm-product-stage">
          <div className="cm-stage-topline cm-mono">
            <span>Selected hardware</span>
            <span className="cm-signal"><i /> Path active</span>
          </div>
          <div className="cm-connect">
            <div className="cm-node">
              <span className="cm-node-label cm-mono">Input</span>
              <DeviceObject slug={d.slug} name={d.name} />
              <p className="cm-node-spec cm-mono">{d.min_watts}–{d.max_watts}W acceptance</p>
            </div>
            <div className="cm-cable" aria-hidden>
              <span className="cm-connector cm-connector-left" />
              <svg viewBox="0 0 220 48">
                <path d="M4 24 H216" stroke="currentColor" strokeWidth="2" />
                <circle className="cm-flow-dot" r="4" fill="currentColor" />
              </svg>
              <span className="cm-connector cm-connector-right" />
              <span className="cm-cable-label cm-mono">{selectedCable.connector}</span>
            </div>
            <div className="cm-node">
              <span className="cm-node-label cm-mono">Source</span>
              <ChargerObject watts={c.total_watts} ports={c.ports.length} />
              <p className="cm-node-spec cm-mono">{c.total_watts}W rated brick</p>
            </div>
          </div>

          <aside className="cm-verdict" aria-live="polite" aria-label="Current power path verdict">
            <div className="cm-verdict-power">
              <span className="cm-field-label cm-mono">Expected ceiling</span>
              <strong className="cm-mono">{chain.watts}<small>W</small></strong>
            </div>
            <dl className="cm-verdict-facts">
              <div><dt className="cm-mono">Protocol</dt><dd>{chain.protocol.replaceAll("_", " ")}</dd></div>
              <div><dt className="cm-mono">Bottleneck</dt><dd>{chain.limitingComponent}</dd></div>
              <div><dt className="cm-mono">Evidence</dt><dd>Published specs</dd></div>
            </dl>
            <p className="cm-verdict-note">Calculated from the rated device, charger, cable, and selected port. Not a measured wall draw.</p>
          </aside>
        </div>
      </form>
    </section>
  );
}

"use client";

import { CABLES, DEVICES, allocate, compatibility, powerChain, type ChargerProfile, type DeviceProfile } from "@penta/chargematch";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { ExpertToggle } from "../[device]/with/[charger]/expert-toggle";
import { Faceplate } from "./faceplate";
import { CablePath, ChargerObject, DeviceObject } from "./hardware";
import { MultiportTree } from "./multiport";
import { PowerFlow } from "./power-flow";

export function PairStudio({
  device,
  charger,
}: {
  device: DeviceProfile;
  charger: ChargerProfile;
}) {
  const [port, setPort] = useState(charger.ports[0]?.id ?? "c1");
  const [plugged, setPlugged] = useState(1);
  const used = useMemo(
    () => charger.ports.slice(0, Math.min(plugged, charger.ports.length)).map((p) => p.id),
    [charger.ports, plugged],
  );
  const result = useMemo(() => compatibility(device, charger, CABLES[0]), [device, charger]);
  const chain = useMemo(
    () => powerChain({ device, charger, cable: CABLES[0], selectedPort: port, usedPorts: used }),
    [device, charger, port, used],
  );
  const multi = useMemo(
    () => (used.length ? allocate(charger, used) : null),
    [charger, used],
  );
  const laptop = DEVICES.find((d) => d.slug.includes("macbook")) ?? DEVICES[0];
  const buds = DEVICES.find((d) => d.slug.includes("airpods")) ?? DEVICES[1];
  const labels: Record<string, string> = {
    [charger.ports[0]?.id ?? "c1"]: device.name,
    ...(charger.ports[1] ? { [charger.ports[1].id]: laptop.name === device.name ? "Second device" : laptop.name } : {}),
    ...(charger.ports[2] ? { [charger.ports[2].id]: buds.name } : {}),
    ...(charger.ports[3] ? { [charger.ports[3].id]: "USB-A accessory" } : {}),
  };

  return (
    <div>
      <section className="cm-hero cm-detail-hero">
        <div className="cm-detail-heading">
          <p className="cm-kicker cm-mono">{result.tag.replaceAll("_", " ")} · rated path</p>
          <h1>{device.name}<br /><span>with {charger.name}</span></h1>
          <p>{result.explanation}</p>
        </div>

        <div className="cm-product-stage cm-detail-stage">
          <div className="cm-stage-topline cm-mono">
            <span>Compatibility assembly</span>
            <span className="cm-signal"><i /> Rated · not measured</span>
          </div>
          <div className="cm-connect">
            <div className="cm-node">
              <span className="cm-node-label cm-mono">Device</span>
              <DeviceObject slug={device.slug} name={device.name} limit={chain.limitingComponent === "device"} />
              <p className="cm-node-spec cm-mono">{device.max_watts}W input cap</p>
            </div>
            <div className="cm-cable" aria-hidden>
              <CablePath watts={chain.watts} limit={chain.limitingComponent === "cable"} axis="horizontal" />
              <span className="cm-cable-label cm-mono">USB-C {chain.watts}W path</span>
            </div>
            <div className="cm-node">
              <span className="cm-node-label cm-mono">Charger</span>
              <ChargerObject
                watts={charger.total_watts}
                ports={charger.ports.length}
                limit={chain.limitingComponent === "port" || chain.limitingComponent === "allocation"}
                limitTarget={chain.limitingComponent === "port" ? "port" : chain.limitingComponent === "allocation" ? "charger" : undefined}
              />
              <p className="cm-node-spec cm-mono">{charger.total_watts}W rated brick</p>
            </div>
          </div>

          <aside className="cm-verdict cm-verdict-sticky" aria-live="polite" aria-label="Compatibility verdict" data-limit={chain.limitingComponent} data-watts={String(chain.watts)}>
            <div className="cm-verdict-power">
              <span className="cm-field-label cm-mono">Expected ceiling</span>
              <strong className="cm-mono">{chain.watts}<small>W</small></strong>
            </div>
            <div className="cm-verdict-match">
              <span className="cm-field-label cm-mono">Verdict</span>
              <strong>{result.match.replaceAll("_", " ")}</strong>
            </div>
            <dl className="cm-verdict-facts">
              <div><dt className="cm-mono">Protocol</dt><dd>{chain.protocol.replaceAll("_", " ")}</dd></div>
              <div><dt className="cm-mono">Bottleneck</dt><dd>{chain.limitingComponent}</dd></div>
              <div><dt className="cm-mono">Port</dt><dd>{port.toUpperCase()}</dd></div>
            </dl>
            <p className="cm-verdict-note">{result.safety_note} Not a measured wall draw.</p>
          </aside>
        </div>
      </section>

      <section className="cm-scene cm-path-scene">
        <div className="cm-section-heading">
          <p className="cm-kicker cm-mono">01 · Configure the path</p>
          <h2>Choose the active port.<br />See every ceiling.</h2>
          <p>The selected face changes the published port limit. Open any row to inspect why it matters.</p>
        </div>
        <div className="cm-path-grid">
          <Faceplate charger={charger} selected={port} onSelect={setPort} />
          <PowerFlow chain={chain} sourceWatts={charger.total_watts} />
        </div>
      </section>

      <section className="cm-scene cm-limit-scene">
        <div className="cm-section-heading">
          <p className="cm-kicker cm-mono">02 · Read the limit</p>
          <h2>What sets the speed?</h2>
        </div>
        <div className="cm-limit-card">
          <span className="cm-limit-marker cm-mono">Current bottleneck</span>
          <p>{result.bottleneck}</p>
          <dl className="cm-technical-row">
            <div><dt>Compatible</dt><dd>{result.compatible ? "Yes" : "No"}</dd></div>
            <div><dt>Certified path</dt><dd>{result.safe ? "Yes" : "Unknown"}</dd></div>
            <div><dt>Evidence</dt><dd>{result.evidence.replaceAll("_", " ")}</dd></div>
            <div><dt>Lab measured</dt><dd>None</dd></div>
          </dl>
        </div>
      </section>

      <section className="cm-scene cm-multi-scene">
        <div className="cm-section-heading">
          <p className="cm-kicker cm-mono">03 · Add devices</p>
          <h2>One brick.<br />Several demands.</h2>
          <p>Activate ports to see the published allocation change.</p>
        </div>
        <div className="cm-multi-panel">
          {charger.ports.length > 1 ? (
            <>
              <div className="cm-plug" aria-label="Number of occupied charger ports">
                {charger.ports.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cm-port ${plugged > i ? "is-on" : ""}`}
                    onClick={() => setPlugged(i + 1)}
                    aria-pressed={plugged > i}
                  >
                    <span>{p.label}</span>
                    <span className="cm-mono">{plugged > i ? "Plugged" : "Empty"}</span>
                  </button>
                ))}
              </div>
              {multi ? (
                <div className="cm-multi-visual">
                  <MultiportTree
                    total={charger.total_watts}
                    branches={multi.ports.map((p, index) => ({
                      id: p,
                      label: `${labels[p] ?? p} · ${charger.ports.find((x) => x.id === p)?.label ?? p}`,
                      watts: multi.byPort?.[p] ?? 0,
                      slug: index === 0 ? device.slug : laptop.slug,
                    }))}
                  />
                </div>
              ) : null}
              <p className="cm-evidence-note">Allocation from the published port map. Plug a second device to see watts move — not a measured wall draw.</p>
            </>
          ) : (
            <p className="cm-evidence-note">Single-port brick. No split allocation on file.</p>
          )}
        </div>
      </section>

      <section className="cm-scene cm-evidence-scene">
        <details className="cm-disclosure">
          <summary>
            <span>
              <span className="cm-kicker cm-mono">Technical evidence</span>
              <strong>Rated path, not measured</strong>
            </span>
            <span className="cm-disclosure-action cm-mono">Open details</span>
          </summary>
          <div className="cm-disclosure-body">
            <p>{result.explanation} Wattage is negotiated, not measured, unless a lab row exists.</p>
            <p className="cm-mono">{result.rule_version} · {result.trace.facts.join(" · ")}</p>
            <ExpertToggle chargerName={charger.name} pd={charger.pd_version} ports={charger.ports} />
          </div>
        </details>
        <div className="cm-feedback-wrap">
          <Feedback site="chargematch" />
        </div>
      </section>
    </div>
  );
}

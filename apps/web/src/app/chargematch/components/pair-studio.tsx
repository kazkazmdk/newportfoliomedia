"use client";

import { CABLES, DEVICES, allocate, compatibility, powerChain, type ChargerProfile, type DeviceProfile } from "@penta/chargematch";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { ExpertToggle } from "../[device]/with/[charger]/expert-toggle";
import { Faceplate } from "./faceplate";
import { PowerFlow } from "./power-flow";

export function PairStudio({
  device,
  charger,
}: {
  device: DeviceProfile;
  charger: ChargerProfile;
}) {
  const [port, setPort] = useState(charger.ports[0]?.id ?? "c1");
  const extras = charger.ports.filter((p) => p.id !== port).slice(0, 2).map((p) => p.id);
  const result = useMemo(() => compatibility(device, charger, CABLES[0]), [device, charger]);
  const chain = useMemo(
    () => powerChain({ device, charger, cable: CABLES[0], selectedPort: port, usedPorts: [port] }),
    [device, charger, port],
  );
  const multi = useMemo(
    () => (extras.length ? allocate(charger, [port, ...extras]) : null),
    [charger, extras, port],
  );
  const laptop = DEVICES.find((d) => d.slug.includes("macbook")) ?? DEVICES[0];
  const buds = DEVICES.find((d) => d.slug.includes("airpods")) ?? DEVICES[1];

  return (
    <div>
      <section className="cm-hero">
        <p className="cm-mono text-[11px] uppercase tracking-[0.2em]">{result.tag.replaceAll("_", " ")}</p>
        <h1 className="mt-3 text-5xl">{result.match.replaceAll("_", " ")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--cm-mute)]">{result.safety_note}</p>
        <div className="cm-connect mt-10">
          <div className="cm-node">
            <p className="cm-mono text-[10px] uppercase">Device</p>
            <p className="mt-3 text-3xl">{device.name}</p>
            <p className="cm-mono mt-4">{device.max_watts}W cap</p>
          </div>
          <div className="cm-cable">
            <svg viewBox="0 0 220 48">
              <path d="M4 24 H216" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <circle className="cm-flow-dot" r="3.5" fill="#ff5a1f" />
            </svg>
          </div>
          <div className="cm-node">
            <p className="cm-mono text-[10px] uppercase">Charger</p>
            <p className="mt-3 text-3xl">{charger.name}</p>
            <p className="cm-mono mt-4">{charger.total_watts}W</p>
          </div>
        </div>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">Scene 02 · negotiation</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <Faceplate charger={charger} selected={port} onSelect={setPort} />
          <PowerFlow chain={chain} sourceWatts={charger.total_watts} />
        </div>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">Scene 03 · bottleneck</p>
        <p className="mt-4 max-w-xl text-3xl leading-tight">{result.bottleneck}</p>
        <p className="cm-mono mt-4 text-sm">
          Compatible {result.compatible ? "YES" : "NO"} · certified path {result.safe ? "YES" : "UNKNOWN"} · evidence {result.evidence.replaceAll("_", " ")} · lab measured NONE
        </p>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">Scene 04 · one brick · three devices</p>
        <h2 className="mt-4 text-4xl">What actually happens?</h2>
        {multi ? (
          <ul className="mt-6 grid gap-2">
            <li className="cm-mono">{laptop.name} on {port}: {multi.byPort?.[port] ?? chain.allocationCap}W allocation row</li>
            {extras[0] ? <li className="cm-mono">{device.name === laptop.name ? "Phone" : device.name} on {extras[0]}: {multi.byPort?.[extras[0]] ?? "—"}W</li> : null}
            {extras[1] ? <li className="cm-mono">{buds.name} on {extras[1]}: {multi.byPort?.[extras[1]] ?? "—"}W</li> : null}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--cm-mute)]">Single-port brick. No split allocation on file.</p>
        )}
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">Scene 06 · evidence</p>
        <p className="mt-4 max-w-xl leading-7">{result.explanation} Wattage is negotiated, not measured, unless a lab row exists.</p>
        <p className="cm-mono mt-4 text-xs">{result.rule_version} · {result.trace.facts.join(" · ")}</p>
        <ExpertToggle chargerName={charger.name} pd={charger.pd_version} ports={charger.ports} />
        <div className="mt-10">
          <Feedback site="chargematch" />
        </div>
      </section>
    </div>
  );
}

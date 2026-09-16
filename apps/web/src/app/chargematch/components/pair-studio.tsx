"use client";

import { CABLES, DEVICES, allocate, compatibility, powerChain, type ChargerProfile, type DeviceProfile } from "@penta/chargematch";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { ExpertToggle } from "../[device]/with/[charger]/expert-toggle";
import { Faceplate } from "./faceplate";
import { ChargerObject, DeviceObject } from "./hardware";
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
      <section className="cm-hero">
        <p className="cm-mono text-[11px] uppercase tracking-[0.2em]">{result.tag.replaceAll("_", " ")}</p>
        <div className="cm-result-bar">
          <div>
            <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">Expected</p>
            <p className="cm-mono text-6xl leading-none">{chain.watts}W</p>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl">{result.match.replaceAll("_", " ")}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-[var(--cm-mute)]">
              Limited by {chain.limitingComponent} · {chain.protocol.replaceAll("_", " ")}
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--cm-mute)]">{result.safety_note}</p>
        </div>
        <div className="cm-connect mt-8" style={{ display: "grid" }}>
          <div className="cm-node">
            <DeviceObject slug={device.slug} name={device.name} />
            <p className="cm-mono mt-3">{device.max_watts}W cap</p>
          </div>
          <div className="cm-cable" aria-hidden>
            <svg viewBox="0 0 220 88">
              <path d="M110 8 V80" stroke="currentColor" strokeWidth="3" />
              <text x="122" y="48" fontSize="10" fill="currentColor">USB-C</text>
            </svg>
          </div>
          <div className="cm-node">
            <ChargerObject watts={charger.total_watts} ports={charger.ports.length} />
            <p className="cm-mono mt-3">{charger.total_watts}W brick</p>
          </div>
        </div>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">How the path negotiates</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <Faceplate charger={charger} selected={port} onSelect={setPort} />
          <PowerFlow chain={chain} sourceWatts={charger.total_watts} />
        </div>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">What limits your charging speed?</p>
        <p className="mt-4 max-w-xl text-3xl leading-tight">{result.bottleneck}</p>
        <p className="cm-mono mt-4 text-sm">
          Compatible {result.compatible ? "YES" : "NO"} · certified path {result.safe ? "YES" : "UNKNOWN"} · evidence {result.evidence.replaceAll("_", " ")} · lab measured NONE
        </p>
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">One brick, several devices</p>
        <h2 className="mt-4 text-4xl">How power splits</h2>
        {charger.ports.length > 1 ? (
          <>
            <div className="cm-plug">
              {charger.ports.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`cm-port ${plugged > i ? "is-on" : ""}`}
                  onClick={() => setPlugged(i + 1)}
                >
                  {p.label} {plugged > i ? "plugged" : "empty"}
                </button>
              ))}
            </div>
            {multi ? (
              <div className="mt-8">
                <MultiportTree
                  total={charger.total_watts}
                  branches={multi.ports.map((p) => ({
                    id: p,
                    label: `${labels[p] ?? p} · ${charger.ports.find((x) => x.id === p)?.label ?? p}`,
                    watts: multi.byPort?.[p] ?? 0,
                  }))}
                />
              </div>
            ) : null}
            <p className="mt-4 text-sm text-[var(--cm-mute)]">
              Allocation from the published port map. Plug a second device to see watts move — not a measured wall draw.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-[var(--cm-mute)]">Single-port brick. No split allocation on file.</p>
        )}
      </section>
      <section className="cm-scene">
        <p className="cm-mono text-[11px] uppercase tracking-[0.18em]">Rated path, not measured</p>
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

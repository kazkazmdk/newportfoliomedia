"use client";

import type { ChargerProfile } from "@penta/chargematch";

export function Faceplate({
  charger,
  selected,
  onSelect,
}: {
  charger: ChargerProfile;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="cm-face">
      <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">{charger.name}</p>
      {charger.ports.map((port) => (
        <button
          key={port.id}
          type="button"
          className={`cm-port ${selected === port.id ? "is-on" : ""}`}
          onClick={() => onSelect(port.id)}
        >
          <span>{port.label}</span>
          <span className="cm-mono">{port.watts}W</span>
        </button>
      ))}
    </div>
  );
}

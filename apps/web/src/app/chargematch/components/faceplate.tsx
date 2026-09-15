"use client";

import type { ChargerProfile } from "@penta/chargematch";
import { CursorCanvas } from "@/components/creative";

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
    <CursorCanvas label="Connect" color="#11110f" className="cm-face">
      <p className="cm-mono text-[10px] uppercase tracking-[0.18em]">{charger.name}</p>
      <div className="cm-plate" style={{ transform: "rotateX(10deg) rotateY(-8deg)" }}>
        {charger.ports.map((port) => {
          const usbA = /a\b|usb-a|type.a/i.test(port.label);
          return (
            <button
              key={port.id}
              type="button"
              className={`cm-jack ${usbA ? "is-a" : "is-c"} ${selected === port.id ? "is-on" : ""}`}
              onClick={() => onSelect(port.id)}
              aria-pressed={selected === port.id}
            >
              <span className="cm-jack-hole" />
              <span>
                {port.label}
                <small className="cm-mono">{port.watts}W</small>
              </span>
            </button>
          );
        })}
      </div>
    </CursorCanvas>
  );
}

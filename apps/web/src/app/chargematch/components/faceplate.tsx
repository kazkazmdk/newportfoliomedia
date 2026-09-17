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
      <div className="cm-face-heading">
        <div>
          <span className="cm-field-label cm-mono">Charger face</span>
          <p>{charger.name}</p>
        </div>
        <span className="cm-face-total cm-mono">{charger.total_watts}W</span>
      </div>
      <div className="cm-plate">
        <span className="cm-plate-brand cm-mono">ChargeMatch</span>
        {charger.ports.map((port) => {
          const usbA = /a\b|usb-a|type.a/i.test(port.label);
          return (
            <button
              key={port.id}
              type="button"
              className={`cm-jack ${usbA ? "is-a" : "is-c"} ${selected === port.id ? "is-on" : ""}`}
              onClick={() => onSelect(port.id)}
              aria-pressed={selected === port.id}
              aria-label={`Use ${port.label}, rated up to ${port.watts} watts`}
            >
              <span className="cm-jack-hole"><i /></span>
              <span>
                {port.label}
                <small className="cm-mono">{port.watts}W max</small>
              </span>
              <em className="cm-mono">{selected === port.id ? "Active" : "Select"}</em>
            </button>
          );
        })}
      </div>
    </CursorCanvas>
  );
}

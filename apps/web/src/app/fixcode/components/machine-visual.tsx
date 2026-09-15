"use client";

export type MachineZone = "inlet" | "pump" | "motor" | "door" | "sensor" | "heater" | "none";

export function zoneFromText(value: string): MachineZone {
  const t = value.toLowerCase();
  if (/(water|hose|inlet|tap|supply|valve|fill)/.test(t)) return "inlet";
  if (/(pump|drain|filter)/.test(t)) return "pump";
  if (/(motor|drum|spin|belt)/.test(t)) return "motor";
  if (/(door|latch|lock)/.test(t)) return "door";
  if (/(sensor|therm|ntc)/.test(t)) return "sensor";
  if (/(heat|element|boiler)/.test(t)) return "heater";
  return "none";
}

export function MachineVisual({
  zone = "none",
  ready = false,
  appliance = "washer",
}: {
  zone?: MachineZone;
  ready?: boolean;
  appliance?: string;
}) {
  const hot = (id: MachineZone) => (zone === id ? "is-hot" : ready ? "is-ready" : "");
  return (
    <div className="fc-machine" role="img" aria-label={`${appliance} schematic`}>
      <svg viewBox="0 0 320 360" fill="none">
        <rect className={`fc-part ${hot("door")}`} x="48" y="28" width="224" height="292" rx="10" />
        <rect className={`fc-part ${hot("door")}`} x="70" y="44" width="180" height="28" />
        <rect className={`fc-part ${hot("door")}`} x="78" y="86" width="164" height="164" rx="82" />
        <circle className={`fc-part ${hot("motor")}`} cx="160" cy="168" r="52" />
        <circle className={`fc-part ${hot("motor")}`} cx="160" cy="168" r="28" />
        <circle className={`fc-part ${hot("motor")}`} cx="160" cy="168" r="8" />
        <path className={`fc-part ${hot("inlet")}`} d="M48 70 H12 V46 H48" />
        <path className={`fc-part ${hot("inlet")}`} d="M12 46 H4" />
        <path className={`fc-part ${hot("pump")}`} d="M160 268 V304 H80 V276 H118 V268" />
        <rect className={`fc-part ${hot("heater")}`} x="188" y="268" width="70" height="16" />
        <circle className={`fc-part ${hot("sensor")}`} cx="228" cy="128" r="7" />
        <text className={`fc-callout ${hot("inlet")}`} x="8" y="52">
          inlet
        </text>
        <text className={`fc-callout ${hot("pump")}`} x="70" y="318">
          pump
        </text>
        <text className={`fc-callout ${hot("motor")}`} x="136" y="212">
          motor
        </text>
        <text className={`fc-callout ${hot("heater")}`} x="188" y="288">
          heater
        </text>
        <text className={`fc-callout ${hot("sensor")}`} x="242" y="112">
          sensor
        </text>
        <text className={`fc-callout ${hot("door")}`} x="250" y="44">
          door
        </text>
      </svg>
    </div>
  );
}

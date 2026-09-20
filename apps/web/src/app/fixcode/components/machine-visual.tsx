"use client";

import Image from "next/image";
import { diagnosticPath, waterStepId, type MachineZone, type WaterStep, zoneFromText } from "./machine-path";

export type { MachineZone, WaterStep };
export { zoneFromText };
const REGISTRATION_CELLS = Array.from({ length: 16 }, (_, index) => index);

function cls(active: boolean, dim: boolean) {
  if (dim && !active) return "fc-part is-dim";
  if (active) return "fc-part is-hot";
  return "fc-part is-ready";
}

export function MachineVisual({
  zone = "none",
  ready = false,
  appliance = "washer",
  step,
  liveSystems,
  dimSystems = [],
}: {
  zone?: MachineZone;
  ready?: boolean;
  appliance?: string;
  step?: WaterStep;
  liveSystems?: string[];
  dimSystems?: string[];
}) {
  const focus = step ?? zone;
  const on = (id: string) => {
    if (liveSystems?.includes(id)) return true;
    if (focus === id) return true;
    if (focus === "source" && id === "water") return true;
    if (focus === "hose" && (id === "water" || id === "hose")) return true;
    if (focus === "valve" && (id === "water" || id === "valve")) return true;
    if (focus === "control" && (id === "sensor" || id === "control")) return true;
    if (focus === "inlet" && (id === "water" || id === "hose" || id === "valve")) return true;
    return false;
  };
  const dim = (id: string) => {
    if (focus === "control" && (id === "water" || id === "hose" || id === "valve" || id === "source")) return true;
    if (focus === "source" && (id === "valve" || id === "control" || id === "sensor")) return true;
    if (focus === "hose" && (id === "valve" || id === "control" || id === "sensor")) return true;
    return dimSystems.includes(id) && !on(id);
  };
  const hot = (id: MachineZone) => (zone === id ? "is-hot" : ready ? "is-ready" : "");
  const path = diagnosticPath(focus);
  const activeWater = waterStepId(focus);

  return (
    <div
      className="fc-machine"
      role="img"
      aria-label={`${appliance} documented system schematic over a class-reference machine photograph`}
      data-water-step-active={activeWater || undefined}
    >
      <div className="fc-machine-physical">
        <Image
          src="/media/fixcode/washer-machine-class.png"
          alt=""
          width={864}
          height={1152}
          className="fc-machine-photo"
        />
        <p className="fc-machine-class">Class reference · front-load washer · not this exact serial</p>
      </div>
      <p className="fc-plate-mark" aria-hidden>
        System path / {focus}
      </p>
      <div className="fc-registration-mark" aria-hidden>
        {REGISTRATION_CELLS.map((index) => <i key={index} />)}
      </div>
      <svg viewBox="0 0 520 620" fill="none">
        <g data-system="enclosure">
          <rect className={`fc-part ${hot("door")}`} x="110" y="48" width="300" height="500" rx="18" />
          <rect className="fc-part" x="132" y="68" width="256" height="44" rx="4" />
          <rect className="fc-fill" x="150" y="78" width="42" height="12" rx="2" />
          <rect className="fc-fill" x="202" y="78" width="42" height="12" rx="2" />
          <rect className="fc-fill" x="254" y="78" width="42" height="12" rx="2" />
          <rect className={cls(on("control") || zone === "sensor", dim("control"))} x="338" y="74" width="38" height="28" />
        </g>

        <g data-system="door">
          <rect className={`fc-part ${hot("door")}`} x="148" y="140" width="224" height="224" rx="112" />
          <circle className="fc-part" cx="260" cy="252" r="82" />
          <rect className={cls(zone === "door", false)} x="368" y="248" width="18" height="14" rx="2" />
          <text className={`fc-callout ${zone === "door" ? "is-hot" : ""}`} x="390" y="246">lock</text>
        </g>

        <g data-system="motor" className={dim("motor") ? "is-dim" : ""}>
          <circle className={cls(on("motor") || zone === "motor", dim("motor"))} cx="260" cy="252" r="46" />
          <circle className={cls(on("motor") || zone === "motor", dim("motor"))} cx="260" cy="252" r="16" />
          <path className={cls(on("motor") || zone === "motor", dim("motor"))} d="M260 206 V186 M260 298 V318 M214 252 H194 M306 252 H326" />
          <text className={`fc-callout ${on("motor") || zone === "motor" ? "is-hot" : ""}`} x="318" y="330">drum / motor</text>
        </g>

        <g data-system="water">
          <path className={cls(on("water") || on("source"), dim("water"))} d="M110 118 H36 V72 H12" />
          <circle className={cls(on("source") || on("water"), dim("water"))} cx="12" cy="72" r="8" />
          <text className={`fc-callout ${on("source") || on("water") ? "is-hot" : ""}`} x="20" y="54">tap</text>
        </g>

        <g data-system="hose">
          <path className={cls(on("hose") || on("water"), dim("hose"))} d="M36 72 C36 98 68 110 110 110" />
          <rect className={cls(on("hose"), dim("hose"))} x="48" y="88" width="28" height="12" rx="2" />
          <text className={`fc-callout ${on("hose") ? "is-hot" : ""}`} x="16" y="118">hose / mesh</text>
        </g>

        <g data-system="valve">
          <rect className={cls(on("valve") || zone === "inlet", dim("valve"))} x="110" y="100" width="34" height="26" rx="3" />
          <path className={cls(on("valve") || zone === "inlet", dim("valve"))} d="M144 113 H176 V148" />
          <text className={`fc-callout ${on("valve") || zone === "inlet" ? "is-hot" : ""}`} x="150" y="92">valve</text>
        </g>

        <g data-system="drain">
          <path className={cls(on("pump") || zone === "pump", dim("drain"))} d="M260 400 V452 H156 V420 H198 V400" />
          <circle className={cls(on("pump") || zone === "pump", dim("drain"))} cx="156" cy="436" r="14" />
          <text className={`fc-callout ${on("pump") || zone === "pump" ? "is-hot" : ""}`} x="108" y="478">pump / drain</text>
        </g>

        <g data-system="heater">
          <rect className={cls(zone === "heater", dim("heater"))} x="300" y="408" width="88" height="18" />
          <path className={cls(zone === "heater", dim("heater"))} d="M308 408 V426 M322 408 V426 M336 408 V426 M350 408 V426 M364 408 V426" />
          <text className={`fc-callout ${zone === "heater" ? "is-hot" : ""}`} x="300" y="446">heater</text>
        </g>

        <g data-system="tub">
          <ellipse className="fc-part" cx="260" cy="252" rx="70" ry="74" opacity="0.45" />
        </g>

        <g data-system="sensor">
          <circle className={cls(on("sensor") || on("control") || zone === "sensor", dim("sensor"))} cx="368" cy="188" r="9" />
          <path className={cls(on("control") || zone === "sensor", dim("sensor"))} d="M368 179 V96 H356" />
          <text className={`fc-callout ${on("sensor") || on("control") || zone === "sensor" ? "is-hot" : ""}`} x="384" y="192">sensor</text>
          <text className={`fc-callout ${on("control") ? "is-hot" : ""}`} x="380" y="70">control</text>
        </g>

        <g data-system="diagnostic" opacity={ready || focus !== "none" ? 1 : 0.35}>
          <path
            className={`fc-diag-path${path.kind === "signal" ? " is-signal" : ""}`}
            d={path.d}
          />
        </g>
      </svg>
    </div>
  );
}


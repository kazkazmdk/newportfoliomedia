"use client";

export type MachineZone = "inlet" | "pump" | "motor" | "door" | "sensor" | "heater" | "none";
export type WaterStep = "source" | "hose" | "valve" | "control" | MachineZone;

export function zoneFromText(value: string): MachineZone {
  const t = value.toLowerCase();
  if (/(water|hose|inlet|tap|supply|valve|fill|4c|4e)/.test(t)) return "inlet";
  if (/(pump|drain|filter)/.test(t)) return "pump";
  if (/(motor|drum|spin|belt)/.test(t)) return "motor";
  if (/(door|latch|lock)/.test(t)) return "door";
  if (/(sensor|therm|ntc|control)/.test(t)) return "sensor";
  if (/(heat|element|boiler)/.test(t)) return "heater";
  return "none";
}

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
  const dim = (id: string) => dimSystems.includes(id) && !on(id);
  const hot = (id: MachineZone) => (zone === id ? "is-hot" : ready ? "is-ready" : "");

  return (
    <div className="fc-machine" role="img" aria-label={`${appliance} system schematic`}>
      <p className="fc-plate-mark" aria-hidden>
        SYSTEM SCHEMATIC
      </p>
      <svg viewBox="0 0 420 480" fill="none">
        <g data-system="enclosure">
          <rect className={`fc-part ${hot("door")}`} x="78" y="36" width="248" height="392" rx="14" />
          <rect className="fc-part" x="96" y="52" width="212" height="36" rx="4" />
          <rect className="fc-fill" x="112" y="60" width="36" height="10" rx="2" />
          <rect className="fc-fill" x="156" y="60" width="36" height="10" rx="2" />
          <rect className="fc-fill" x="200" y="60" width="36" height="10" rx="2" />
        </g>

        <g data-system="door">
          <rect className={`fc-part ${hot("door")}`} x="108" y="108" width="188" height="188" rx="94" />
          <circle className="fc-part" cx="202" cy="202" r="68" />
        </g>

        <g data-system="motor" className={dim("motor") ? "is-dim" : ""}>
          <circle className={cls(on("motor") || zone === "motor", dim("motor"))} cx="202" cy="202" r="38" />
          <circle className={cls(on("motor") || zone === "motor", dim("motor"))} cx="202" cy="202" r="14" />
          <path className={cls(on("motor") || zone === "motor", dim("motor"))} d="M202 164 V148 M202 240 V256 M164 202 H148 M240 202 H256" />
        </g>

        <g data-system="water">
          <path className={cls(on("water") || on("source"), dim("water"))} d="M78 92 H28 V58 H8" />
          <circle className={cls(on("source") || on("water"), dim("water"))} cx="8" cy="58" r="7" />
          <text className={`fc-callout ${on("source") || on("water") ? "is-hot" : ""}`} x="16" y="42">
            tap
          </text>
        </g>

        <g data-system="hose">
          <path className={cls(on("hose") || on("water"), dim("hose"))} d="M28 58 C28 78 48 86 78 86" />
          <rect className={cls(on("hose"), dim("hose"))} x="34" y="68" width="22" height="10" rx="2" />
          <text className={`fc-callout ${on("hose") ? "is-hot" : ""}`} x="8" y="92">
            hose / mesh
          </text>
        </g>

        <g data-system="valve">
          <rect className={cls(on("valve") || zone === "inlet", dim("valve"))} x="78" y="80" width="28" height="22" rx="3" />
          <path className={cls(on("valve") || zone === "inlet", dim("valve"))} d="M106 91 H132 V118" />
          <text className={`fc-callout ${on("valve") || zone === "inlet" ? "is-hot" : ""}`} x="112" y="76">
            valve
          </text>
        </g>

        <g data-system="drain">
          <path className={cls(on("pump") || zone === "pump", dim("drain"))} d="M202 310 V352 H118 V328 H154 V310" />
          <circle className={cls(on("pump") || zone === "pump", dim("drain"))} cx="118" cy="340" r="12" />
          <text className={`fc-callout ${on("pump") || zone === "pump" ? "is-hot" : ""}`} x="78" y="372">
            pump / drain
          </text>
        </g>

        <g data-system="heater">
          <rect className={cls(zone === "heater", dim("heater"))} x="236" y="318" width="72" height="16" />
          <text className={`fc-callout ${zone === "heater" ? "is-hot" : ""}`} x="236" y="348">
            heater
          </text>
        </g>

        <g data-system="sensor">
          <circle className={cls(on("sensor") || on("control") || zone === "sensor", dim("sensor"))} cx="286" cy="156" r="8" />
          <path className={cls(on("control") || zone === "sensor", dim("sensor"))} d="M286 148 V70 H248" />
          <rect className={cls(on("control") || zone === "sensor", dim("control"))} x="228" y="52" width="36" height="22" />
          <text className={`fc-callout ${on("sensor") || on("control") || zone === "sensor" ? "is-hot" : ""}`} x="300" y="160">
            sensor
          </text>
        </g>

        <g data-system="diagnostic" opacity={ready || focus !== "none" ? 1 : 0.35}>
          <path
            className="fc-diag-path"
            d="M8 58 C28 58 28 86 78 91 C110 91 132 91 132 118 C132 160 148 186 202 202"
          />
        </g>
      </svg>
    </div>
  );
}

export function CheckDiagram({ kind }: { kind: "tap" | "hose" | "filter" | "door" | "generic" }) {
  return (
    <svg className="fc-micro" viewBox="0 0 80 56" aria-hidden>
      {kind === "tap" ? (
        <>
          <path className="fc-part is-ready" d="M16 18 H40 V28 H52" />
          <circle className="fc-part is-hot" cx="16" cy="18" r="5" />
          <path className="fc-part is-hot" d="M52 28 V44" />
        </>
      ) : null}
      {kind === "hose" ? (
        <path className="fc-part is-hot" d="M10 28 C24 8 40 48 70 28" />
      ) : null}
      {kind === "filter" ? (
        <>
          <rect className="fc-part is-ready" x="22" y="10" width="36" height="36" rx="4" />
          <path className="fc-part is-hot" d="M28 18 H52 M28 28 H52 M28 38 H52" />
        </>
      ) : null}
      {kind === "door" ? (
        <>
          <rect className="fc-part is-ready" x="18" y="8" width="44" height="40" rx="6" />
          <circle className="fc-part is-hot" cx="40" cy="28" r="10" />
        </>
      ) : null}
      {kind === "generic" ? (
        <rect className="fc-part is-ready" x="16" y="12" width="48" height="32" rx="4" />
      ) : null}
    </svg>
  );
}

export function checkKindFromText(value: string): "tap" | "hose" | "filter" | "door" | "generic" {
  const t = value.toLowerCase();
  if (/tap|faucet|supply valve/.test(t)) return "tap";
  if (/hose/.test(t)) return "hose";
  if (/filter|mesh|screen/.test(t)) return "filter";
  if (/door|latch/.test(t)) return "door";
  return "generic";
}

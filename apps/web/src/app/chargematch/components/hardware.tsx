"use client";

import Image from "next/image";
import { useId } from "react";

function deviceKind(slug: string) {
  if (slug.includes("macbook")) return "laptop";
  if (slug.includes("steam")) return "deck";
  if (slug.includes("switch")) return "switch";
  if (slug.includes("ipad") || slug.includes("tab")) return "tablet";
  if (slug.includes("watch") || slug.includes("airpods")) return "small";
  return "phone";
}

function brickKind(watts: number, ports: number) {
  if (ports >= 2 && watts >= 65) return "multi";
  if (watts <= 35) return "small";
  return "nano";
}

const PHONE_SRC = "/media/chargematch/phone-class.png";
const LAPTOP_SRC = "/media/chargematch/laptop-class.png";
const CHARGER_SMALL_SRC = "/media/chargematch/charger-small.png";
const CHARGER_GAN_SRC = "/media/chargematch/charger-gan.png";

export function PhoneHardware() {
  return (
    <div className="cm-hw is-phone">
      <Image src={PHONE_SRC} alt="" className="cm-hw-img" width={480} height={640} />
      <span className="cm-hw-port is-device" aria-hidden />
    </div>
  );
}

export function LaptopHardware() {
  return (
    <div className="cm-hw is-laptop">
      <Image src={LAPTOP_SRC} alt="" className="cm-hw-img" width={960} height={540} />
      <span className="cm-hw-port is-device" aria-hidden />
    </div>
  );
}

export function TabletHardware() {
  const id = useId();
  return (
    <svg className="cm-svg is-tablet" viewBox="0 0 156 208" aria-hidden>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2efe6" />
          <stop offset="100%" stopColor="#9aa7b2" />
        </linearGradient>
      </defs>
      <ellipse cx="78" cy="198" rx="32" ry="5" fill="#11111022" />
      <rect x="18" y="8" width="120" height="184" rx="16" fill="#171715" />
      <rect x="26" y="22" width="104" height="152" rx="5" fill={`url(#${id}-glass)`} />
      <circle cx="78" cy="184" r="3.5" fill="#3a3a36" />
      <rect x="70" y="188" width="16" height="3" rx="1" fill="#d8d4c8" />
    </svg>
  );
}

export function ChargerBrick({ watts, ports }: { watts: number; ports: number }) {
  const kind = brickKind(watts, ports);
  const src = kind === "small" ? CHARGER_SMALL_SRC : CHARGER_GAN_SRC;
  return (
    <div className={`cm-hw is-brick is-${kind}`}>
      <Image src={src} alt="" className="cm-hw-img" width={640} height={640} />
      <span className="cm-hw-port is-charger" aria-hidden />
      <span className="cm-hw-watt cm-mono">{watts}W</span>
    </div>
  );
}

export function CablePath({
  watts,
  limit = false,
  axis = "vertical",
}: {
  watts: number;
  limit?: boolean;
  axis?: "vertical" | "horizontal";
}) {
  const vertical = axis === "vertical";
  const line = vertical ? "M40 10 C40 36 22 52 40 110" : "M10 40 C36 40 48 22 90 40";
  const motion = vertical ? "M40 12 C40 36 22 52 40 108" : "M12 40 C36 40 48 22 88 40";
  return (
    <svg
      className={`cm-cable-path is-${axis}${limit ? " is-limit" : ""}`}
      viewBox={vertical ? "0 0 80 120" : "0 0 100 80"}
      aria-hidden
    >
      <path className="cm-cable-line" d={line} />
      {vertical ? (
        <>
          <rect x="32" y="0" width="16" height="14" rx="3" className="cm-cable-head" />
          <rect x="32" y="106" width="16" height="14" rx="3" className="cm-cable-head" />
        </>
      ) : (
        <>
          <rect x="0" y="32" width="14" height="16" rx="3" className="cm-cable-head" />
          <rect x="86" y="32" width="14" height="16" rx="3" className="cm-cable-head" />
        </>
      )}
      <circle className="cm-cable-current" r="3.5" cx={vertical ? 40 : 12} cy={vertical ? 12 : 40}>
        <animateMotion dur="1.6s" repeatCount="indefinite" path={motion} />
      </circle>
      <text x={vertical ? 58 : 50} y={vertical ? 66 : 18} className="cm-cable-watt" textAnchor={vertical ? "start" : "middle"}>
        {watts}W
      </text>
    </svg>
  );
}

export function DeviceObject({ slug, name, limit = false }: { slug: string; name: string; limit?: boolean }) {
  const kind = deviceKind(slug);
  return (
    <div className={`cm-object is-${kind}${limit ? " is-limit" : ""}`}>
      <div className="cm-object-shadow" />
      {kind === "laptop" ? <LaptopHardware /> : null}
      {kind === "tablet" ? <TabletHardware /> : null}
      {kind === "deck" || kind === "switch" ? (
        <svg className="cm-svg" viewBox="0 0 210 100" aria-hidden>
          <rect x="52" y="18" width="106" height="64" rx="5" fill="#1b1b19" />
          <rect x="60" y="26" width="90" height="48" rx="3" fill="#8ea3b5" />
          <rect x="8" y="12" width="46" height="76" rx="12" fill="#e23b2f" />
          <rect x="156" y="12" width="46" height="76" rx="12" fill="#2f6fe2" />
          <circle cx="31" cy="50" r="9" fill="#111110" />
        </svg>
      ) : null}
      {kind === "small" ? (
        <svg className="cm-svg" viewBox="0 0 96 96" aria-hidden>
          <circle cx="48" cy="48" r="30" fill="#1b1b19" />
          <circle cx="48" cy="48" r="10" fill="#d8d5cc" />
        </svg>
      ) : null}
      {kind === "phone" ? <PhoneHardware /> : null}
      <p className="cm-object-name">{name}</p>
    </div>
  );
}

export function ChargerObject({
  watts,
  ports,
  limit = false,
  limitTarget,
}: {
  watts: number;
  ports: number;
  limit?: boolean;
  limitTarget?: "port" | "charger";
}) {
  return (
    <div className={`cm-object is-brick${limit ? " is-limit" : ""}${limitTarget ? ` is-limit-${limitTarget}` : ""}`}>
      <div className="cm-object-shadow" />
      <ChargerBrick watts={watts} ports={ports} />
      <p className="cm-object-name">{ports} {ports === 1 ? "port" : "ports"}</p>
    </div>
  );
}

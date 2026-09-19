"use client";

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

export function PhoneHardware() {
  const id = useId();
  return (
    <svg className="cm-svg is-phone" viewBox="0 0 120 228" aria-hidden>
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c2c2a" />
          <stop offset="45%" stopColor="#141413" />
          <stop offset="100%" stopColor="#3a3936" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6f3ea" />
          <stop offset="38%" stopColor="#c9d3dc" />
          <stop offset="100%" stopColor="#7d8b97" />
        </linearGradient>
        <radialGradient id={`${id}-glint`} cx="28%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#ffffffaa" />
          <stop offset="42%" stopColor="#ffffff00" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="214" rx="28" ry="5" fill="#11111033" />
      <rect x="18" y="8" width="84" height="196" rx="18" fill={`url(#${id}-shell)`} />
      <rect x="22" y="12" width="76" height="188" rx="15" fill="#0d0d0c" />
      <rect x="26" y="28" width="68" height="156" rx="6" fill={`url(#${id}-glass)`} />
      <rect x="26" y="28" width="68" height="156" rx="6" fill={`url(#${id}-glint)`} />
      <rect x="46" y="16" width="28" height="7" rx="3.5" fill="#1b1b19" />
      <circle cx="90" cy="38" r="5.5" fill="#1f2226" />
      <circle cx="90" cy="38" r="2.2" fill="#6d7c88" />
      <rect x="14" y="58" width="4" height="22" rx="1" fill="#2a2a28" />
      <rect x="14" y="86" width="4" height="14" rx="1" fill="#2a2a28" />
      <rect x="51" y="190" width="18" height="5" rx="1.5" fill="#2c2c2a" />
      <rect x="55" y="191.5" width="10" height="2" rx="1" fill="#d8d4c8" />
    </svg>
  );
}

export function LaptopHardware() {
  const id = useId();
  return (
    <svg className="cm-svg is-laptop" viewBox="0 0 260 168" aria-hidden>
      <defs>
        <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a38" />
          <stop offset="100%" stopColor="#161615" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7eef4" />
          <stop offset="100%" stopColor="#7f93a4" />
        </linearGradient>
        <linearGradient id={`${id}-deck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a28" />
          <stop offset="100%" stopColor="#111110" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="156" rx="78" ry="7" fill="#11111028" />
      <path d="M38 18 H222 C230 18 234 24 234 32 V112 H26 V32 C26 24 30 18 38 18 Z" fill={`url(#${id}-lid)`} />
      <rect x="40" y="28" width="180" height="76" rx="3" fill={`url(#${id}-screen)`} />
      <rect x="124" y="21" width="12" height="4" rx="2" fill="#5c5c58" />
      <path d="M10 118 H250 L236 148 H24 Z" fill={`url(#${id}-deck)`} />
      <rect x="48" y="124" width="164" height="10" rx="1" fill="#3d3d3a" />
      <rect x="112" y="138" width="36" height="5" rx="2" fill="#4a4a46" />
      <rect x="236" y="126" width="8" height="5" rx="1" fill="#d8d4c8" />
    </svg>
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
  const id = useId();
  const kind = brickKind(watts, ports);
  if (kind === "small") {
    return (
      <svg className="cm-svg is-brick is-small" viewBox="0 0 120 150" aria-hidden>
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf8f1" />
            <stop offset="100%" stopColor="#cfc9bb" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="140" rx="26" ry="5" fill="#11111022" />
        <rect x="34" y="10" width="12" height="22" rx="1" fill="#2a2a28" />
        <rect x="74" y="10" width="12" height="22" rx="1" fill="#2a2a28" />
        <rect x="26" y="28" width="68" height="96" rx="10" fill={`url(#${id}-body)`} stroke="#111110" strokeWidth="1.2" />
        <rect x="38" y="40" width="44" height="2" fill="#11111014" />
        <text x="60" y="82" textAnchor="middle" className="cm-svg-watt">{watts}W</text>
        <rect x="50" y="104" width="20" height="8" rx="2" fill="#1b1b19" />
        <rect x="55" y="106" width="10" height="4" rx="1" fill="#efeee8" />
      </svg>
    );
  }
  if (kind === "multi") {
    return (
      <svg className="cm-svg is-brick is-multi" viewBox="0 0 168 150" aria-hidden>
        <defs>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7f4ec" />
            <stop offset="100%" stopColor="#b8b3a6" />
          </linearGradient>
        </defs>
        <ellipse cx="84" cy="140" rx="40" ry="6" fill="#11111022" />
        <rect x="18" y="28" width="132" height="96" rx="14" fill={`url(#${id}-body)`} stroke="#111110" strokeWidth="1.2" />
        <rect x="30" y="40" width="108" height="2" fill="#11111014" />
        <text x="84" y="78" textAnchor="middle" className="cm-svg-watt">{watts}W</text>
        {Array.from({ length: Math.min(ports, 3) }, (_, index) => (
          <g key={index}>
            <rect x={40 + index * 32} y="98" width="20" height="10" rx="2" fill="#1b1b19" />
            <rect x={45 + index * 32} y="101" width="10" height="4" rx="1" fill="#efeee8" />
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg className="cm-svg is-brick is-nano" viewBox="0 0 136 158" aria-hidden>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f1e8" />
          <stop offset="100%" stopColor="#c2bdae" />
        </linearGradient>
      </defs>
      <ellipse cx="68" cy="148" rx="30" ry="5" fill="#11111022" />
      <rect x="48" y="10" width="11" height="20" rx="1" fill="#2a2a28" />
      <rect x="77" y="10" width="11" height="20" rx="1" fill="#2a2a28" />
      <rect x="28" y="26" width="80" height="108" rx="12" fill={`url(#${id}-body)`} stroke="#111110" strokeWidth="1.2" />
      <text x="68" y="80" textAnchor="middle" className="cm-svg-watt">{watts}W</text>
      <rect x="56" y="112" width="24" height="10" rx="2" fill="#1b1b19" />
      <rect x="62" y="115" width="12" height="4" rx="1" fill="#efeee8" />
    </svg>
  );
}

export function CablePath({ watts, limit = false }: { watts: number; limit?: boolean }) {
  return (
    <svg className={`cm-cable-path${limit ? " is-limit" : ""}`} viewBox="0 0 80 120" aria-hidden>
      <path className="cm-cable-line" d="M40 6 C40 28 18 40 18 62 C18 86 40 90 40 114" />
      <rect x="32" y="0" width="16" height="12" rx="2" className="cm-cable-head" />
      <rect x="32" y="108" width="16" height="12" rx="2" className="cm-cable-head" />
      <circle className="cm-cable-current" r="3.5" cx="40" cy="8">
        <animateMotion dur="1.6s" repeatCount="indefinite" path="M40 8 C40 28 18 40 18 62 C18 86 40 90 40 112" />
      </circle>
      <text x="58" y="66" className="cm-cable-watt">{watts}W</text>
    </svg>
  );
}

export function DeviceObject({ slug, name }: { slug: string; name: string }) {
  const kind = deviceKind(slug);
  return (
    <div className={`cm-object is-${kind}`}>
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

export function ChargerObject({ watts, ports }: { watts: number; ports: number }) {
  return (
    <div className="cm-object is-brick">
      <div className="cm-object-shadow" />
      <ChargerBrick watts={watts} ports={ports} />
      <p className="cm-object-name">{ports} {ports === 1 ? "port" : "ports"}</p>
    </div>
  );
}

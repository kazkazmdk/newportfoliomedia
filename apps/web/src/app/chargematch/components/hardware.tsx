export function DeviceObject({ slug, name }: { slug: string; name: string }) {
  const kind = slug.includes("macbook")
    ? "laptop"
    : slug.includes("steam")
      ? "deck"
      : slug.includes("switch")
        ? "switch"
        : slug.includes("ipad") || slug.includes("tab")
          ? "tablet"
          : slug.includes("watch") || slug.includes("airpods")
            ? "small"
            : "phone";
  return (
    <div className={`cm-object is-${kind}`} aria-hidden>
      <div className="cm-object-shadow" />
      {kind === "laptop" ? (
        <svg className="cm-svg" viewBox="0 0 240 148">
          <defs>
            <linearGradient id="cm-lid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2a28" />
              <stop offset="100%" stopColor="#111110" />
            </linearGradient>
            <linearGradient id="cm-screen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d9e4ef" />
              <stop offset="100%" stopColor="#8ea3b5" />
            </linearGradient>
          </defs>
          <rect x="32" y="10" width="176" height="104" rx="8" fill="url(#cm-lid)" stroke="currentColor" />
          <rect x="42" y="20" width="156" height="84" rx="3" fill="url(#cm-screen)" />
          <rect x="118" y="12" width="4" height="4" rx="2" fill="#6b6a64" />
          <path d="M8 118 H232 L218 138 H22 Z" fill="#1b1b19" stroke="currentColor" />
          <rect x="104" y="126" width="32" height="5" rx="2" fill="#3a3a36" />
          <rect x="214" y="122" width="8" height="5" rx="1" className="cm-svg-fill" />
        </svg>
      ) : kind === "tablet" ? (
        <svg className="cm-svg" viewBox="0 0 148 196">
          <defs>
            <linearGradient id="cm-tab" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#eceae3" />
              <stop offset="100%" stopColor="#bdbab0" />
            </linearGradient>
          </defs>
          <rect x="16" y="8" width="116" height="180" rx="16" fill="#161614" stroke="currentColor" />
          <rect x="26" y="22" width="96" height="148" rx="4" fill="url(#cm-tab)" />
          <circle cx="74" cy="180" r="3.5" fill="#3a3a36" />
          <rect x="68" y="184" width="12" height="2" rx="1" className="cm-svg-fill" />
        </svg>
      ) : kind === "deck" || kind === "switch" ? (
        <svg className="cm-svg" viewBox="0 0 210 100">
          <rect x="52" y="18" width="106" height="64" rx="5" fill="#1b1b19" stroke="currentColor" />
          <rect x="60" y="26" width="90" height="48" rx="3" fill="#8ea3b5" />
          <rect x="8" y="12" width="46" height="76" rx="12" fill="#e23b2f" stroke="currentColor" />
          <rect x="156" y="12" width="46" height="76" rx="12" fill="#2f6fe2" stroke="currentColor" />
          <circle cx="31" cy="50" r="9" fill="#111110" />
          <circle cx="179" cy="38" r="4" fill="#111110" />
          <circle cx="179" cy="62" r="4" fill="#111110" />
        </svg>
      ) : kind === "small" ? (
        <svg className="cm-svg" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="30" fill="#1b1b19" stroke="currentColor" />
          <circle cx="48" cy="48" r="10" fill="#d8d5cc" />
          <path d="M48 18 V26" stroke="currentColor" />
        </svg>
      ) : (
        <svg className="cm-svg" viewBox="0 0 96 188">
          <defs>
            <linearGradient id="cm-phone" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4f1ea" />
              <stop offset="100%" stopColor="#9aa7b4" />
            </linearGradient>
          </defs>
          <rect x="12" y="6" width="72" height="176" rx="16" fill="#151513" stroke="currentColor" />
          <rect x="18" y="20" width="60" height="146" rx="6" fill="url(#cm-phone)" />
          <rect x="38" y="10" width="20" height="6" rx="3" fill="#2a2a28" />
          <rect x="8" y="48" width="4" height="18" rx="1" fill="#151513" />
          <rect x="8" y="72" width="4" height="12" rx="1" fill="#151513" />
          <rect x="40" y="170" width="16" height="4" rx="1" className="cm-svg-fill" />
        </svg>
      )}
      <p className="cm-object-name">{name}</p>
    </div>
  );
}

export function ChargerObject({ watts, ports }: { watts: number; ports: number }) {
  return (
    <div className="cm-object is-brick" aria-hidden>
      <div className="cm-object-shadow" />
      <svg className="cm-svg" viewBox="0 0 148 164">
        <defs>
          <linearGradient id="cm-brick" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7f4ec" />
            <stop offset="100%" stopColor="#c8c4b8" />
          </linearGradient>
        </defs>
        <rect x="24" y="30" width="100" height="114" rx="12" fill="url(#cm-brick)" stroke="currentColor" />
        <rect x="50" y="12" width="11" height="20" rx="1" fill="#2a2a28" />
        <rect x="87" y="12" width="11" height="20" rx="1" fill="#2a2a28" />
        <rect x="36" y="42" width="76" height="2" fill="#11111022" />
        {Array.from({ length: Math.min(ports, 3) }, (_, index) => (
          <g key={index}>
            <rect x={40 + index * 24} y="116" width="16" height="10" rx="2" fill="#1b1b19" />
            <rect x={44 + index * 24} y="119" width="8" height="4" rx="1" fill="#efeee8" />
          </g>
        ))}
        <text x="74" y="86" textAnchor="middle" className="cm-svg-watt">{watts}W</text>
      </svg>
      <p className="cm-object-name">{ports} {ports === 1 ? "port" : "ports"}</p>
    </div>
  );
}

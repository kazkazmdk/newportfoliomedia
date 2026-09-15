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
      {kind === "hose" ? <path className="fc-part is-hot" d="M10 28 C24 8 40 48 70 28" /> : null}
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
      {kind === "generic" ? <rect className="fc-part is-ready" x="16" y="12" width="48" height="32" rx="4" /> : null}
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

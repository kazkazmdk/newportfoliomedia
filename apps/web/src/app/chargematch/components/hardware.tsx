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
      <div className="cm-body">
        {kind === "laptop" ? <span className="cm-lid" /> : null}
        {kind === "phone" || kind === "tablet" ? <span className="cm-screen" /> : null}
        <span className="cm-port-hole" />
      </div>
      <p className="cm-mono mt-3 text-[10px] uppercase tracking-[0.16em]">{name}</p>
    </div>
  );
}

export function ChargerObject({ watts, ports }: { watts: number; ports: number }) {
  return (
    <div className="cm-object is-brick" aria-hidden>
      <div className="cm-brick">
        <span className="cm-prong" />
        <span className="cm-prong" />
        <b>{watts}W</b>
        <i>{ports} ports</i>
      </div>
    </div>
  );
}

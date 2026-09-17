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
      <div className="cm-body">
        {kind === "laptop" ? <span className="cm-lid" /> : null}
        {kind === "phone" || kind === "tablet" ? (
          <span className="cm-screen">
            <i className="cm-screen-status" />
            <i className="cm-screen-power" />
          </span>
        ) : null}
        {kind === "small" ? <span className="cm-small-light" /> : null}
        <span className="cm-port-hole" />
      </div>
      <p className="cm-object-name cm-mono">{name}</p>
    </div>
  );
}

export function ChargerObject({ watts, ports }: { watts: number; ports: number }) {
  return (
    <div className="cm-object is-brick" aria-hidden>
      <div className="cm-object-shadow" />
      <div className="cm-brick">
        <span className="cm-brick-mark cm-mono">CM</span>
        <span className="cm-brick-ports">
          {Array.from({ length: Math.min(ports, 4) }, (_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="cm-prongs"><i /><i /></span>
        <b className="cm-mono">{watts}<small>W</small></b>
        <em className="cm-mono">{ports} {ports === 1 ? "port" : "ports"}</em>
      </div>
    </div>
  );
}

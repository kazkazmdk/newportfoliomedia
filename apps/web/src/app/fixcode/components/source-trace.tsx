"use client";

import type { ProvenanceRecord } from "@penta/data-provenance";
import { StateBadge } from "./system-ui";

function humanType(value: string) {
  if (value === "MANUFACTURER") return "Manufacturer";
  return value.replaceAll("_", " ").toLowerCase();
}

export function SourceTrace({
  open,
  onClose,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  rows: ProvenanceRecord[];
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-[#161513]/20"
          aria-label="Close source drawer"
          onClick={onClose}
        />
      ) : null}
      <aside className={`fc-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="flex items-center justify-between">
          <div>
            <p className="fc-kicker">Source trace</p>
            <p className="mt-2 text-sm text-[var(--fc-mute)]">Evidence attached to this diagnostic record.</p>
          </div>
          <button type="button" className="fixcode-mono text-xs uppercase tracking-[0.16em]" onClick={onClose}>
            Close
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-[var(--fc-mute)]">No provenance rows on this surface.</p>
        ) : (
          <ul className="mt-8 grid gap-8">
            {rows.map((row, index) => (
              <li key={row.source_id} className="fc-evidence">
                <div className="fc-evidence-heading">
                  <span className="fc-section-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-xl">{row.source_name ?? "Documented source"}</p>
                    <StateBadge state={row.verified_at ? "ready" : "caution"}>{row.verified_at ? "Locator verified" : "General source"}</StateBadge>
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--fc-mute)]">
                  <div>
                    <dt>Source type</dt>
                    <dd className="text-[var(--fc-ink)]">{humanType(row.source_type)}</dd>
                  </div>
                  <div>
                    <dt>Locator</dt>
                    <dd className="text-[var(--fc-ink)]">{row.verified_at ? "verified" : "general / unverified"}</dd>
                  </div>
                  <div>
                    <dt>Retrieved</dt>
                    <dd className="text-[var(--fc-ink)]">{row.retrieved_at.slice(0, 10)}</dd>
                  </div>
                  {row.locator?.section ? (
                    <div>
                      <dt>Section</dt>
                      <dd className="text-[var(--fc-ink)]">{row.locator.section}</dd>
                    </div>
                  ) : null}
                </dl>
                {row.source_url ? (
                  <a className="fc-run mt-5 inline-block text-center" href={row.source_url}>
                    Open original source
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}

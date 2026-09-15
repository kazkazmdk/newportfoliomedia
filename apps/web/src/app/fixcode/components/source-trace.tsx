"use client";

import type { ProvenanceRecord } from "@penta/data-provenance";

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
          aria-label="Close source trace"
          onClick={onClose}
        />
      ) : null}
      <aside className={`fc-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="flex items-center justify-between">
          <p className="fc-kicker">Source trace</p>
          <button type="button" className="fixcode-mono text-xs uppercase tracking-[0.16em]" onClick={onClose}>
            Close
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-[var(--fc-mute)]">No provenance rows on this surface.</p>
        ) : (
          <ul className="mt-8 grid gap-6">
            {rows.map((row) => (
              <li key={row.source_id} className="border-t border-[var(--fc-line)] pt-4">
                <p className="text-lg">{row.source_name}</p>
                <p className="fixcode-mono mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--fc-mute)]">
                  {row.source_type} · {row.verification_method}
                </p>
                <p className="mt-3 text-sm">Retrieved {row.retrieved_at.slice(0, 10)}</p>
                {row.locator?.section ? <p className="mt-1 text-sm">{row.locator.section}</p> : null}
                <p className="mt-2 text-sm">
                  {row.verified_at ? "Locator verified" : "General / unverified"}
                </p>
                {row.source_url ? (
                  <a className="mt-3 inline-block text-sm underline" href={row.source_url}>
                    Origin
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

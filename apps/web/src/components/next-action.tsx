"use client";

import { useState } from "react";
import { COMMERCE_SURFACE, type SiteId } from "@penta/monetization";
import { LeadForm } from "@/components/lead-form";

export function NextAction({
  site,
  entityId,
  official,
}: {
  site: SiteId;
  entityId?: string;
  official?: { href: string; label: string; sourceName: string };
}) {
  const surface = COMMERCE_SURFACE[site];
  const [open, setOpen] = useState(false);

  async function trackOutbound() {
    if (!official) return;
    await fetch("/api/v1/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "outbound_click",
        site,
        entityId,
        properties: { href: official.href, affiliate: false, sourceName: official.sourceName },
      }),
    });
  }

  return (
    <aside className={`px-next is-${site}`} data-shop="false" data-affiliate="false">
      <p className="px-next-kicker">{surface.title}</p>
      <p>{surface.body}</p>
      {official ? (
        <a
          className="px-next-out"
          href={official.href}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => {
            void trackOutbound();
          }}
        >
          {official.label}
          <small>Official source · not an affiliate hop · {official.sourceName}</small>
        </a>
      ) : (
        <p className="px-next-empty">No official URL is on file for this entity. A link is not invented.</p>
      )}
      <button type="button" className="px-next-lead" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide local request" : "Store a local request"}
      </button>
      {open ? <LeadForm site={site} kind={surface.leadKind} /> : null}
    </aside>
  );
}

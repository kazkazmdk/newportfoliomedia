"use client";

import { useState } from "react";
import { EMPTY_NETWORK_COPY, type LeadKind, type SiteId } from "@penta/monetization";

export function LeadForm({ site, kind }: { site: SiteId; kind: LeadKind }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <form
      className="px-lead"
      onSubmit={async (event) => {
        event.preventDefault();
        setState("saving");
        const data = new FormData(event.currentTarget);
        const response = await fetch("/api/v1/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            site,
            kind,
            contact: String(data.get("contact") ?? ""),
            message: String(data.get("message") ?? ""),
            company: String(data.get("company") ?? ""),
            consent: data.get("consent") === "on",
            sourcePage: window.location.pathname,
            entityId: String(data.get("entity") ?? "") || undefined,
          }),
        });
        const json = (await response.json()) as { message?: string; error?: { message?: string } | string };
        if (!response.ok) {
          setState("error");
          setMessage(typeof json.error === "string" ? json.error : json.error?.message ?? "Could not store the request.");
          return;
        }
        setState("saved");
        setMessage(json.message ?? EMPTY_NETWORK_COPY[site]);
      }}
    >
      <p className="px-lead-kicker">Local request · {kind.replaceAll("_", " ")}</p>
      <label>
        Contact
        <input name="contact" type="email" required placeholder="you@example.test" />
      </label>
      <label className="sr-only">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <label>
        What do you need?
        <textarea name="message" required rows={4} maxLength={2000} />
      </label>
      <label>
        <input name="consent" type="checkbox" required /> I understand this is stored locally, not sent to a partner.
      </label>
      <button type="submit" disabled={state === "saving"}>
        {state === "saving" ? "Storing locally…" : "Store locally"}
      </button>
      {state === "saved" ? <p className="px-lead-ok">{message}</p> : null}
      {state === "error" ? <p className="px-lead-err">{message}</p> : null}
      {state === "idle" ? <p className="px-lead-note">{EMPTY_NETWORK_COPY[site]}</p> : null}
    </form>
  );
}

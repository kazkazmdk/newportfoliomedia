"use client";

import { useState } from "react";
import type { SiteId } from "@penta/monetization";

export function LocalKeyForm({ site }: { site: SiteId }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="px-key"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const data = new FormData(event.currentTarget);
        const response = await fetch("/api/v1/keys", {
          method: "POST",
          headers: { "content-type": "application/json", "x-penta-dev-actor": "local" },
          body: JSON.stringify({ site, label: String(data.get("label") ?? "") }),
        });
        const json = (await response.json()) as { token?: string; error?: string; message?: string };
        if (!response.ok || !json.token) {
          setError(json.error ?? "Could not issue a local key.");
          return;
        }
        setToken(json.token);
      }}
    >
      <p className="px-lead-kicker">Issue a local key</p>
      <label>
        Label
        <input name="label" placeholder={`${site} bench`} />
      </label>
      <button type="submit">Create hashed key</button>
      {token ? (
        <p className="px-key-token">
          Shown once: <code>{token}</code>
          <span> Not billed. Not a production credential.</span>
        </p>
      ) : (
        <p className="px-lead-note">No rate card. Soft-cap metering stays on this machine.</p>
      )}
      {error ? <p className="px-lead-err">{error}</p> : null}
    </form>
  );
}

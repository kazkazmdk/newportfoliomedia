"use client";

import { useEffect, useState } from "react";
import { SITE_LABEL, type SiteId } from "@penta/monetization";

export function EmbedTool({
  site,
  query,
}: {
  site: SiteId;
  query: Record<string, string | string[] | undefined>;
}) {
  const [result, setResult] = useState<string>("Choose an entity that already exists.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/v1/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "widget_loaded", site, path: `/embed/${site}` }),
    });
  }, [site]);

  async function run(path: string, body: Record<string, unknown>) {
    setError(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(typeof json.error === "string" ? json.error : "unknown_entity");
      setResult("No verified row. Nothing is invented.");
      return;
    }
    setResult(JSON.stringify(json, null, 2));
    await fetch("/api/v1/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "widget_completed", site, path: `/embed/${site}` }),
    });
  }

  return (
    <div className="px-embed-card">
      <p className="px-embed-mark">{SITE_LABEL[site]}</p>
      <p className="px-embed-note">Same-origin widget. First-party engine only. No shop.</p>
      {site === "fixcode" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run("/api/fixcode/diagnose", {
              brand: data.get("brand"),
              appliance: data.get("appliance"),
              error: data.get("error"),
            });
          }}
        >
          <input name="brand" defaultValue={str(query.brand) || "samsung"} aria-label="Brand" />
          <input name="appliance" defaultValue={str(query.appliance) || "washer"} aria-label="Appliance" />
          <input name="error" defaultValue={str(query.error) || "4C"} aria-label="Code" />
          <button type="submit">Diagnose</button>
        </form>
      ) : null}
      {site === "chargematch" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run("/api/chargematch/compatibility", {
              device: data.get("device"),
              charger: data.get("charger"),
            });
          }}
        >
          <input name="device" defaultValue={str(query.device) || "iphone-16"} aria-label="Device" />
          <input name="charger" defaultValue={str(query.charger) || "anker-100w-2c"} aria-label="Charger" />
          <button type="submit">Check rated path</button>
        </form>
      ) : null}
      {site === "tripcost" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run("/api/tripcost/compare", {
              origin: data.get("origin"),
              destination: data.get("destination"),
            });
          }}
        >
          <input name="origin" defaultValue={str(query.origin) || "paris"} aria-label="From" />
          <input name="destination" defaultValue={str(query.destination) || "lyon"} aria-label="To" />
          <button type="submit">Compare corridor</button>
        </form>
      ) : null}
      {site === "autospec" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run("/api/autospec/vehicle", {
              make: data.get("make"),
              model: data.get("model"),
              generation: data.get("generation"),
              variant: data.get("variant"),
            });
          }}
        >
          <input name="make" defaultValue={str(query.make) || "bmw"} aria-label="Make" />
          <input name="model" defaultValue={str(query.model) || "3-series"} aria-label="Model" />
          <input name="generation" defaultValue={str(query.generation) || "g20"} aria-label="Generation" />
          <input name="variant" defaultValue={str(query.variant) || "330e"} aria-label="Variant" />
          <button type="submit">Inspect vehicle</button>
        </form>
      ) : null}
      {site === "wearthere" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run("/api/wearthere/packing", {
              destination: data.get("destination"),
              month: Number(data.get("month") || 10),
            });
          }}
        >
          <input name="destination" defaultValue={str(query.destination) || "lisbon"} aria-label="City" />
          <input name="month" defaultValue={str(query.month) || "10"} aria-label="Month" />
          <button type="submit">Build capsule</button>
        </form>
      ) : null}
      {error ? <p className="px-embed-err">{error}</p> : null}
      <pre>{result}</pre>
    </div>
  );
}

function str(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

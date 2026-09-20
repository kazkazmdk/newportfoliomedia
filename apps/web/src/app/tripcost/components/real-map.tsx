"use client";

import { useEffect, useId, useRef, useState } from "react";
import { coordOf, corridorKind, greatCircle } from "./geo";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

function applyTripCostPaint(map: import("maplibre-gl").Map) {
  const water = "#16324a";
  const land = "#d9ddd4";
  const ink = "#0a1628";
  const mute = "#6d7b82";
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", "#cfd6d3");
    }
    if (layer.type === "fill") {
      if (id.includes("water")) map.setPaintProperty(layer.id, "fill-color", water);
      else if (id.includes("park") || id.includes("wood") || id.includes("landcover")) {
        map.setPaintProperty(layer.id, "fill-color", "#c7d0c4");
      } else if (id.includes("building")) {
        map.setPaintProperty(layer.id, "fill-color", "#c3c8c3");
        map.setPaintProperty(layer.id, "fill-opacity", 0.35);
      } else if (id.includes("land") || id.includes("earth")) {
        map.setPaintProperty(layer.id, "fill-color", land);
      }
    }
    if (layer.type === "line") {
      if (id.includes("water")) map.setPaintProperty(layer.id, "line-color", water);
      else if (id.includes("boundary") || id.includes("admin") || id.includes("border")) {
        map.setPaintProperty(layer.id, "line-color", "#8b9594");
        map.setPaintProperty(layer.id, "line-opacity", 0.55);
      } else if (id.includes("rail")) {
        map.setPaintProperty(layer.id, "line-color", "#7a6860");
        map.setPaintProperty(layer.id, "line-opacity", 0.45);
      } else if (id.includes("road") || id.includes("transport") || id.includes("highway")) {
        map.setPaintProperty(layer.id, "line-color", "#b7bdb8");
        map.setPaintProperty(layer.id, "line-opacity", 0.55);
      }
    }
    if (layer.type === "symbol") {
      try {
        map.setPaintProperty(layer.id, "text-color", id.includes("water") ? "#d7e4ea" : ink);
        map.setPaintProperty(layer.id, "text-halo-color", "#e7ebe6");
        map.setPaintProperty(layer.id, "text-halo-width", 1.1);
      } catch {
        /* layer without text paint */
      }
      if (id.includes("place") || id.includes("label")) {
        try {
          map.setPaintProperty(layer.id, "text-color", mute);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

export function RealWorldMap({
  from,
  to,
  mode = "train",
  fromName,
  toName,
}: {
  from?: string;
  to?: string;
  mode?: string;
  fromName?: string;
  toName?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const titleId = useId();
  const a = from ? coordOf(from) : null;
  const b = to ? coordOf(to) : null;
  const corridor = corridorKind(mode);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;

    (async () => {
      try {
        const maplibre = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !host.current) return;
        map = new maplibre.Map({
          container: host.current,
          style: STYLE_URL,
          center: a ? [a.lon, a.lat] : [6.2, 47.2],
          zoom: a && b ? 5 : 4.1, // initial camera only; later fits happen in the data effect
          attributionControl: false,
          cooperativeGestures: true,
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-left");
        map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");
        map.on("load", () => {
          if (cancelled || !map) return;
          applyTripCostPaint(map);
          map.addSource("tc-corridor", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "tc-corridor-halo",
            type: "line",
            source: "tc-corridor",
            paint: { "line-color": "#f4efe4", "line-width": 8, "line-opacity": 0.8 },
          });
          map.addLayer({
            id: "tc-corridor-line",
            type: "line",
            source: "tc-corridor",
            paint: {
              "line-color": "#dc3f2f",
              "line-width": 2.4,
              "line-dasharray": mode === "flight" ? [1, 0] : [2.2, 1.4],
            },
          });
          map.addLayer({
            id: "tc-ends",
            type: "circle",
            source: "tc-corridor",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": 5,
              "circle-color": "#f4efe4",
              "circle-stroke-color": "#dc3f2f",
              "circle-stroke-width": 2,
            },
          });
          mapRef.current = map;
          setStatus("ready");
        });
        map.on("error", () => {
          if (!cancelled) setStatus((current) => (current === "ready" ? current : "failed"));
        });
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
    // Map instance is created once per mount. Corridor updates live in the second effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const source = map.getSource("tc-corridor") as import("maplibre-gl").GeoJSONSource | undefined;
    if (!source) return;
    if (!a || !b) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const line = greatCircle(a, b, mode === "flight" ? 64 : 32);
    source.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { kind: corridor.kind },
          geometry: { type: "LineString", coordinates: line },
        },
        {
          type: "Feature",
          properties: { end: "A" },
          geometry: { type: "Point", coordinates: [a.lon, a.lat] },
        },
        {
          type: "Feature",
          properties: { end: "B" },
          geometry: { type: "Point", coordinates: [b.lon, b.lat] },
        },
      ],
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const west = Math.min(a.lon, b.lon);
    const south = Math.min(a.lat, b.lat);
    const east = Math.max(a.lon, b.lon);
    const north = Math.max(a.lat, b.lat);
    map.fitBounds([[west, south], [east, north]], {
      padding: 72,
      duration: reduced ? 0 : 900,
      maxZoom: 8.4,
    });
  }, [a, b, corridor.kind, mode, status]);

  return (
    <div className="tc-realmap" data-map-status={status} data-corridor={corridor.kind} data-mode={mode}>
      <div
        ref={host}
        className="tc-realmap-canvas"
        role="img"
        aria-labelledby={titleId}
      />
      <p id={titleId} className="sr-only">
        {fromName && toName
          ? `${fromName} to ${toName}. ${corridor.note}`
          : `TripCost world map. ${corridor.note}`}
      </p>
      {status !== "ready" ? (
        <div className="tc-realmap-state" aria-live="polite">
          <span>{status === "failed" ? "World map unavailable" : "Loading world map"}</span>
          {a && b ? (
            <strong>
              {fromName ?? from} → {toName ?? to}
            </strong>
          ) : (
            <strong>Western Europe corridors</strong>
          )}
        </div>
      ) : null}
    </div>
  );
}

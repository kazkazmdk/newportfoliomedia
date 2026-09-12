"use client";

import { CABLES, CHARGERS, DEVICES, compatibility, kitOptimize } from "@penta/chargematch";
import { useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";

export function KitApp() {
  const [goal, setGoal] = useState<"MINIMUM_WEIGHT" | "MINIMUM_COST" | "FASTEST_CHARGING">("MINIMUM_WEIGHT");
  const devices = DEVICES.filter((d) => ["iphone-16", "macbook-air-13-m3", "steam-deck", "airpods-pro-usbc", "apple-watch"].includes(d.slug));
  const ranked = useMemo(() => kitOptimize(devices.filter((d) => d.connector !== "Watch"), CHARGERS, goal), [devices, goal]);

  return (
    <div>
      <p className="cm-mono text-xs tracking-[0.18em]">PRIVATE KIT · NOINDEX</p>
      <h1 className="mt-3 text-4xl">My Power Kit</h1>
      <ul className="mt-6 grid gap-2">
        {devices.map((d) => (
          <li key={d.id} className="cm-box px-4 py-3 flex justify-between">
            <span>{d.name}</span>
            <span className="cm-mono text-sm">{d.max_watts} W in</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">Apple Watch still needs its puck. A USB-C brick does not replace it.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {(["MINIMUM_WEIGHT", "MINIMUM_COST", "FASTEST_CHARGING"] as const).map((g) => (
          <button key={g} className={`px-3 py-2 text-sm ${goal === g ? "cm-cta" : "cm-box"}`} onClick={() => setGoal(g)} type="button">
            {g.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <ol className="mt-6 grid gap-3">
        {ranked.slice(0, 3).map((row) => (
          <li key={row.charger.id} className="cm-box p-4">
            <p className="cm-mono">{row.charger.name}</p>
            <p className="mt-1 text-sm">{row.allOk ? "Covers USB-C devices in this kit" : "Does not cover every device"}</p>
          </li>
        ))}
      </ol>
      <section className="mt-10 cm-box p-5">
        <h2 className="text-xl">Scan a charger label</h2>
        <p className="mt-2 text-sm">OCR is confirmation-gated. We will not invent PDOs from a blurry photo.</p>
        <input type="file" accept="image/*" className="mt-3 block text-sm" />
        <p className="mt-3 text-sm">Known cables: {CABLES.map((c) => c.name).join(" · ")}</p>
      </section>
      <p className="mt-6 text-sm">
        Example: MacBook Air on C1 45W, iPhone on C2 20W of a 100W brick — {compatibility(DEVICES[2], CHARGERS[4]).explanation}
      </p>
      <div className="mt-8">
        <Feedback site="chargematch" />
      </div>
    </div>
  );
}

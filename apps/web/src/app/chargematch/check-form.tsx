"use client";

import { CHARGERS, DEVICES } from "@penta/chargematch";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CheckForm() {
  const router = useRouter();
  const [device, setDevice] = useState("macbook-air-13-m3");
  const [charger, setCharger] = useState("anker-65w");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/chargematch/${device}/with/${charger}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm">
        Device
        <select className="cm-box px-3 py-3" value={device} onChange={(e) => setDevice(e.target.value)}>
          {DEVICES.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Charger
        <select className="cm-box px-3 py-3" value={charger} onChange={(e) => setCharger(e.target.value)}>
          {CHARGERS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button className="cm-cta w-fit" type="submit">
        Check compatibility
      </button>
      <button className="border border-[#111] px-4 py-3 text-sm" type="button" onClick={() => router.push("/chargematch/kit")}>
        Scan my setup
      </button>
    </form>
  );
}

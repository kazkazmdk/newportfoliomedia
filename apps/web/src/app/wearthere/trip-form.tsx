"use client";

import { DESTINATIONS } from "@penta/wearthere";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function TripForm() {
  const router = useRouter();
  const [city, setCity] = useState("paris");
  const [start, setStart] = useState("2026-10-12");
  const [end, setEnd] = useState("2026-10-17");
  const [style, setStyle] = useState("classic");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/wearthere/trip?city=${city}&start=${start}&end=${end}&style=${style}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-3">
      <label className="grid gap-1 text-sm">
        Destination
        <select className="wt-card px-3 py-3" value={city} onChange={(e) => setCity(e.target.value)}>
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.city}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          From
          <input type="date" className="wt-card px-3 py-3" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          To
          <input type="date" className="wt-card px-3 py-3" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Style
        <select className="wt-card px-3 py-3" value={style} onChange={(e) => setStyle(e.target.value)}>
          {["minimal","streetwear","classic","business","outdoor","luxury","casual"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <button className="wt-cta w-fit" type="submit">
        Plan my outfits
      </button>
      <p className="text-sm text-[#5a4c43]">Secondary: scan a wardrobe on the trip page. Nothing is sold until a real gap is found.</p>
    </form>
  );
}

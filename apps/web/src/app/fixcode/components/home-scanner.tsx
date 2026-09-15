"use client";

import { ALL_ERRORS } from "@penta/fixcode";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { SpringButton } from "@/components/creative";
import { MachineVisual, zoneFromText } from "./machine-visual";

export function HomeScanner() {
  const router = useRouter();
  const [code, setCode] = useState("4C");
  const [brand, setBrand] = useState("samsung");
  const [appliance, setAppliance] = useState("washer");
  const [note, setNote] = useState("");

  const match = useMemo(
    () => ALL_ERRORS.find((e) => e.brand_slug === brand && e.appliance_slug === appliance && e.code.toLowerCase() === code.trim().toLowerCase()),
    [brand, appliance, code],
  );
  const zone = zoneFromText(`${code} ${note} ${match?.meaning ?? ""} ${match?.causes[0]?.name ?? ""}`);

  function go(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ brand, appliance, code, note });
    router.push(`/fixcode/diagnose?${params.toString()}`);
  }

  return (
    <section className="fc-hero">
      <div className="fc-hero-copy">
        <div>
          <p className="fc-kicker">Premium technical diagnostic · FC.01</p>
          <h1 className="fc-display mt-6">
            What is your
            <br />
            machine trying
            <br />
            to say?
          </h1>
        </div>
        <form onSubmit={go} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="fc-field">
              <span>Brand</span>
              <select className="fc-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="samsung">Samsung</option>
                <option value="lg">LG</option>
                <option value="bosch">Bosch</option>
                <option value="miele">Miele</option>
              </select>
            </label>
            <label className="fc-field">
              <span>Appliance</span>
              <select className="fc-select" value={appliance} onChange={(e) => setAppliance(e.target.value)}>
                <option value="washer">Washer</option>
                <option value="dishwasher">Dishwasher</option>
                <option value="dryer">Dryer</option>
                <option value="fridge">Fridge</option>
              </select>
            </label>
            <label className="fc-field">
              <span>Error</span>
              <input className="fc-input" value={code} onChange={(e) => setCode(e.target.value)} />
            </label>
          </div>
          <label className="fc-field">
            <span>Observed</span>
            <input
              className="fc-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Water never enters the drum"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <SpringButton className="fc-run" type="submit">
              Run diagnostic
            </SpringButton>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => router.push("/fixcode/diagnose?mode=scan")}>
              Scan the panel
            </button>
          </div>
          {match ? (
            <p className="fixcode-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fc-mute)]">
              {match.code} · {match.meaning} · {match.confidence}
            </p>
          ) : (
            <p className="text-sm text-[var(--fc-mute)]">Unknown codes stay unknown. We do not invent a tree.</p>
          )}
        </form>
      </div>
      <div className="fc-stage">
        <div className={`fc-scan ${match ? "ready" : ""}`} />
        <MachineVisual zone={zone} ready={Boolean(match)} appliance={appliance} />
        <p className="absolute bottom-5 left-5 fixcode-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fc-mute)]">
          {zone === "none" ? "Scan idle" : `Focus · ${zone}`}
        </p>
      </div>
    </section>
  );
}

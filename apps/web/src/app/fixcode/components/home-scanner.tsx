"use client";

import { ALL_ERRORS, APPLIANCES, BRANDS } from "@penta/fixcode";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CursorCanvas, SpringButton } from "@/components/creative";
import { MachineVisual, zoneFromText } from "./machine-visual";
import { ProcessRail, StateBadge } from "./system-ui";

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
          <div className="fc-eyebrow-row">
            <p className="fc-kicker">Error-code diagnostic instrument</p>
            <StateBadge state={match ? "ready" : "idle"}>
              {match ? "Verified tree found" : "Awaiting exact match"}
            </StateBadge>
          </div>
          <h1 className="fc-display mt-6">
            Identify the fault.
            <br />
            Take the safe
            <br />next step.
          </h1>
          <p className="fc-hero-intro">
            Match the nameplate details and displayed code before acting. FixCode only opens diagnostic trees that are on file.
          </p>
        </div>
        <ProcessRail active={1} />
        <form onSubmit={go} className="fc-identify-panel">
          <div className="fc-panel-heading">
            <span className="fc-panel-index">01</span>
            <div>
              <p className="fc-kicker">Identify the machine</p>
              <p className="mt-1 text-sm text-[var(--fc-mute)]">Use the label on the appliance and the code exactly as shown.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="fc-field">
              <span>Brand</span>
              <select className="fc-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {BRANDS.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="fc-field">
              <span>Appliance</span>
              <select className="fc-select" value={appliance} onChange={(e) => setAppliance(e.target.value)}>
                {APPLIANCES.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="fc-field">
              <span>Error code</span>
              <input className="fc-input fixcode-mono" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
            </label>
          </div>
          <label className="fc-field">
            <span>Observed symptom · optional</span>
            <input
              className="fc-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Water never enters the drum"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <SpringButton className="fc-run" type="submit">
              Open diagnostic tree
            </SpringButton>
            <button type="button" className="fc-secondary-action" onClick={() => router.push("/fixcode/diagnose?mode=scan")}>
              Add a panel photo
            </button>
          </div>
          <p className="fc-form-note">
            Photos are supporting context only. FixCode does not run automated visual identification; you confirm every detail.
          </p>
          {match ? (
            <div className="fc-match-readout" role="status">
              <StateBadge state="ready" />
              <p><strong>{match.brand} {match.appliance} · {match.code}</strong><span>{match.meaning} · {match.confidence} confidence</span></p>
            </div>
          ) : (
            <div className="fc-match-readout" role="status">
              <StateBadge state="caution">Not on file</StateBadge>
              <p><strong>No verified match</strong><span>Unknown codes stay unknown. We do not invent a tree.</span></p>
            </div>
          )}
        </form>
      </div>
      <CursorCanvas label="System diagram" color="#161513" className="fc-stage">
        <div className="fc-stage-header">
          <span className="fixcode-mono">FC / SYSTEM MAP</span>
          <StateBadge state={match ? "ready" : "idle"} />
        </div>
        <div className={`fc-scan ${match ? "ready" : ""}`} />
        <MachineVisual zone={zone} ready={Boolean(match)} appliance={appliance} />
        <div className="fc-stage-readout">
          <span className="fixcode-mono">{zone === "none" ? "No component focus" : `Text-derived focus · ${zone}`}</span>
          <span>Diagram responds to typed fields only</span>
        </div>
      </CursorCanvas>
    </section>
  );
}

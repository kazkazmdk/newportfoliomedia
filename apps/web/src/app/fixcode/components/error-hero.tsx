"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ErrorProfile, SymptomProfile } from "@penta/fixcode";
import { CursorCanvas } from "@/components/creative";
import { MachineVisual, type WaterStep, zoneFromText } from "./machine-visual";
import { SourceTrace } from "./source-trace";

const WATER_STEPS: Array<{ id: WaterStep; title: string; copy: string }> = [
  { id: "source", title: "Water source", copy: "Confirm the tap is open and the house supply is live." },
  { id: "hose", title: "Hose and filter", copy: "The inlet hose and mesh screen are the next restriction." },
  { id: "valve", title: "Inlet valve", copy: "If water reaches the machine but the drum stays dry, the valve is next." },
  { id: "control", title: "Sensor and control", copy: "If the path is clear, the machine may not be seeing flow." },
];

export function ErrorHero({
  profile,
  brand,
  appliance,
}: {
  profile: ErrorProfile | SymptomProfile;
  brand: string;
  appliance: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const isError = "code" in profile;
  const code = isError ? profile.code : profile.symptom;
  const water = /4c|4e|water supply/i.test(`${code} ${profile.meaning}`);
  const zone = zoneFromText(`${code} ${profile.meaning} ${profile.causes[0]?.name ?? ""}`);

  useEffect(() => {
    if (!water) return;
    const nodes = Array.from(document.querySelectorAll("[data-water-step]"));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const idx = Number((hit.target as HTMLElement).dataset.waterStep);
        if (!Number.isNaN(idx)) setStep(idx);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.2, 0.6] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [water]);

  return (
    <>
      <section className="fc-hero">
        <SourceTrace open={open} onClose={() => setOpen(false)} rows={profile.provenance} />
        <div className="fc-hero-copy">
          <nav className="fc-kicker">
            <Link href={`/fixcode/${brand}`}>{profile.brand ?? brand}</Link>
            {" / "}
            <Link href={`/fixcode/${brand}/${appliance}`}>{profile.appliance}</Link>
          </nav>
          <div>
            <p className="fc-kicker mt-8">
              {isError ? `Error ${profile.code}` : profile.symptom} · {profile.confidence} confidence
            </p>
            <h1 className="fc-code-giant mt-3">{isError ? profile.code : "SY"}</h1>
            <p className="mt-4 text-2xl leading-snug">{profile.meaning}</p>
            <p className="mt-3 text-sm text-[var(--fc-mute)]">
              {profile.brand} {profile.appliance}
            </p>
          </div>
          <button type="button" className="fc-kicker w-fit" onClick={() => setOpen(true)}>
            Open source trace
          </button>
        </div>
        <CursorCanvas label="Trace" color="#161513" className="fc-stage">
          <div className="fc-scan ready" />
          <MachineVisual
            zone={zone}
            ready
            appliance={appliance}
            step={water ? WATER_STEPS[step]?.id : zone}
          />
        </CursorCanvas>
      </section>
      {water ? (
        <div className="fc-pin-wrap">
          <div className="fc-pin-visual">
            <MachineVisual zone="inlet" ready appliance={appliance} step={WATER_STEPS[step]?.id} />
          </div>
          <div className="fc-pin-copy">
            {WATER_STEPS.map((row, i) => (
              <article key={row.id} data-water-step={i} className={`fc-scene ${step === i ? "is-on" : ""}`}>
                <p className="fc-kicker">{row.title}</p>
                <p className="mt-4 max-w-xl text-3xl leading-tight">{row.copy}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

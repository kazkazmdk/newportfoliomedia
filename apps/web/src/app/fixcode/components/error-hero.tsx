"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ErrorProfile, SymptomProfile } from "@penta/fixcode";
import { CursorCanvas } from "@/components/creative";
import { CheckDiagram, checkKindFromText } from "./machine-diagrams";
import { MachineVisual, type WaterStep, zoneFromText } from "./machine-visual";
import { SourceTrace } from "./source-trace";
import { StateBadge, type FixcodeState } from "./system-ui";

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
  diagnoseHref,
}: {
  profile: ErrorProfile | SymptomProfile;
  brand: string;
  appliance: string;
  diagnoseHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const isError = "code" in profile;
  const code = isError ? profile.code : profile.symptom;
  const water = /4c|4e|water supply/i.test(`${code} ${profile.meaning}`);
  const zone = zoneFromText(`${code} ${profile.meaning} ${profile.causes[0]?.name ?? ""}`);
  const first = profile.questions[0];
  const safetyState: FixcodeState = profile.causes.some((cause) => cause.safety === "STOP_USE" || cause.safety === "PROFESSIONAL_ONLY")
    ? "stop"
    : profile.causes.some((cause) => cause.safety === "CAUTION")
      ? "caution"
      : "ready";

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
            <div className="fc-eyebrow-row mt-8">
              <p className="fc-kicker">{isError ? `Error ${profile.code}` : profile.symptom} · {profile.confidence} confidence</p>
              <StateBadge state={safetyState} />
            </div>
            <h1 className="fc-code-giant mt-3">{isError ? profile.code : "SY"}</h1>
            <p className="mt-4 text-2xl leading-snug">{profile.meaning}</p>
            <dl className="fc-identity-plate">
              <div><dt>Brand</dt><dd>{profile.brand ?? brand}</dd></div>
              <div><dt>Appliance</dt><dd>{profile.appliance}</dd></div>
              <div><dt>Record</dt><dd>{isError ? profile.code : "Symptom path"}</dd></div>
            </dl>
            {first ? (
              <div className="fc-do-first mt-6">
                <div className="fc-first-heading">
                  <span className="fc-panel-index">01</span>
                  <div>
                    <p className="fc-kicker">First reversible check</p>
                    <StateBadge state="ready">Start here</StateBadge>
                  </div>
                </div>
                <p className="mt-2 text-xl leading-snug">{first.text}</p>
                <p className="mt-2 text-sm text-[var(--fc-mute)]">{first.why}</p>
                <div className="mt-4">
                  <CheckDiagram kind={checkKindFromText(`${first.text} ${first.why}`)} />
                </div>
                <Link href={diagnoseHref} className="fc-run mt-4 inline-block">
                  Start guided check
                </Link>
              </div>
            ) : null}
          </div>
          <button type="button" className="fc-kicker w-fit" onClick={() => setOpen(true)}>
            Evidence / source
          </button>
        </div>
        <CursorCanvas label="System diagram" color="#161513" className="fc-stage">
          <div className="fc-stage-header">
            <span className="fixcode-mono">FC / DOCUMENTED PATH</span>
            <StateBadge state={safetyState} />
          </div>
          <div className="fc-scan ready" />
          <MachineVisual
            zone={zone}
            ready
            appliance={appliance}
            step={water ? WATER_STEPS[step]?.id : zone}
          />
          <div className="fc-stage-readout">
            <span className="fixcode-mono">Diagram focus · {water ? WATER_STEPS[step]?.id : zone}</span>
            <span>Mapped from this documented diagnostic tree</span>
          </div>
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
                <div className="fc-section-label">
                  <span className="fc-section-number">{String(i + 1).padStart(2, "0")}</span>
                  <p className="fc-kicker">{row.title}</p>
                </div>
                <p className="mt-4 max-w-xl text-3xl leading-tight">{row.copy}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import type { ErrorProfile, SymptomProfile } from "@penta/fixcode";
import { MachineVisual, zoneFromText } from "./machine-visual";
import { SourceTrace } from "./source-trace";

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
  const isError = "code" in profile;
  const zone = zoneFromText(`${isError ? profile.code : profile.symptom} ${profile.meaning} ${profile.causes[0]?.name ?? ""}`);
  return (
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
          <p className="mt-4 text-2xl leading-snug">
            {isError ? profile.meaning : profile.meaning}
          </p>
          <p className="mt-3 text-sm text-[var(--fc-mute)]">
            {profile.brand} {profile.appliance}
          </p>
        </div>
        <button type="button" className="fc-kicker w-fit" onClick={() => setOpen(true)}>
          Open source trace
        </button>
      </div>
      <div className="fc-stage">
        <div className="fc-scan ready" />
        <MachineVisual zone={zone} ready appliance={appliance} />
      </div>
    </section>
  );
}

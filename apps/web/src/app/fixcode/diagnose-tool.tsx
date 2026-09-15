"use client";

import { applyAnswer, diagnose, getError, getSymptom, initialState, isBlocked, reportOutcome, type DiagnosisResult, type DiagnosisState, type OutcomeId } from "@penta/fixcode";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Feedback } from "@/components/feedback";
import { AnimatedNumber } from "@/components/creative";
import { MachineVisual, zoneFromText } from "./components/machine-visual";
import { SourceTrace } from "./components/source-trace";

export function DiagnoseTool() {
  const params = useSearchParams();
  const brand = params.get("brand") ?? "samsung";
  const appliance = params.get("appliance") ?? "washer";
  const code = params.get("code") ?? "4C";
  const mode = params.get("mode");
  const profile = useMemo(
    () => getError(brand, appliance, code) ?? getSymptom(brand, appliance, code),
    [brand, appliance, code],
  );
  const [scanNote, setScanNote] = useState("");
  const [state, setState] = useState<DiagnosisState | null>(null);
  const [outcome, setOutcome] = useState<OutcomeId | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);

  if (!profile) {
    return (
      <main className="fc-scene">
        <p className="fc-kicker">Insufficient data</p>
        <h1 className="fc-display mt-4">We don&apos;t have verified data yet.</h1>
        <p className="mt-6 max-w-md leading-7">
          {brand} {appliance} {code} is not in the launch set. We will not invent a repair procedure. This query is stored for demand scoring.
        </p>
      </main>
    );
  }

  const current: DiagnosisState = state ?? initialState(profile);
  const result: DiagnosisResult = diagnose(profile, current);
  const zone = zoneFromText(`${result.headline_cause?.name ?? ""} ${"code" in profile ? profile.code : profile.symptom} ${profile.meaning}`);
  const top = result.causes[0]?.probability ?? 0;

  return (
    <div>
      <SourceTrace open={traceOpen} onClose={() => setTraceOpen(false)} rows={profile.provenance} />
      {mode === "scan" ? (
        <section className="fc-scene">
          <p className="fc-kicker">Scan the panel</p>
          <h2 className="mt-3 text-3xl">Confirm what the machine shows</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--fc-mute)]">
            Photos of the screen, model sticker, or appliance are useful. Vision is not run without confirmation.
          </p>
          <input type="file" accept="image/*" capture="environment" className="mt-5 block text-sm" />
          <label className="fc-field mt-4 max-w-md">
            <span>What do you see?</span>
            <input className="fc-input" value={scanNote} onChange={(e) => setScanNote(e.target.value)} placeholder="Samsung WW… 4C" />
          </label>
        </section>
      ) : null}

      <section className="fc-hero">
        <div className="fc-hero-copy">
          <div>
            <p className="fc-kicker">
              {"code" in profile ? `${profile.brand} ${profile.appliance}` : profile.appliance} · {result.confidence_level.toLowerCase()} confidence · {result.rule_version}
              {result.display_probabilities ? "" : " · common possibilities, not calibrated %"}
            </p>
            {result.self_service_blocked || result.safety_ceiling === "STOP_USE" ? (
              <p className="mt-4 border border-[var(--fc-signal)] px-3 py-2 text-sm text-[var(--fc-signal)]">
                {result.stop_boundary ?? "Stop using the appliance. This is not a DIY path."} Book a technician.
              </p>
            ) : null}
            <h1 className="fc-code-giant mt-4">
              {"code" in profile ? profile.code : "SY"}
            </h1>
            <p className="mt-4 text-2xl leading-snug">
              {result.headline_cause ? result.headline_cause.name : "Insufficient data"}
            </p>
            <button type="button" className="fc-kicker mt-6" onClick={() => setTraceOpen(true)}>
              Open source trace
            </button>
          </div>
          {result.next_question && !result.self_service_blocked ? (
            <div>
              <p className="fc-kicker">Next safe check</p>
              <p className="mt-2 text-sm leading-6 text-[var(--fc-mute)]">{result.why_this_question}</p>
              <h2 className="mt-4 text-2xl">{result.next_question.text}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.next_question.answers.map((answer) => (
                  <button
                    key={answer.id}
                    className="fc-answer"
                    type="button"
                    onClick={() => setState(applyAnswer(profile, current, result.next_question!.id, answer.id))}
                  >
                    {answer.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl">What fixed it?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["cleaned_filter", "replaced_valve", "hose_issue", "technician_repair", "other"] as OutcomeId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`fc-answer ${outcome === id ? "bg-[var(--fc-ink)] text-[var(--fc-paper)]" : ""}`}
                    onClick={() => {
                      setOutcome(id);
                      reportOutcome({
                        profile_id: profile.id,
                        appliance: profile.appliance,
                        model: "models" in profile ? profile.models[0] : undefined,
                        error: "code" in profile ? profile.code : profile.symptom,
                        symptoms: "related_symptoms" in profile ? profile.related_symptoms : [profile.symptom],
                        chosen_fix: id,
                        successful: null,
                        outcome: id,
                      });
                    }}
                  >
                    {id.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="fc-stage">
          <div className="fc-scan ready" />
          <MachineVisual zone={zone} ready appliance={appliance} />
          <p className="absolute bottom-5 left-5 fixcode-mono text-[10px] uppercase tracking-[0.2em]">
            Diagnostic trace · top {Math.round(top * 100)}
          </p>
        </div>
      </section>

      <section className="fc-scene">
        <p className="fc-kicker">Hypothesis ranking</p>
        <ol className="mt-8">
          {result.causes.map((cause, index) => (
            <li key={cause.id} className={`fc-hypo ${index > 1 ? "is-dim" : ""}`}>
              <span className="fixcode-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{cause.name}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--fc-mute)]">{cause.summary}</p>
                {result.self_service_blocked || isBlocked(cause) ? (
                  <p className="mt-2 text-sm text-[var(--fc-signal)]">{cause.blocked_reason ?? "Stop. Call a professional."}</p>
                ) : (
                  <p className="mt-2 text-sm">{cause.fix}</p>
                )}
              </div>
              <div className="text-right">
                <p className="fixcode-mono text-sm">{cause.likelihood_label}</p>
                <p className={`mt-2 text-xs ${cause.safety === "PROFESSIONAL_ONLY" || cause.safety === "STOP_USE" ? "text-[var(--fc-signal)]" : cause.safety === "CAUTION" ? "text-[var(--fc-amber)]" : "text-[var(--fc-ok)]"}`}>
                  {cause.safety.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-xs text-[var(--fc-mute)]">
                  {cause.time_minutes} min · €{cause.cost_eur_min}–{cause.cost_eur_max || 0}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {result.display_probabilities ? (
          <p className="mt-6 fixcode-mono text-xs">
            Leading mass <AnimatedNumber value={Math.round(top * 100)} suffix="%" />
          </p>
        ) : null}
      </section>
      <div className="fc-scene">
        <Feedback site="fixcode" />
      </div>
    </div>
  );
}

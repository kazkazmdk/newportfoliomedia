"use client";

import { applyAnswer, diagnose, getError, getSymptom, initialState, isBlocked, reportOutcome, type DiagnosisResult, type DiagnosisState, type OutcomeId } from "@penta/fixcode";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Feedback } from "@/components/feedback";

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

  if (!profile) {
    return (
      <div className="border border-[#e2ddd4] bg-[#fffcf7] p-6">
        <h1 className="text-3xl">We don&apos;t have verified data yet.</h1>
        <p className="mt-3 max-w-md leading-7">
          {brand} {appliance} {code} is not in the launch set. We will not invent a repair procedure. This query is stored for demand scoring.
        </p>
      </div>
    );
  }

  const current: DiagnosisState = state ?? initialState(profile);
  const result: DiagnosisResult = diagnose(profile, current);

  return (
    <div>
      {mode === "scan" ? (
        <section className="mb-8 border border-dashed border-[#cfc9bb] bg-[#fffcf7] p-5">
          <h2 className="text-lg">Scan the error</h2>
          <p className="mt-2 text-sm leading-6 text-[#555]">
            Photos of the screen, model sticker, or appliance are useful. Vision is not run without confirmation — upload then correct the fields.
          </p>
          <input type="file" accept="image/*" capture="environment" className="mt-3 block text-sm" />
          <label className="mt-3 grid gap-1 text-sm">
            What do you see? (required confirmation)
            <input className="fixcode-input" value={scanNote} onChange={(e) => setScanNote(e.target.value)} placeholder="Samsung WW… 4C" />
          </label>
        </section>
      ) : null}

      <p className="text-sm text-[#6a6a64]">
        {"code" in profile ? `${profile.brand} ${profile.appliance}` : profile.appliance} · {result.confidence_level.toLowerCase()} confidence · {result.rule_version}
        {result.display_probabilities ? "" : " · common possibilities, not calibrated %"}
      </p>
      {result.self_service_blocked || result.safety_ceiling === "STOP_USE" ? (
        <p className="mt-3 border border-[var(--danger)] bg-[#fff6f4] p-3 text-sm text-[var(--danger)]">
          {result.stop_boundary ?? "Stop using the appliance. This is not a DIY path."} Book a technician.
        </p>
      ) : null}
      <h1 className="mt-3 text-4xl">
        {"code" in profile ? `Error ${profile.code}` : "symptom" in profile ? profile.symptom : "Diagnosis"}
      </h1>
      <p className="mt-3 max-w-xl text-lg leading-7">
        {result.headline_cause ? result.headline_cause.name : "Insufficient data"}
      </p>

      <ol className="mt-8 grid gap-3">
        {result.causes.map((cause, index) => (
          <li key={cause.id} className="border border-[#e2ddd4] bg-[#fffcf7] p-4">
            <div className="flex items-baseline justify-between gap-4">
              <p>
                {index + 1}. {cause.name}
              </p>
              <p className="text-sm">{cause.likelihood_label}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#555]">{cause.summary}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-[#6a6a64]">Difficulty</dt>
                <dd>{cause.difficulty}/5</dd>
              </div>
              <div>
                <dt className="text-[#6a6a64]">Time</dt>
                <dd>{cause.time_minutes} min</dd>
              </div>
              <div>
                <dt className="text-[#6a6a64]">Est. cost</dt>
                <dd>
                  {cause.cost_eur_max ? `€${cause.cost_eur_min}–${cause.cost_eur_max}` : "€0"}
                </dd>
              </div>
              <div>
                <dt className="text-[#6a6a64]">Risk</dt>
                <dd className={cause.safety === "PROFESSIONAL_ONLY" ? "text-[var(--danger)]" : cause.safety === "CAUTION" ? "text-[var(--warn)]" : "text-[var(--ok)]"}>
                  {cause.safety.replaceAll("_", " ")}
                </dd>
              </div>
            </dl>
            {result.self_service_blocked || isBlocked(cause) ? (
              <p className="mt-3 text-sm text-[var(--danger)]">{cause.blocked_reason ?? "Stop. Call a professional."}</p>
            ) : (
              <p className="mt-3 text-sm">{cause.fix}</p>
            )}
          </li>
        ))}
      </ol>

      {result.next_question && !result.self_service_blocked ? (
        <section className="mt-10 border-t border-[#e2ddd4] pt-8">
            <p className="text-sm text-[#6a6a64]">Next safe check · why</p>
          <p className="mt-1 text-sm leading-6">{result.why_this_question}</p>
          <h2 className="mt-4 text-2xl">{result.next_question.text}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.next_question.answers.map((answer) => (
              <button
                key={answer.id}
                className="border border-[#1c1c1a] bg-white px-4 py-2"
                type="button"
                onClick={() => setState(applyAnswer(profile, current, result.next_question!.id, answer.id))}
              >
                {answer.label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="text-xl">What fixed it?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["cleaned_filter", "replaced_valve", "hose_issue", "technician_repair", "other"] as OutcomeId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`border px-3 py-2 text-sm ${outcome === id ? "bg-[#1c1c1a] text-white" : "bg-white"}`}
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
        </section>
      )}

      <div className="mt-10">
        <Feedback site="fixcode" />
      </div>
    </div>
  );
}

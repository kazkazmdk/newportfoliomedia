import { NextResponse } from "next/server";
import { applyAnswer, diagnose, getError, getSymptom, initialState } from "@penta/fixcode";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/read-json";

export async function POST(request: Request) {
  const limited = rateLimit(`fixcode:${clientKey(request)}`, 40);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const parsed = await readJsonBody<{
    brand?: string;
    appliance?: string;
    error?: string;
    answers?: Array<{ question_id: string; answer_id: string }>;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const body = parsed.value;
  const profile =
    getError(body.brand ?? "", body.appliance ?? "", body.error ?? "") ??
    getSymptom(body.brand, body.appliance ?? "", body.error ?? "");
  if (!profile) {
    return NextResponse.json(
      { error: "unknown_entity", message: "We don't have verified data yet." },
      { status: 404 },
    );
  }
  let state = initialState(profile);
  for (const answer of body.answers ?? []) {
    state = applyAnswer(profile, state, answer.question_id, answer.answer_id);
  }
  const result = diagnose(profile, state);
  return NextResponse.json({
    causes: result.causes.map((c) => ({
      id: c.id,
      name: c.name,
      likelihood_label: c.likelihood_label,
      probability: result.display_probabilities ? c.probability : null,
      safety: c.safety,
    })),
    next_question: result.next_question
      ? { id: result.next_question.id, text: result.next_question.text, why: result.next_question.why }
      : null,
    risk: result.safety_ceiling,
    confidence: result.confidence_level,
    rule_version: result.rule_version,
    display_probabilities: result.display_probabilities,
    trace: result.trace,
  });
}

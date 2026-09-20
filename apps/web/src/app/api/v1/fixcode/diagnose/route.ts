import { applyAnswer, diagnose, getError, getSymptom, initialState } from "@penta/fixcode";
import { readJsonBody } from "@/lib/read-json";
import { fail, limited, logRequest, ok, recordEvent, requireEngine } from "@/lib/v1";

export async function POST(request: Request) {
  const started = Date.now();
  const blocked = limited(request, "v1-fixcode", 40);
  if (blocked) return blocked;
  const auth = await requireEngine(request, "fixcode");
  if (!auth.ok) return auth.response;
  const parsed = await readJsonBody<{
    brand?: string;
    appliance?: string;
    error?: string;
    answers?: Array<{ question_id: string; answer_id: string }>;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, auth.requestId);
  const body = parsed.value;
  const profile =
    getError(body.brand ?? "", body.appliance ?? "", body.error ?? "") ??
    getSymptom(body.brand, body.appliance ?? "", body.error ?? "");
  if (!profile) {
    await logRequest({ request, site: "fixcode", status: 404, started, keyId: auth.key.id, organizationId: auth.key.organizationId, errorCode: "unknown_entity" });
    return fail("unknown_entity", "We don't have verified data yet.", auth.requestId);
  }
  let state = initialState(profile);
  for (const answer of body.answers ?? []) state = applyAnswer(profile, state, answer.question_id, answer.answer_id);
  const result = diagnose(profile, state);
  await recordEvent({ name: "api_called", site: "fixcode", entityId: profile.id, path: "/api/v1/fixcode/diagnose", properties: { keyId: auth.key.id } });
  await logRequest({ request, site: "fixcode", status: 200, started, keyId: auth.key.id, organizationId: auth.key.organizationId, entityId: profile.id });
  return ok(request, {
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
    usage: { remaining: auth.remaining, limit: auth.limit, site: "fixcode", price: null },
  });
}

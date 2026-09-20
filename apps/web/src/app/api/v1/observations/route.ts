import { createObservation, isSiteId, OBSERVATION_KINDS, observationFingerprint, type ObservationKind } from "@penta/monetization";
import { readJsonBody } from "@/lib/read-json";
import { localDevActor } from "@/lib/dev-session";
import { newId, repo } from "@/lib/platform-store";
import { fail, limited, ok, recordEvent, requestIdOf } from "@/lib/v1";

export async function GET(request: Request) {
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Observation listing requires local session.", requestIdOf(request));
  return ok(request, { observations: await repo().listObservations() });
}

export async function POST(request: Request) {
  const blocked = limited(request, "v1-obs", 20);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    site?: string;
    kind?: string;
    entityId?: string;
    field?: string;
    value?: string;
    payload?: Record<string, unknown>;
  }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, requestIdOf(request));
  const { site, kind, entityId, field, value, payload } = parsed.value;
  if (!site || !isSiteId(site)) return fail("invalid_request", "unknown_site", requestIdOf(request));
  if (!kind || !(OBSERVATION_KINDS as readonly string[]).includes(kind)) {
    return fail("invalid_request", "unknown_observation_kind", requestIdOf(request));
  }
  if (!value?.trim() || value.length > 2000) return fail("invalid_request", "value_required", requestIdOf(request));
  const created = createObservation({
    id: newId("obs"),
    site,
    kind: kind as ObservationKind,
    entityId,
    field,
    value,
  });
  const existing = await repo().listObservations(site);
  const dup = existing.find((row) => observationFingerprint(row) === observationFingerprint(created));
  const observation = await repo().addObservation({
    ...created,
    state: "RECEIVED",
    payload,
    moderatorNote: dup ? `duplicate_of:${dup.id}` : undefined,
  });
  await recordEvent({
    name: kind === "feedback_correct" ? "feedback_positive" : kind === "feedback_incorrect" ? "feedback_negative" : "observation_submitted",
    site,
    entityId,
    properties: { observationId: observation.id, sourceType: observation.sourceType, state: observation.state },
  });
  return ok(request, {
    observation: { ...observation, promoted: false },
    message: "Stored as USER_REPORTED or USER_OBSERVED. MERGED_AS_SIGNAL is still not OFFICIAL.",
  });
}

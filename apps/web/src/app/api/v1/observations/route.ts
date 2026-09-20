import { NextResponse } from "next/server";
import { createObservation, isSiteId, OBSERVATION_KINDS, type ObservationKind } from "@penta/monetization";
import { readJsonBody } from "@/lib/read-json";
import { mutateStore, newId } from "@/lib/platform-store";
import { limited, recordEvent } from "@/lib/v1";

export async function POST(request: Request) {
  const blocked = limited(request, "v1-obs", 40);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    site?: string;
    kind?: string;
    entityId?: string;
    field?: string;
    value?: string;
  }>(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const { site, kind, entityId, field, value } = parsed.value;
  if (!site || !isSiteId(site)) return NextResponse.json({ error: "unknown_site" }, { status: 400 });
  if (!kind || !(OBSERVATION_KINDS as readonly string[]).includes(kind)) {
    return NextResponse.json({ error: "unknown_observation_kind" }, { status: 400 });
  }
  if (!value?.trim()) return NextResponse.json({ error: "value_required" }, { status: 400 });
  const observation = mutateStore((store) => {
    const row = createObservation({
      id: newId("obs"),
      site,
      kind: kind as ObservationKind,
      entityId,
      field,
      value,
    });
    store.observations.push(row);
    return row;
  });
  recordEvent({
    name: kind === "feedback_correct" ? "feedback_positive" : kind === "feedback_incorrect" ? "feedback_negative" : "observation_submitted",
    site,
    entityId,
    properties: { observationId: observation.id, sourceType: observation.sourceType },
  });
  return NextResponse.json({
    observation,
    promoted: false,
    message: "Stored as USER_REPORTED or USER_OBSERVED. It cannot become OFFICIAL, MANUFACTURER, or TESTED.",
  });
}

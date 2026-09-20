import { publicLeadView } from "@penta/platform-data";
import { localDevActor } from "@/lib/dev-session";
import { repo } from "@/lib/platform-store";
import { fail, ok, requestIdOf } from "@/lib/v1";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Lead export requires local session.", requestIdOf(request));
  const { id } = await params;
  const lead = await repo().getLead(id);
  if (!lead) return fail("unknown_entity", "Unknown lead.", requestIdOf(request));
  const exportFull = new URL(request.url).searchParams.get("export") === "1";
  return ok(request, {
    lead: exportFull ? lead : publicLeadView(lead),
    exported: exportFull,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await localDevActor(request);
  if (!actor) return fail("unauthorized", "Lead delete requires local session.", requestIdOf(request));
  const { id } = await params;
  const removed = await repo().deleteLead(id);
  if (!removed) return fail("unknown_entity", "Unknown lead.", requestIdOf(request));
  return ok(request, { deleted: true, id });
}

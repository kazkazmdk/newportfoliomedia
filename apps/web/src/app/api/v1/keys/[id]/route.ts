import { authorize, publicKeyView } from "@penta/platform-api";
import { readJsonBody } from "@/lib/read-json";
import { localDevActor } from "@/lib/dev-session";
import { repo } from "@/lib/platform-store";
import { fail, limited, ok, requestIdOf } from "@/lib/v1";

async function canManage(request: Request) {
  const store = repo();
  await store.bootstrapLocalDev();
  const keys = await store.listKeys();
  const bearer = authorize(keys, request, "keys:manage");
  if (bearer.ok) return { ok: true as const };
  const actor = await localDevActor(request);
  return actor ? { ok: true as const } : { ok: false as const };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = limited(request, "v1-keys-patch", 20);
  if (blocked) return blocked;
  if (!(await canManage(request)).ok) return fail("unauthorized", "Cannot manage keys.", requestIdOf(request));
  const { id } = await params;
  const parsed = await readJsonBody<{ label?: string; rotate?: boolean; revoke?: boolean }>(request);
  if (!parsed.ok) return fail("invalid_request", parsed.error, requestIdOf(request));
  if (parsed.value.rotate) {
    const rotated = await repo().rotateKey(id);
    if (!rotated) return fail("unknown_entity", "Unknown key.", requestIdOf(request));
    return ok(request, { key: publicKeyView(rotated.record), token: rotated.token, shownOnce: true });
  }
  if (parsed.value.revoke) {
    const revoked = await repo().revokeKey(id);
    if (!revoked) return fail("unknown_entity", "Unknown key.", requestIdOf(request));
    return ok(request, { key: publicKeyView(revoked) });
  }
  if (parsed.value.label) {
    const renamed = await repo().renameKey(id, parsed.value.label);
    if (!renamed) return fail("unknown_entity", "Unknown key.", requestIdOf(request));
    return ok(request, { key: publicKeyView(renamed) });
  }
  return fail("invalid_request", "Nothing to update.", requestIdOf(request));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canManage(request)).ok) return fail("unauthorized", "Cannot delete keys.", requestIdOf(request));
  const { id } = await params;
  const removed = await repo().deleteKey(id);
  if (!removed) return fail("unsupported_operation", "Revoke the key before deleting it.", requestIdOf(request));
  return ok(request, { deleted: true, id });
}

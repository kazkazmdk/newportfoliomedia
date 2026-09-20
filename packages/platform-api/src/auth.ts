import type { ApiKeyRecord, KeyScope } from "./keys";
import { matchKey } from "./keys";

export type AuthResult =
  | { ok: true; key: ApiKeyRecord }
  | { ok: false; status: 401 | 403; error: string };

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(\S+)/i);
  return match?.[1] ?? null;
}

export function authorize(
  records: ApiKeyRecord[],
  request: Request,
  scope?: KeyScope,
): AuthResult {
  const token = bearerToken(request);
  if (!token) return { ok: false, status: 401, error: "missing_bearer" };
  if (!token.startsWith("penta_local_")) return { ok: false, status: 401, error: "unknown_key_format" };
  const key = matchKey(records, token);
  if (!key) return { ok: false, status: 401, error: "invalid_or_revoked_key" };
  if (scope && !key.scopes.includes(scope)) return { ok: false, status: 403, error: "scope_denied" };
  return { ok: true, key };
}

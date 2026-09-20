import type { SiteId } from "@penta/monetization";
import type { ApiKeyRecord, KeyScope } from "./keys";
import { matchKey } from "./keys";
import { hasScope } from "./scopes";
import type { ApiEnvironment, PlatformUser, Role } from "./tenancy";

export type AuthFailure = {
  ok: false;
  status: 401 | 403;
  error: "unauthorized" | "forbidden" | "wrong_product_key";
  message: string;
};

export type AuthResult =
  | { ok: true; key: ApiKeyRecord }
  | AuthFailure;

export type ProductKeyResult =
  | { ok: true; key: ApiKeyRecord }
  | AuthFailure;

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
  if (!token) return { ok: false, status: 401, error: "unauthorized", message: "missing_bearer" };
  if (!/^penta_(local|prod)_/.test(token)) {
    return { ok: false, status: 401, error: "unauthorized", message: "unknown_key_format" };
  }
  const key = matchKey(records, token);
  if (!key) return { ok: false, status: 401, error: "unauthorized", message: "invalid_or_revoked_key" };
  if (scope && !hasScope(key.scopes, scope)) {
    return { ok: false, status: 403, error: "forbidden", message: "scope_denied" };
  }
  return { ok: true, key };
}

export function requireProductKey(
  records: ApiKeyRecord[],
  request: Request,
  site: SiteId,
  scope: KeyScope,
  opts?: { environment?: ApiEnvironment; organizationId?: string },
): ProductKeyResult {
  const auth = authorize(records, request, scope);
  if (!auth.ok) return auth;
  if (auth.key.site !== site) {
    return {
      ok: false,
      status: 403,
      error: "wrong_product_key",
      message: `key_site_${auth.key.site}_cannot_call_${site}`,
    };
  }
  if (opts?.environment && auth.key.environment !== opts.environment) {
    return { ok: false, status: 403, error: "forbidden", message: "environment_mismatch" };
  }
  if (opts?.organizationId && auth.key.organizationId !== opts.organizationId) {
    return { ok: false, status: 403, error: "forbidden", message: "tenant_mismatch" };
  }
  return auth;
}

export function requireRole(have: Role, needed: Role): AuthFailure | { ok: true } {
  const rank = { VIEWER: 1, ANALYST: 2, DEVELOPER: 3, ADMIN: 4, OWNER: 5 };
  if (rank[have] < rank[needed]) {
    return { ok: false, status: 403, error: "forbidden", message: `role_${have}_insufficient` };
  }
  return { ok: true };
}

export function requireUser(user: PlatformUser | null): AuthFailure | { ok: true; user: PlatformUser } {
  if (!user) return { ok: false, status: 401, error: "unauthorized", message: "missing_session" };
  return { ok: true, user };
}

export function requireOrganization(org: { id: string } | null | undefined): AuthFailure | { ok: true } {
  if (!org?.id) return { ok: false, status: 403, error: "forbidden", message: "unknown_organization" };
  return { ok: true };
}

export function requireProductAccess(key: ApiKeyRecord, site: SiteId): ProductKeyResult {
  if (key.site !== site) {
    return {
      ok: false,
      status: 403,
      error: "wrong_product_key",
      message: `key_site_${key.site}_cannot_call_${site}`,
    };
  }
  return { ok: true, key };
}

import { createHash, randomBytes } from "node:crypto";
import { isSiteId, SITES, type SiteId } from "@penta/monetization";
import { DEFAULT_DEVELOPER_SCOPES, normalizeScopes, type KeyScope } from "./scopes";
import type { ApiEnvironment } from "./tenancy";

export { KEY_SCOPES, DEFAULT_DEVELOPER_SCOPES, normalizeScope, normalizeScopes, hasScope, type KeyScope } from "./scopes";

export type ApiKeyRecord = {
  id: string;
  organizationId: string;
  site: SiteId;
  environment: ApiEnvironment;
  label: string;
  prefix: string;
  hash: string;
  scopes: KeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type IssuedKey = {
  record: ApiKeyRecord;
  token: string;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function issueLocalKey(input: {
  site: SiteId;
  label: string;
  organizationId?: string;
  environment?: ApiEnvironment;
  scopes?: KeyScope[];
  now?: string;
}): IssuedKey {
  if (!isSiteId(input.site)) throw new Error("Unknown site.");
  const environment = input.environment ?? "development";
  const envTag = environment === "production" ? "prod" : "local";
  const raw = randomBytes(18).toString("base64url");
  const token = `penta_${envTag}_${input.site}_${raw}`;
  const createdAt = input.now ?? new Date().toISOString();
  const record: ApiKeyRecord = {
    id: `key_${raw.slice(0, 10)}`,
    organizationId: input.organizationId ?? "org_local_dev",
    site: input.site,
    environment,
    label: input.label.trim() || `${input.site} ${environment} key`,
    prefix: token.slice(0, 24),
    hash: hashToken(token),
    scopes: normalizeScopes(input.scopes ?? DEFAULT_DEVELOPER_SCOPES),
    createdAt,
    lastUsedAt: null,
    revokedAt: null,
  };
  return { record, token };
}

export function matchKey(records: ApiKeyRecord[], token: string): ApiKeyRecord | undefined {
  const hash = hashToken(token);
  return records.find((row) => row.hash === hash && row.revokedAt === null);
}

export function revokeKey(record: ApiKeyRecord, at = new Date().toISOString()): ApiKeyRecord {
  return { ...record, revokedAt: at };
}

export function rotateKey(record: ApiKeyRecord, now = new Date().toISOString()): IssuedKey {
  const next = issueLocalKey({
    site: record.site,
    label: record.label,
    organizationId: record.organizationId,
    environment: record.environment,
    scopes: record.scopes,
    now,
  });
  next.record.id = record.id;
  return next;
}

export function publicKeyView(record: ApiKeyRecord) {
  return {
    id: record.id,
    organizationId: record.organizationId,
    site: record.site,
    environment: record.environment,
    label: record.label,
    prefix: record.prefix,
    scopes: record.scopes,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
    revokedAt: record.revokedAt,
    billing: null as null,
    rateCard: null as null,
  };
}

export function allProductSites(): SiteId[] {
  return [...SITES];
}

export { KEY_SCOPES as ALL_KEY_SCOPES };

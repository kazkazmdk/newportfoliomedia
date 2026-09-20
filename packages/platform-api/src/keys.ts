import { createHash, randomBytes } from "node:crypto";
import { isSiteId, SITES, type SiteId } from "@penta/monetization";

export const KEY_SCOPES = [
  "read:engine",
  "write:events",
  "write:leads",
  "write:observations",
  "manage:keys",
] as const;

export type KeyScope = (typeof KEY_SCOPES)[number];

export type ApiKeyRecord = {
  id: string;
  site: SiteId;
  label: string;
  prefix: string;
  hash: string;
  scopes: KeyScope[];
  createdAt: string;
  revokedAt: string | null;
};

export type IssuedKey = {
  record: ApiKeyRecord;
  token: string;
};

const DEFAULT_SCOPES: KeyScope[] = [
  "read:engine",
  "write:events",
  "write:leads",
  "write:observations",
  "manage:keys",
];

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function issueLocalKey(input: {
  site: SiteId;
  label: string;
  scopes?: KeyScope[];
  now?: string;
}): IssuedKey {
  if (!isSiteId(input.site)) throw new Error("Unknown site.");
  const raw = randomBytes(18).toString("base64url");
  const token = `penta_local_${input.site}_${raw}`;
  const createdAt = input.now ?? new Date().toISOString();
  const record: ApiKeyRecord = {
    id: `key_${raw.slice(0, 10)}`,
    site: input.site,
    label: input.label.trim() || `${input.site} local key`,
    prefix: token.slice(0, 22),
    hash: hashToken(token),
    scopes: input.scopes ?? DEFAULT_SCOPES,
    createdAt,
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

export function publicKeyView(record: ApiKeyRecord) {
  return {
    id: record.id,
    site: record.site,
    label: record.label,
    prefix: record.prefix,
    scopes: record.scopes,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt,
    billing: null as null,
    rateCard: null as null,
  };
}

export function allProductSites(): SiteId[] {
  return [...SITES];
}

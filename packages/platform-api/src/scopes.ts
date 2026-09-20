export const KEY_SCOPES = [
  "engine:read",
  "events:write",
  "leads:write",
  "observations:write",
  "widgets:manage",
  "usage:read",
  "keys:manage",
  "data:export",
] as const;

export type KeyScope = (typeof KEY_SCOPES)[number];

const LEGACY: Record<string, KeyScope> = {
  "read:engine": "engine:read",
  "write:events": "events:write",
  "write:leads": "leads:write",
  "write:observations": "observations:write",
  "manage:keys": "keys:manage",
};

export const DEFAULT_DEVELOPER_SCOPES: KeyScope[] = ["engine:read", "usage:read"];

export function normalizeScope(scope: string): KeyScope | null {
  if ((KEY_SCOPES as readonly string[]).includes(scope)) return scope as KeyScope;
  return LEGACY[scope] ?? null;
}

export function normalizeScopes(scopes: string[]): KeyScope[] {
  return [...new Set(scopes.map(normalizeScope).filter((scope): scope is KeyScope => Boolean(scope)))];
}

export function hasScope(granted: string[], needed: KeyScope): boolean {
  return normalizeScopes(granted).includes(needed);
}

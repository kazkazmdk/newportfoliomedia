import type { SiteId } from "@penta/monetization";
import { normalizeScopes, type ApiKeyRecord } from "@penta/platform-api";
import type { MemoryRepository } from "./memory";
import type { StoredLead, StoredObservation } from "./repository";

export function importLegacyStore(repo: MemoryRepository, raw: Record<string, unknown>): { keys: number; leads: number; observations: number } {
  const keys = Array.isArray(raw.keys) ? (raw.keys as ApiKeyRecord[]) : [];
  for (const key of keys) {
    if (repo.keys.some((row) => row.id === key.id || row.hash === key.hash)) continue;
    repo.keys.push({
      ...key,
      organizationId: key.organizationId ?? "org_local_dev",
      environment: key.environment ?? "development",
      scopes: normalizeScopes(key.scopes ?? []),
      lastUsedAt: key.lastUsedAt ?? null,
    });
  }
  const leads = Array.isArray(raw.leads) ? raw.leads : [];
  for (const item of leads as Array<Record<string, unknown>>) {
    if (repo.leads.some((row) => row.id === item.id)) continue;
    const lead: StoredLead = {
      id: String(item.id),
      site: item.site as SiteId,
      kind: String(item.kind ?? "sales_inquiry"),
      state: String(item.state ?? "UNASSIGNED"),
      entityId: item.entityId ? String(item.entityId) : undefined,
      message: String(item.message ?? ""),
      contact: String(item.contact ?? ""),
      assignedPartnerId: (item.assignedPartnerId as string | null) ?? null,
      consentVersion: String(item.consentVersion ?? "unknown"),
      consentTimestamp: String(item.consentTimestamp ?? item.createdAt ?? new Date().toISOString()),
      privacyNoticeVersion: String(item.privacyNoticeVersion ?? "unknown"),
      retentionUntil: String(item.retentionUntil ?? new Date(Date.now() + 180 * 86400000).toISOString()),
      deletedAt: (item.deletedAt as string | null) ?? null,
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    };
    repo.leads.push(lead);
  }
  const observations = Array.isArray(raw.observations) ? raw.observations : [];
  for (const item of observations as Array<Record<string, unknown>>) {
    if (repo.observations.some((row) => row.id === item.id)) continue;
    const row: StoredObservation = {
      id: String(item.id),
      site: item.site as SiteId,
      kind: String(item.kind ?? "feedback_correct"),
      entityId: item.entityId ? String(item.entityId) : undefined,
      field: item.field ? String(item.field) : undefined,
      value: String(item.value ?? ""),
      sourceType: String(item.sourceType ?? "USER_REPORTED"),
      state: "RECEIVED",
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    };
    repo.observations.push(row);
  }
  return { keys: keys.length, leads: leads.length, observations: observations.length };
}

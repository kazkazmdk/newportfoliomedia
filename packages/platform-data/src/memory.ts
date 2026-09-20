import { createHash, randomBytes } from "node:crypto";
import type { SiteId } from "@penta/monetization";
import {
  defaultDevEntitlement,
  defaultWidgetEntitlement,
  issueLocalKey,
  periodStart,
  revokeKey,
  rotateKey,
  type ApiEnvironment,
  type ApiKeyRecord,
  type Entitlement,
  type IssuedKey,
  type KeyScope,
  type Membership,
  type Organization,
  type PlatformUser,
  type RequestLog,
  type UsageCounter,
} from "@penta/platform-api";
import type { OfferRow, PartnerRow, PlatformRepository, StoredLead, StoredObservation, WidgetInstallation } from "./repository";

export class MemoryRepository implements PlatformRepository {
  kind = "memory" as const;
  orgs = new Map<string, Organization>();
  users = new Map<string, PlatformUser>();
  memberships: Membership[] = [];
  keys: ApiKeyRecord[] = [];
  entitlements: Entitlement[] = [];
  counters: UsageCounter[] = [];
  leads: StoredLead[] = [];
  observations: StoredObservation[] = [];
  events: Array<{ id: string; site: string; name: string; at: string; entityId?: string; path?: string; properties?: Record<string, unknown> }> = [];
  logs: RequestLog[] = [];
  widgets: WidgetInstallation[] = [];
  widgetUsage = new Map<string, number>();
  partners: PartnerRow[] = [];
  offers: OfferRow[] = [];
  audits: Array<{ action: string; actor?: string; subject?: string; at: string }> = [];

  async bootstrapLocalDev() {
    const org: Organization = { id: "org_local_dev", name: "Local development", slug: "local-dev", createdAt: "2026-01-01T00:00:00.000Z" };
    const user: PlatformUser = {
      id: "user_local_dev",
      email: "dev@localhost",
      displayName: "Local developer",
      kind: "local_dev",
      createdAt: org.createdAt,
    };
    const membership: Membership = {
      id: "mem_local_dev",
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
      createdAt: org.createdAt,
    };
    this.orgs.set(org.id, org);
    this.users.set(user.id, user);
    if (!this.memberships.some((row) => row.id === membership.id)) this.memberships.push(membership);
    if (!this.entitlements.some((row) => row.organizationId === org.id && row.feature === "api_calls")) {
      this.entitlements.push(defaultDevEntitlement(org.id, "*"));
    }
    if (!this.entitlements.some((row) => row.organizationId === org.id && row.feature === "widget_checks")) {
      this.entitlements.push(defaultWidgetEntitlement(org.id, "*"));
    }
    return { org, user, membership };
  }

  async getOrganization(id: string) {
    return this.orgs.get(id);
  }
  async getUser(id: string) {
    return this.users.get(id);
  }
  async membership(orgId: string, userId: string) {
    return this.memberships.find((row) => row.organizationId === orgId && row.userId === userId);
  }
  async listKeys(orgId?: string) {
    return this.keys.filter((row) => !orgId || row.organizationId === orgId);
  }
  async createKey(input: {
    organizationId: string;
    site: SiteId;
    environment: ApiEnvironment;
    label: string;
    scopes?: KeyScope[];
  }): Promise<IssuedKey> {
    const issued = issueLocalKey(input);
    this.keys.push(issued.record);
    return issued;
  }
  async renameKey(id: string, label: string) {
    const row = this.keys.find((key) => key.id === id);
    if (!row) return undefined;
    row.label = label;
    return row;
  }
  async rotateKey(id: string) {
    const idx = this.keys.findIndex((key) => key.id === id);
    if (idx < 0) return undefined;
    const next = rotateKey(this.keys[idx]);
    this.keys[idx] = next.record;
    return next;
  }
  async revokeKey(id: string) {
    const idx = this.keys.findIndex((key) => key.id === id);
    if (idx < 0) return undefined;
    this.keys[idx] = revokeKey(this.keys[idx]);
    return this.keys[idx];
  }
  async deleteKey(id: string) {
    const row = this.keys.find((key) => key.id === id);
    if (!row) return false;
    if (!row.revokedAt) return false;
    this.keys = this.keys.filter((key) => key.id !== id);
    return true;
  }
  async touchKey(id: string) {
    const row = this.keys.find((key) => key.id === id);
    if (row) row.lastUsedAt = new Date().toISOString();
  }
  async entitlement(orgId: string, site: SiteId, feature: string) {
    return this.entitlements.find(
      (row) => row.organizationId === orgId && row.feature === feature && (row.site === "*" || row.site === site),
    );
  }
  async usage(orgId: string, site: SiteId, feature: string, start: string): Promise<UsageCounter> {
    return (
      this.counters.find((row) => row.organizationId === orgId && row.site === site && row.feature === feature && row.periodStart === start) ?? {
        organizationId: orgId,
        site,
        feature: feature as UsageCounter["feature"],
        periodStart: start,
        used: 0,
      }
    );
  }
  async incrementUsage(orgId: string, site: SiteId, feature: string, start: string, n = 1) {
    let row = this.counters.find((item) => item.organizationId === orgId && item.site === site && item.feature === feature && item.periodStart === start);
    if (!row) {
      row = { organizationId: orgId, site, feature: feature as UsageCounter["feature"], periodStart: start, used: 0 };
      this.counters.push(row);
    }
    row.used += n;
    return row;
  }
  async addLead(lead: StoredLead) {
    this.leads.push(lead);
    return lead;
  }
  async getLead(id: string) {
    return this.leads.find((row) => row.id === id && !row.deletedAt);
  }
  async listLeads(site?: SiteId) {
    return this.leads.filter((row) => !row.deletedAt && (!site || row.site === site));
  }
  async anonymizeLead(id: string) {
    const row = this.leads.find((lead) => lead.id === id);
    if (!row) return undefined;
    row.contact = "anonymized";
    row.message = "anonymized";
    row.ipHash = undefined;
    row.userAgentHash = undefined;
    row.deletedAt = new Date().toISOString();
    return row;
  }
  async deleteLead(id: string) {
    const row = await this.anonymizeLead(id);
    return Boolean(row);
  }
  async addObservation(row: StoredObservation) {
    this.observations.push(row);
    return row;
  }
  async listObservations(site?: SiteId) {
    return this.observations.filter((row) => !site || row.site === site);
  }
  async moderateObservation(id: string, state: StoredObservation["state"], note?: string) {
    const row = this.observations.find((item) => item.id === id);
    if (!row) return undefined;
    row.state = state;
    row.moderatorNote = note;
    return row;
  }
  async addEvent(row: { id: string; site: SiteId | "platform"; name: string; path?: string; entityId?: string; properties?: Record<string, unknown>; at: string }) {
    this.events.push(row);
  }
  async listEvents(site?: SiteId) {
    return this.events.filter((row) => !site || row.site === site);
  }
  async addRequestLog(row: RequestLog) {
    this.logs.unshift(row);
    this.logs = this.logs.slice(0, 500);
  }
  async listRequestLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }
  async createWidget(row: WidgetInstallation) {
    this.widgets.push(row);
    return row;
  }
  async getWidget(id: string) {
    return this.widgets.find((row) => row.id === id);
  }
  async listWidgets(orgId?: string) {
    return this.widgets.filter((row) => !orgId || row.organizationId === orgId);
  }
  async revokeWidget(id: string) {
    const row = this.widgets.find((item) => item.id === id);
    if (!row) return undefined;
    row.revokedAt = new Date().toISOString();
    return row;
  }
  async incrementWidgetUsage(id: string, day: string) {
    const key = `${id}:${day}`;
    const next = (this.widgetUsage.get(key) ?? 0) + 1;
    this.widgetUsage.set(key, next);
    return next;
  }
  async listPartners() {
    return this.partners;
  }
  async listOffers() {
    return this.offers;
  }
  async addAudit(action: string, actor?: string, subject?: string) {
    this.audits.push({ action, actor, subject, at: new Date().toISOString() });
  }
}

export function newWidgetId(): string {
  return `wgt_${randomBytes(8).toString("hex")}`;
}

export function widgetPublicKey(): string {
  return `penta_wgt_${randomBytes(12).toString("base64url")}`;
}

export function hashOptional(value?: string | null): string | undefined {
  if (!value) return undefined;
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export { periodStart };

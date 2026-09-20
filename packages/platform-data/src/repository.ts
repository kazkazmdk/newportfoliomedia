import type { SiteId } from "@penta/monetization";
import type {
  ApiEnvironment,
  ApiKeyRecord,
  Entitlement,
  IssuedKey,
  KeyScope,
  Membership,
  Organization,
  PlatformUser,
  RequestLog,
  Role,
  UsageCounter,
} from "@penta/platform-api";

export type StoredLead = {
  id: string;
  organizationId?: string;
  site: SiteId;
  kind: string;
  state: string;
  entityId?: string;
  message: string;
  contact: string;
  assignedPartnerId: string | null;
  consentVersion: string;
  consentTimestamp: string;
  sourcePage?: string;
  privacyNoticeVersion: string;
  ipHash?: string;
  userAgentHash?: string;
  retentionUntil: string;
  deletedAt: string | null;
  createdAt: string;
};

export type StoredObservation = {
  id: string;
  site: SiteId;
  kind: string;
  entityId?: string;
  field?: string;
  value: string;
  sourceType: string;
  state: "RECEIVED" | "VALIDATING" | "ACCEPTED_USER_EVIDENCE" | "REJECTED" | "MERGED_AS_SIGNAL";
  payload?: Record<string, unknown>;
  moderatorNote?: string;
  createdAt: string;
};

export type WidgetInstallation = {
  id: string;
  organizationId: string;
  site: SiteId;
  environment: ApiEnvironment;
  name: string;
  publicKey: string;
  allowedOrigins: string[];
  theme?: string;
  brandingMode: "BRANDED" | "UNBRANDED";
  features: Record<string, unknown>;
  createdAt: string;
  revokedAt: string | null;
};

export type PartnerRow = {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "fixture";
  capabilities: string[];
  regions: string[];
};

export type OfferRow = {
  id: string;
  merchantId: string;
  productId: string;
  country: string;
  currency: string;
  price: number | null;
  availability: string;
  sourceUrl: string;
  affiliateUrl: string | null;
  checkedAt: string;
  expiresAt: string | null;
};

export interface PlatformRepository {
  kind: "memory" | "file" | "postgres";
  bootstrapLocalDev(): Promise<{ org: Organization; user: PlatformUser; membership: Membership }>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getUser(id: string): Promise<PlatformUser | undefined>;
  membership(orgId: string, userId: string): Promise<Membership | undefined>;
  listKeys(orgId?: string): Promise<ApiKeyRecord[]>;
  createKey(input: {
    organizationId: string;
    site: SiteId;
    environment: ApiEnvironment;
    label: string;
    scopes?: KeyScope[];
  }): Promise<IssuedKey>;
  renameKey(id: string, label: string): Promise<ApiKeyRecord | undefined>;
  rotateKey(id: string): Promise<IssuedKey | undefined>;
  revokeKey(id: string): Promise<ApiKeyRecord | undefined>;
  deleteKey(id: string): Promise<boolean>;
  touchKey(id: string): Promise<void>;
  entitlement(orgId: string, site: SiteId, feature: string): Promise<Entitlement | undefined>;
  usage(orgId: string, site: SiteId, feature: string, periodStart: string): Promise<UsageCounter>;
  incrementUsage(orgId: string, site: SiteId, feature: string, periodStart: string, n?: number): Promise<UsageCounter>;
  addLead(lead: StoredLead): Promise<StoredLead>;
  getLead(id: string): Promise<StoredLead | undefined>;
  listLeads(site?: SiteId): Promise<StoredLead[]>;
  anonymizeLead(id: string): Promise<StoredLead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  addObservation(row: StoredObservation): Promise<StoredObservation>;
  listObservations(site?: SiteId): Promise<StoredObservation[]>;
  moderateObservation(id: string, state: StoredObservation["state"], note?: string): Promise<StoredObservation | undefined>;
  addEvent(row: { id: string; site: SiteId | "platform"; name: string; path?: string; entityId?: string; properties?: Record<string, unknown>; at: string }): Promise<void>;
  listEvents(site?: SiteId): Promise<Array<{ id: string; site: string; name: string; at: string; entityId?: string }>>;
  addRequestLog(row: RequestLog): Promise<void>;
  listRequestLogs(limit?: number): Promise<RequestLog[]>;
  createWidget(row: WidgetInstallation): Promise<WidgetInstallation>;
  getWidget(id: string): Promise<WidgetInstallation | undefined>;
  listWidgets(orgId?: string): Promise<WidgetInstallation[]>;
  revokeWidget(id: string): Promise<WidgetInstallation | undefined>;
  incrementWidgetUsage(id: string, day: string): Promise<number>;
  listPartners(): Promise<PartnerRow[]>;
  listOffers(): Promise<OfferRow[]>;
  addAudit(action: string, actor?: string, subject?: string): Promise<void>;
}

export function requireOrgRole(membership: Membership | undefined, needed: Role): membership is Membership {
  if (!membership) return false;
  const rank: Record<Role, number> = { VIEWER: 1, ANALYST: 2, DEVELOPER: 3, ADMIN: 4, OWNER: 5 };
  return rank[membership.role] >= rank[needed];
}

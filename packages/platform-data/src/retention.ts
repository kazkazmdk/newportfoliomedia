import type { PlatformRepository } from "./repository";

/** Abstract retention sweep. Call from a cron or local script — never silently from a product engine. */
export async function anonymizeExpiredLeads(repo: PlatformRepository, now = new Date()): Promise<number> {
  const leads = await repo.listLeads();
  let count = 0;
  for (const lead of leads) {
    if (new Date(lead.retentionUntil).getTime() <= now.getTime()) {
      await repo.anonymizeLead(lead.id);
      count += 1;
    }
  }
  return count;
}

export function publicLeadView(lead: {
  id: string;
  site: string;
  kind: string;
  state: string;
  assignedPartnerId: string | null;
  createdAt: string;
  retentionUntil: string;
  deletedAt: string | null;
}) {
  return {
    id: lead.id,
    site: lead.site,
    kind: lead.kind,
    state: lead.state,
    assignedPartnerId: lead.assignedPartnerId,
    createdAt: lead.createdAt,
    retentionUntil: lead.retentionUntil,
    deleted: Boolean(lead.deletedAt),
  };
}

export type BillingCustomer = { id: string; organizationId: string };
export type BillingSubscription = { id: string; customerId: string; planId: string; status: "none" | "active" | "canceled" };

export interface BillingProvider {
  createCustomer(organizationId: string): Promise<BillingCustomer>;
  createSubscription(customerId: string, planId: string): Promise<BillingSubscription>;
  reportUsage(subscriptionId: string, quantity: number): Promise<void>;
  cancelSubscription(subscriptionId: string): Promise<BillingSubscription>;
  portalUrl(customerId: string): Promise<string | null>;
}

export class NoopBillingProvider implements BillingProvider {
  async createCustomer(organizationId: string): Promise<BillingCustomer> {
    return { id: `cus_noop_${organizationId}`, organizationId };
  }
  async createSubscription(customerId: string, planId: string): Promise<BillingSubscription> {
    return { id: `sub_noop_${customerId}`, customerId, planId, status: "none" };
  }
  async reportUsage(): Promise<void> {}
  async cancelSubscription(subscriptionId: string): Promise<BillingSubscription> {
    return { id: subscriptionId, customerId: "noop", planId: "FREE", status: "canceled" };
  }
  async portalUrl(): Promise<string | null> {
    return null;
  }
}

/** Metric catalog only. No invented values. */
export const BUSINESS_METRICS = {
  traffic: ["impressions", "clicks", "sessions", "pages_per_session"],
  product: ["tool_start", "tool_completion", "repeat_use"],
  commerce: ["offer_views", "outbound_ctr", "affiliate_ctr", "conversion", "revenue"],
  lead: ["lead_rate", "qualified_rate", "accepted_rate", "converted_rate", "lead_value"],
  b2b: ["developer_signup", "key_created", "active_key", "api_calls", "widget_installs", "widget_mau", "sales_leads"],
  data: ["observations", "validated_observations", "coverage_improvement"],
  finance: ["revenue_by_site", "revenue_by_channel", "revenue_per_session", "revenue_per_1k_seo", "mrr", "arr"],
} as const;

export type MetricFamily = keyof typeof BUSINESS_METRICS;

export function emptyMetricSheet(family: MetricFamily) {
  return Object.fromEntries(BUSINESS_METRICS[family].map((name) => [name, null]));
}

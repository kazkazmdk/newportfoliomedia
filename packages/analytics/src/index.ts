export const SHARED_EVENTS = [
  "page_view",
  "search",
  "tool_started",
  "tool_completed",
  "ai_query",
  "affiliate_click",
  "feedback_positive",
  "feedback_negative",
] as const;

export const FIXCODE_EVENTS = [
  "scan_started",
  "scan_identified",
  "diagnosis_started",
  "diagnosis_answer",
  "diagnosis_completed",
  "fix_reported",
] as const;

export const AUTOSPEC_EVENTS = [
  "vehicle_added",
  "vin_scanned",
  "maintenance_opened",
  "invoice_scanned",
  "part_checked",
  "assistant_question",
] as const;

export const WEARTHERE_EVENTS = [
  "trip_created",
  "wardrobe_scan",
  "outfit_generated",
  "packing_optimized",
  "item_removed",
  "shopping_recommendation",
] as const;

export const CHARGEMATCH_EVENTS = [
  "compatibility_checked",
  "device_added",
  "charger_added",
  "cable_added",
  "power_kit_created",
  "optimization_run",
  "bottleneck_detected",
] as const;

export const TRIPCOST_EVENTS = [
  "route_compared",
  "travellers_changed",
  "vehicle_added",
  "mode_selected",
  "true_cost_enabled",
  "booking_click",
] as const;

export type AnalyticsEvent = {
  name: string;
  site: string;
  properties: Record<string, unknown>;
  at: string;
};

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

export class MemoryAnalytics implements AnalyticsProvider {
  events: AnalyticsEvent[] = [];
  track(event: AnalyticsEvent): void {
    this.events.push(event);
  }
}

export class ConsoleAnalytics implements AnalyticsProvider {
  track(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event.name, event.site, event.properties);
    }
  }
}

export class PostHogReadyAnalytics implements AnalyticsProvider {
  constructor(
    private readonly key = process.env.NEXT_PUBLIC_POSTHOG_KEY,
    private readonly host = process.env.NEXT_PUBLIC_POSTHOG_HOST,
    private readonly fallback: AnalyticsProvider = new MemoryAnalytics(),
  ) {}

  track(event: AnalyticsEvent): void {
    if (!this.key || !this.host) {
      this.fallback.track(event);
      return;
    }
    this.fallback.track(event);
  }
}

let provider: AnalyticsProvider = new PostHogReadyAnalytics();

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

export function track(
  name: string,
  site: string,
  properties: Record<string, unknown> = {},
): void {
  provider.track({
    name,
    site,
    properties,
    at: new Date().toISOString(),
  });
}

export function getMemoryEvents(): AnalyticsEvent[] {
  if (provider instanceof PostHogReadyAnalytics) return [];
  if (provider instanceof MemoryAnalytics) return provider.events;
  return [];
}

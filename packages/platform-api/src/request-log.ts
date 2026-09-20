import type { SiteId } from "@penta/monetization";
import type { ApiEnvironment } from "./tenancy";

export type RequestLog = {
  requestId: string;
  timestamp: string;
  organizationId?: string;
  keyId?: string;
  site: SiteId | "platform";
  route: string;
  status: number;
  latencyMs: number;
  errorCode?: string;
  entityId?: string;
  environment?: ApiEnvironment;
};

export function requestLogFrom(input: Omit<RequestLog, "timestamp"> & { timestamp?: string }): RequestLog {
  return { ...input, timestamp: input.timestamp ?? new Date().toISOString() };
}

export type CapabilityStatus =
  | "UNSUPPORTED"
  | "UNAVAILABLE"
  | "DOWNLOADABLE"
  | "DOWNLOADING"
  | "AVAILABLE";

export type LanguageModelLike = {
  availability: () => Promise<string>;
  create: (options?: Record<string, unknown>) => Promise<unknown>;
};

export function getLanguageModelApi(
  scope: unknown = globalThis
): LanguageModelLike | null {
  if (!scope || typeof scope !== "object") return null;
  const api = (scope as { LanguageModel?: LanguageModelLike }).LanguageModel;
  if (
    !api ||
    typeof api.availability !== "function" ||
    typeof api.create !== "function"
  ) {
    return null;
  }
  return api;
}

export function mapAvailability(value: string): CapabilityStatus {
  if (value === "unavailable") return "UNAVAILABLE";
  if (value === "downloadable") return "DOWNLOADABLE";
  if (value === "downloading") return "DOWNLOADING";
  if (value === "available" || value === "readily") return "AVAILABLE";
  return "UNAVAILABLE";
}

export async function checkBrowserCapability(
  scope: unknown = globalThis
): Promise<CapabilityStatus> {
  const api = getLanguageModelApi(scope);
  if (!api) return "UNSUPPORTED";
  try {
    const availability = await api.availability();
    return mapAvailability(availability);
  } catch {
    return "UNAVAILABLE";
  }
}

export function downloadPercent(loaded: number, total?: number): number {
  if (typeof total === "number" && total > 0 && loaded > 1) {
    return Math.min(100, Math.max(0, Math.floor((loaded / total) * 100)));
  }
  if (loaded >= 0 && loaded <= 1) {
    return Math.min(100, Math.floor(loaded * 100));
  }
  return Math.min(100, Math.max(0, Math.floor(loaded)));
}

export function canSendMessage(options: {
  session: unknown;
  sending: boolean;
  creating: boolean;
  input: string;
}): boolean {
  return Boolean(
    options.session &&
      !options.sending &&
      !options.creating &&
      options.input.trim().length > 0
  );
}

export function inputPlaceholder(
  status: CapabilityStatus | "BOOT" | "CREATING_SESSION" | "READY" | "ERROR"
): string {
  if (status === "UNSUPPORTED" || status === "UNAVAILABLE") {
    return "Local AI is not available in this browser";
  }
  if (status === "DOWNLOADABLE" || status === "DOWNLOADING") {
    return "Download or enable local AI to start chatting";
  }
  if (status === "AVAILABLE" || status === "BOOT") {
    return "Enable local AI to start chatting";
  }
  if (status === "CREATING_SESSION") {
    return "Creating local session…";
  }
  if (status === "ERROR") {
    return "Retry local AI to continue";
  }
  return "Write a message…";
}

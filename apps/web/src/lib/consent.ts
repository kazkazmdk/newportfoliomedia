export const CONSENT_COOKIE = "penta_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  version: typeof CONSENT_VERSION;
  updatedAt: string;
};

export function createConsent(
  choices: Pick<ConsentPreferences, "analytics" | "preferences">,
  updatedAt = new Date().toISOString(),
): ConsentPreferences {
  return {
    necessary: true,
    analytics: choices.analytics,
    preferences: choices.preferences,
    version: CONSENT_VERSION,
    updatedAt,
  };
}

export function parseConsentCookie(cookieHeader: string): ConsentPreferences | null {
  const encoded = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);

  if (!encoded) return null;

  try {
    const value = JSON.parse(decodeURIComponent(encoded)) as Partial<ConsentPreferences>;
    if (
      value.version !== CONSENT_VERSION ||
      value.necessary !== true ||
      typeof value.analytics !== "boolean" ||
      typeof value.preferences !== "boolean" ||
      typeof value.updatedAt !== "string"
    ) {
      return null;
    }
    return value as ConsentPreferences;
  } catch {
    return null;
  }
}

export function serializeConsentCookie(consent: ConsentPreferences, secure = true): string {
  const value = encodeURIComponent(JSON.stringify(consent));
  return [
    `${CONSENT_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

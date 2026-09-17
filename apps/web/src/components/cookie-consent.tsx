"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createConsent,
  parseConsentCookie,
  serializeConsentCookie,
  type ConsentPreferences,
} from "@/lib/consent";

const OPEN_EVENT = "penta:open-cookie-settings";
const CHANGE_EVENT = "penta:consent-changed";

function persistConsent(consent: ConsentPreferences) {
  document.cookie = serializeConsentCookie(consent, window.location.protocol === "https:");
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: consent }));
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      Cookie settings
    </button>
  );
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentPreferences | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);

  const openSettings = useCallback(() => {
    const current = parseConsentCookie(document.cookie);
    setAnalytics(current?.analytics ?? false);
    setPreferences(current?.preferences ?? false);
    setSettingsOpen(true);
  }, []);

  useEffect(() => {
    const hydrate = window.setTimeout(() => setConsent(parseConsentCookie(document.cookie)), 0);
    window.addEventListener(OPEN_EVENT, openSettings);
    return () => {
      window.clearTimeout(hydrate);
      window.removeEventListener(OPEN_EVENT, openSettings);
    };
  }, [openSettings]);

  function choose(next: Pick<ConsentPreferences, "analytics" | "preferences">) {
    const value = createConsent(next);
    persistConsent(value);
    setConsent(value);
    setSettingsOpen(false);
  }

  if (consent === undefined) return null;

  return (
    <>
      {consent === null && !settingsOpen ? (
        <section className="cookie-banner" aria-label="Cookie notice">
          <p className="cookie-title">
            Essential cookies only by default.{" "}
            <Link href="/cookies">Details</Link>
          </p>
          <div className="cookie-actions">
            <button type="button" className="cookie-button secondary" onClick={() => choose({ analytics: false, preferences: false })}>
              Reject optional
            </button>
            <button type="button" className="cookie-button secondary" onClick={openSettings}>
              Customize
            </button>
            <button type="button" className="cookie-button primary" onClick={() => choose({ analytics: true, preferences: true })}>
              Accept optional
            </button>
          </div>
        </section>
      ) : null}

      {settingsOpen ? (
        <div className="cookie-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && consent) setSettingsOpen(false);
        }}>
          <section className="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
            <div className="cookie-dialog-head">
              <div>
                <p className="cookie-eyebrow">Privacy controls</p>
                <h2 id="cookie-settings-title">Cookie settings</h2>
              </div>
              {consent ? (
                <button type="button" className="cookie-close" aria-label="Close cookie settings" onClick={() => setSettingsOpen(false)}>
                  ×
                </button>
              ) : null}
            </div>

            <div className="cookie-option">
              <div>
                <h3>Essential</h3>
                <p>Stores your consent choice for 180 days. The products work without optional cookies.</p>
              </div>
              <span className="cookie-always">Always on</span>
            </div>

            <label className="cookie-option">
              <span>
                <strong>Preferences</strong>
                <small>Allows future convenience settings to persist between visits.</small>
              </span>
              <input type="checkbox" checked={preferences} onChange={(event) => setPreferences(event.target.checked)} />
            </label>

            <label className="cookie-option">
              <span>
                <strong>Analytics</strong>
                <small>Allows privacy-respecting product analytics when a provider is configured. No advertising cookies.</small>
              </span>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
            </label>

            <p className="cookie-dialog-note">
              Consent does not make the sites public or indexable. Read our <Link href="/privacy">privacy notice</Link>.
            </p>
            <div className="cookie-actions">
              <button type="button" className="cookie-button secondary" onClick={() => choose({ analytics: false, preferences: false })}>
                Reject optional
              </button>
              <button type="button" className="cookie-button primary" onClick={() => choose({ analytics, preferences })}>
                Save choices
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

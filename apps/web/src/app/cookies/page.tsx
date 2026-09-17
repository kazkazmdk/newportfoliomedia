import { CookieSettingsButton } from "@/components/cookie-consent";
import { LegalShell } from "@/components/legal-shell";

export default function CookiesPage() {
  return (
    <LegalShell eyebrow="Cookie notice" title="Small, explicit and opt-in">
      <section>
        <h2>Default</h2>
        <p>
          Optional cookies are disabled until you choose otherwise. Rejecting optional cookies does not remove access
          to any of the five decision tools.
        </p>
      </section>
      <section>
        <h2>Cookie in use</h2>
        <div className="legal-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Purpose</th>
                <th>Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>penta_consent</code></td>
                <td>Essential</td>
                <td>Records optional analytics and preference choices plus policy version.</td>
                <td>180 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>Optional categories</h2>
        <p>
          <strong>Preferences</strong> permits future convenience settings to persist between visits.{" "}
          <strong>Analytics</strong> permits product analytics only when a provider is configured. No advertising or
          cross-site profiling category is offered. At this release, choosing an optional category does not itself load
          a third-party provider.
        </p>
      </section>
      <section>
        <h2>Change your choice</h2>
        <p>You can reopen the same controls from every product footer or use this button:</p>
        <CookieSettingsButton className="legal-cookie-button" />
      </section>
    </LegalShell>
  );
}

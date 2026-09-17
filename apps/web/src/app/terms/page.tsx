import { LegalShell } from "@/components/legal-shell";

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Terms of use" title="Decision support, with explicit limits">
      <section>
        <h2>Scope</h2>
        <p>
          FixCode, AutoSpec, WearThere, ChargeMatch and TripCost provide structured decision support. They do not
          replace a manufacturer manual, qualified technician, current weather warning, charger safety certification,
          transport operator quote, or professional advice.
        </p>
      </section>
      <section>
        <h2>Evidence and estimates</h2>
        <p>
          Exact, general, modelled and typical information are labelled differently. A modelled result is not a live
          price or verified measurement. If a page states a safety stop, uncertain fitment, stale quote or missing
          source, do not treat the result as exact.
        </p>
      </section>
      <section>
        <h2>Safe use</h2>
        <p>
          Disconnect unsafe appliances and stop when a diagnostic reaches its safety boundary. Confirm vehicle parts,
          fluids, tyre pressures and service work against the exact vehicle documentation. Use certified chargers and
          cables within their ratings. Confirm forecasts, travel restrictions and fares before acting.
        </p>
      </section>
      <section>
        <h2>Your inputs</h2>
        <p>
          You are responsible for the accuracy of the information you enter and for having the right to use it. Do not
          submit personal or confidential information. “I don’t know” is an accepted input and is preferable to a
          guessed fact.
        </p>
      </section>
      <section>
        <h2>Availability</h2>
        <p>
          These products are in pre-launch mode and may change or be withdrawn. The current kill switch keeps public
          indexing disabled. Commercial operator details, governing law and a support contact must be added before a
          public launch; this page does not invent them.
        </p>
      </section>
    </LegalShell>
  );
}

import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Privacy notice" title="What stays on your device, and what reaches us">
      <section>
        <h2>Current product state</h2>
        <p>
          Penta currently has no account system and no advertising tracker. Inputs sent to the five calculation APIs
          are used to return the requested result; this release does not persist those request bodies in an application
          database. Feedback controls currently update the interface only and do not submit the text to a server.
        </p>
      </section>
      <section>
        <h2>Information you may enter</h2>
        <p>
          Depending on the product, you may enter an appliance code, vehicle identity and mileage, destination,
          travel assumptions, or device and charger models. Do not enter names, contact details, registration
          documents, photographs of other people, or any information you are not entitled to use.
        </p>
      </section>
      <section>
        <h2>Cookies and analytics</h2>
        <p>
          One essential consent cookie records your privacy choices. Optional analytics and preference categories are
          off by default. No optional analytics provider is active unless it is configured and you opt in. See the{" "}
          <Link href="/cookies">cookie notice</Link> for names, purposes and retention.
        </p>
      </section>
      <section>
        <h2>Hosting and technical logs</h2>
        <p>
          Hosting infrastructure may process IP addresses, request paths, timestamps and browser information in
          security and delivery logs. These logs are controlled by the hosting provider and are not used here to build
          advertising profiles.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          You can reject or withdraw optional consent at any time through “Cookie settings” in every product footer.
          Clearing site data removes the consent record and any future preference storage. This pre-launch release
          intentionally does not claim a legal operator or support address that has not yet been supplied.
        </p>
      </section>
    </LegalShell>
  );
}

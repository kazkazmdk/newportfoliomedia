import Image from "next/image";
import Link from "next/link";
import { CABLES, CHARGERS, DEVICES } from "@penta/chargematch";
import { CookieSettingsButton } from "@/components/cookie-consent";

export function ChargematchFooter() {
  const usbc = DEVICES.filter((device) => device.connector === "USB-C").slice(0, 6);
  const wireless = DEVICES.filter((device) => device.connector === "MagSafe" || device.connector === "Watch");
  const chargers = CHARGERS.slice(0, 6);

  return (
    <footer className="cm-hw-footer">
      <div className="cm-hw-footer-hero" aria-hidden="true">
        <Image src="/media/chargematch/charger-gan.png" alt="" width={640} height={640} />
      </div>
      <div className="cm-hw-footer-copy">
        <p className="cm-hw-word">ChargeMatch</p>
        <p>Show the real hardware. Compatibility stays negotiated, never implied by a photograph.</p>
      </div>
      <div className="cm-hw-footer-cols">
        <section>
          <p>Compare devices</p>
          <ul>
            {usbc.map((device) => (
              <li key={device.id}><Link href={`/chargematch/${device.slug}`}>{device.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p>Chargers</p>
          <ul>
            {chargers.map((charger) => (
              <li key={charger.id}><Link href={`/chargematch/iphone-16/with/${charger.slug}`}>{charger.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p>Cables / USB-C</p>
          <ul>
            {CABLES.map((cable) => (
              <li key={cable.id}>{cable.name}</li>
            ))}
            <li><Link href="/chargematch">USB-C compare</Link></li>
            <li><Link href="/chargematch/macbook-air-13-m3/with/anker-100w-2c">Multi-port</Link></li>
            {wireless.length ? <li>MagSafe / Watch on file: {wireless.map((item) => item.name).join(", ")}</li> : null}
          </ul>
        </section>
        <section>
          <p>Power model</p>
          <ul>
            <li><Link href="/chargematch/kit">Methodology</Link></li>
            <li><Link href="/chargematch">Power model</Link></li>
            <li><Link href="/chargematch/kit">Data sources</Link></li>
            <li><Link href="/chargematch/kit">Corrections</Link></li>
          </ul>
        </section>
      </div>
      <div className="cm-hw-legal">
        <p>Hardware stills are class references unless labelled exact. A photo never proves compatibility.</p>
        <nav aria-label="ChargeMatch legal">
          <Link href="/chargematch">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terms">Terms</Link>
          <CookieSettingsButton />
        </nav>
      </div>
    </footer>
  );
}

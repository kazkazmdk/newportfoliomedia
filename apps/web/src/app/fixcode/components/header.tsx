"use client";

import { ALL_ERRORS, APPLIANCES, BRANDS } from "@penta/fixcode";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type FixcodeState } from "./system-ui";

export function FixcodeHeader({
  onOpenTrace,
  status = "idle",
}: {
  onOpenTrace?: () => void;
  status?: "idle" | "warn" | "risk";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const brand = parts[1] && parts[1] !== "diagnose" ? parts[1] : "samsung";
  const appliance = parts[2] ?? "washer";
  const code = parts[3] ? parts[3].toUpperCase() : "4C";
  const systemState: FixcodeState = status === "risk" ? "stop" : status === "warn" ? "caution" : "ready";
  const codes = useMemo(
    () => ALL_ERRORS.filter((item) => item.brand_slug === brand && item.appliance_slug === appliance).slice(0, 12),
    [appliance, brand],
  );

  return (
    <header className="fc-console">
      <Link href="/fixcode" className="fc-console-mark">
        FixCode
      </Link>
      <form
        className="fc-console-search"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const nextBrand = String(data.get("brand") ?? brand);
          const nextAppliance = String(data.get("appliance") ?? appliance);
          const nextCode = String(data.get("code") ?? code).trim();
          const match = ALL_ERRORS.find((item) =>
            item.brand_slug === nextBrand &&
            item.appliance_slug === nextAppliance &&
            item.code.toLowerCase() === nextCode.toLowerCase(),
          );
          if (match) {
            router.push(`/fixcode/${match.brand_slug}/${match.appliance_slug}/${match.code_slug}`);
            return;
          }
          router.push(`/fixcode/diagnose?brand=${nextBrand}&appliance=${nextAppliance}&code=${encodeURIComponent(nextCode)}`);
        }}
      >
        <label>
          <span>Brand</span>
          <select name="brand" aria-label="Brand" defaultValue={brand} key={brand}>
            {BRANDS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Appliance</span>
          <select name="appliance" aria-label="Appliance" defaultValue={appliance} key={appliance}>
            {APPLIANCES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Error code</span>
          <input name="code" aria-label="Error code" defaultValue={code} className="fixcode-mono" list="fc-code-list" />
          <datalist id="fc-code-list">
            {codes.map((item) => <option key={item.id} value={item.code}>{item.meaning}</option>)}
          </datalist>
        </label>
        <button type="submit">Trace</button>
      </form>
      <nav id="fixcode-navigation" className={`fc-console-nav ${open ? "is-open" : ""}`} aria-label="FixCode">
        <Link href="/fixcode#code-index" onClick={() => setOpen(false)}>Guides</Link>
        <Link href="/fixcode#appliance-index" onClick={() => setOpen(false)}>Systems</Link>
        <Link href="/fixcode/diagnose" aria-current={pathname.startsWith("/fixcode/diagnose") ? "page" : undefined} onClick={() => setOpen(false)}>
          Troubleshooting
        </Link>
      </nav>
      <div className="fc-console-led" data-state={systemState} aria-label={`System ${systemState}`}>
        <i />
        {onOpenTrace ? <button type="button" onClick={onOpenTrace}>Evidence</button> : <Link href="/ops">Evidence</Link>}
      </div>
      <button type="button" className="fc-console-menu" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="fixcode-navigation">
        Menu
      </button>
    </header>
  );
}

"use client";

import { CHARGERS, DEVICES } from "@penta/chargematch";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function ChargematchHeader({
  port,
  protocol,
  power,
}: {
  port?: string;
  protocol?: string;
  power?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const device = parts[0] === "chargematch" && parts[1] && parts[1] !== "kit" ? parts[1] : "iphone-16";
  const charger = parts[2] === "with" ? parts[3] : "apple-20w";

  return (
    <header className="cm-bare">
      <Link href="/chargematch" className="cm-bare-mark">
        ChargeMatch
      </Link>
      <nav id="chargematch-navigation" aria-label="ChargeMatch" className={`cm-bare-nav ${open ? "is-open" : ""}`}>
        <Link href="/chargematch" onClick={() => setOpen(false)}>Compare</Link>
        <Link href="/chargematch/macbook-air-13-m3/with/anker-100w-2c" onClick={() => setOpen(false)}>Multi-port</Link>
        <Link href="/chargematch/kit" onClick={() => setOpen(false)}>How it works</Link>
      </nav>
      <form
        className="cm-bare-pair"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          router.push(`/chargematch/${data.get("device")}/with/${data.get("charger")}`);
        }}
      >
        <label>
          <span>Device</span>
          <select name="device" aria-label="Header device" defaultValue={device} key={device}>
            {DEVICES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Charger</span>
          <select name="charger" aria-label="Header charger" defaultValue={charger} key={charger}>
            {CHARGERS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <button type="submit">Open</button>
      </form>
      {power || protocol || port ? (
        <p className="cm-bare-live"><span className="cm-mono">{power}</span>{protocol?.replaceAll("_", " ")}</p>
      ) : null}
      <button type="button" className="cm-bare-menu" aria-expanded={open} aria-controls="chargematch-navigation" onClick={() => setOpen((value) => !value)}>
        Search
      </button>
    </header>
  );
}

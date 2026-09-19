"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AutospecHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const onVehicle = parts[0] === "autospec" && parts.length >= 5;
  const identity = onVehicle
    ? `${parts[1].replaceAll("-", " ")} ${parts[4].replaceAll("-", " ")} ${parts[3]}`.toUpperCase()
    : null;

  return (
    <header className="as-mast">
      <Link href="/autospec" className="as-mast-mark">
        AutoSpec
      </Link>
      <p className="as-mast-identity">{identity ?? "Identify the vehicle"}</p>
      <Link href="/autospec/garage" className="as-mast-garage">
        Garage
      </Link>
      <button type="button" className="as-mast-menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Menu
      </button>
      <nav className={`as-mast-drawer ${open ? "is-open" : ""}`} aria-label="AutoSpec">
        <Link href="/autospec/garage" onClick={() => setOpen(false)}>Garage</Link>
        <Link href="/autospec/bmw/3-series/g20/320d-b47" onClick={() => setOpen(false)}>Featured vehicle</Link>
      </nav>
    </header>
  );
}

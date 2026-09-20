"use client";

import { VEHICLES, vehicleUrl } from "@penta/autospec";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AutospecHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const onVehicle = parts[0] === "autospec" && parts.length >= 5;
  const current = VEHICLES.find((vehicle) =>
    vehicle.make_slug === parts[1] &&
    vehicle.model_slug === parts[2] &&
    vehicle.generation_slug === parts[3] &&
    vehicle.variant_slug === parts[4],
  ) ?? VEHICLES[0];

  return (
    <header className="as-bay">
      <Link href="/autospec" className="as-bay-mark">
        AutoSpec
      </Link>
      <div className="as-bay-vehicle" data-live={onVehicle ? "true" : "false"}>
        <span>Active vehicle</span>
        <strong>{current ? `${current.make} ${current.variant}` : "Identify the vehicle"}</strong>
        <small>{current ? `${current.generation} · ${current.engine_code}` : "No identity selected"}</small>
      </div>
      <nav className={`as-bay-systems ${open ? "is-open" : ""}`} aria-label="AutoSpec systems">
        <Link href={current ? `${vehicleUrl(current)}` : "/autospec"} onClick={() => setOpen(false)}>Specs</Link>
        <Link href={current ? `${vehicleUrl(current)}#systems` : "/autospec"} onClick={() => setOpen(false)}>Systems</Link>
        <Link href={current ? `${vehicleUrl(current)}/maintenance` : "/autospec/garage"} onClick={() => setOpen(false)}>Maintenance</Link>
        <Link href="/autospec" onClick={() => setOpen(false)}>Compare</Link>
      </nav>
      <Link href="/autospec/garage" className="as-bay-garage">Garage</Link>
      <button type="button" className="as-bay-menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Menu
      </button>
    </header>
  );
}

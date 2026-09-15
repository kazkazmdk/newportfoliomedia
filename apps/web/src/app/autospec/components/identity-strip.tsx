import type { VehicleIdentity } from "@penta/autospec";

export function IdentityStrip({ vehicle }: { vehicle: VehicleIdentity }) {
  const cells = [
    vehicle.make,
    vehicle.model,
    vehicle.generation,
    vehicle.variant,
    vehicle.engine_code,
    vehicle.market.join("/"),
    `${vehicle.years[0]}–${vehicle.years.at(-1)}`,
  ];
  return (
    <div className="as-identity">
      {cells.map((cell) => (
        <span key={cell}>{cell}</span>
      ))}
    </div>
  );
}

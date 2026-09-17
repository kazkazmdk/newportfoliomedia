import type { VehicleIdentity } from "@penta/autospec";

export function IdentityStrip({ vehicle }: { vehicle: VehicleIdentity }) {
  const cells = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Generation", value: vehicle.generation },
    { label: "Variant", value: vehicle.variant },
    { label: "Engine", value: vehicle.engine_code },
    { label: "Market", value: vehicle.market.join("/") },
    { label: "Years", value: `${vehicle.years[0]}–${vehicle.years.at(-1)}` },
  ];
  return (
    <div className="as-identity-wrap">
      <p className="as-identity-source"><span>Identity scope</span> Vehicle graph reference</p>
      <dl className="as-identity">
      {cells.map((cell) => (
        <div key={cell.label}>
          <dt>{cell.label}</dt>
          <dd>{cell.value}</dd>
        </div>
      ))}
      </dl>
    </div>
  );
}

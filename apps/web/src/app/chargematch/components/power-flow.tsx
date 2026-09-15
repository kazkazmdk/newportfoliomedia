import { AnimatedNumber } from "@/components/creative";
import type { PowerChain } from "@penta/chargematch";

export function PowerFlow({
  chain,
  sourceWatts,
}: {
  chain: PowerChain;
  sourceWatts: number;
}) {
  const steps = [
    { id: "source", label: "Source", watts: sourceWatts, limit: false },
    { id: "port", label: "Port", watts: chain.portCap, limit: chain.limitingComponent === "port" },
    { id: "protocol", label: "PDO", watts: chain.protocolCap, limit: chain.limitingComponent === "protocol" },
    { id: "cable", label: "Cable", watts: Number.isFinite(chain.cableCap) ? chain.cableCap : sourceWatts, limit: chain.limitingComponent === "cable" },
    { id: "device", label: "Device", watts: chain.deviceCap, limit: chain.limitingComponent === "device" },
    { id: "alloc", label: "Allocation", watts: chain.allocationCap, limit: chain.limitingComponent === "allocation" },
  ];
  return (
    <div className="cm-stack">
      {steps.map((step) => (
        <div key={step.id} className={`cm-step ${step.limit ? "is-limit" : ""}`}>
          <p className="cm-mono text-[11px] uppercase">{step.label}</p>
          <div className="h-[3px] bg-[var(--cm-line)]">
            <div
              className="h-full bg-[var(--cm-ink)]"
              style={{ width: `${Math.min(100, (step.watts / Math.max(sourceWatts, 1)) * 100)}%` }}
            />
          </div>
          <p className="cm-mono text-lg">
            <AnimatedNumber value={step.watts} suffix="W" />
          </p>
        </div>
      ))}
      <p className="cm-mono mt-6 text-5xl">
        <AnimatedNumber value={chain.watts} suffix="W" />
      </p>
      <p className="mt-2 text-sm text-[var(--cm-mute)]">
        Delivered rated · limiter {chain.limitingComponent} · {chain.powerKind.replaceAll("_", " ")}
      </p>
    </div>
  );
}

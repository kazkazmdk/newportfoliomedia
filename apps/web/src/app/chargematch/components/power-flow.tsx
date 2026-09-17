"use client";

import { useState } from "react";
import { AnimatedNumber } from "@/components/creative";
import type { PowerChain } from "@penta/chargematch";

const WHY: Record<string, string> = {
  source: "Rated brick total. Not a measured wall draw.",
  port: "This port’s published ceiling on the selected face.",
  protocol: "Highest compatible PDO on the negotiated path.",
  cable: "Cable e-marker / published wattage cap.",
  device: "Device acceptance on file for this protocol path.",
  alloc: "What remains after allocate() on the used ports.",
};

export function PowerFlow({
  chain,
  sourceWatts,
}: {
  chain: PowerChain;
  sourceWatts: number;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const steps = [
    { id: "source", label: "Source", watts: sourceWatts, limit: false },
    { id: "port", label: "Port", watts: chain.portCap, limit: chain.limitingComponent === "port" },
    { id: "protocol", label: "PDO", watts: chain.protocolCap, limit: chain.limitingComponent === "protocol" },
    { id: "cable", label: "Cable", watts: Number.isFinite(chain.cableCap) ? chain.cableCap : sourceWatts, limit: chain.limitingComponent === "cable" },
    { id: "device", label: "Device", watts: chain.deviceCap, limit: chain.limitingComponent === "device" },
    { id: "alloc", label: "Allocation", watts: chain.allocationCap, limit: chain.limitingComponent === "allocation" },
  ];
  const top = Math.max(sourceWatts, 1);
  return (
    <div className="cm-stack" aria-label="Power ceiling breakdown">
      <div className="cm-stack-heading">
        <span className="cm-mono">Power path</span>
        <span className="cm-mono">Tap a row for evidence</span>
      </div>
      {steps.map((step) => (
        <button
          key={step.id}
          type="button"
          className={`cm-step ${step.limit ? "is-limit" : ""}`}
          onClick={() => setOpen(open === step.id ? null : step.id)}
          aria-expanded={open === step.id}
          aria-controls={`cm-step-detail-${step.id}`}
        >
          <span className="cm-step-label cm-mono">
            {step.label}
            {step.limit ? <i>Limit</i> : null}
          </span>
          <div className="cm-flow-bar">
            <span style={{ width: `${Math.min(100, (step.watts / top) * 100)}%` }} />
          </div>
          <span className="cm-step-value cm-mono">
            <AnimatedNumber value={step.watts} suffix="W" />
          </span>
          {open === step.id ? (
            <span className="cm-why" id={`cm-step-detail-${step.id}`}>
              {WHY[step.id]} Evidence: manufacturer specification / calculated path. Not measured.
            </span>
          ) : null}
        </button>
      ))}
      <div className="cm-stack-result">
        <div>
          <span className="cm-field-label cm-mono">Expected ceiling</span>
          <strong className="cm-mono"><AnimatedNumber value={chain.watts} suffix="W" /></strong>
        </div>
        <p>{chain.watts}W calculated · limit {chain.limitingComponent} · {chain.powerKind.replaceAll("_", " ")}</p>
      </div>
    </div>
  );
}

export { PowerFlow as PowerFlowV2 };

"use client";

import type { Allocation } from "@penta/chargematch";
import { CablePath, ChargerObject, DeviceObject } from "./hardware";

export function MultiportTree({
  total,
  branches,
}: {
  total: number;
  branches: Array<{ id: string; label: string; watts: number; slug?: string }>;
}) {
  const count = Math.max(branches.length, 1);
  const width = 360;
  const top = 36;
  const splitY = 88;
  const endY = 168;
  return (
    <div className="cm-multi is-physical" role="img" aria-label="Port allocation">
      <ChargerObject watts={total} ports={Math.max(branches.length, 2)} />
      <div className="cm-multi-physical">
        {branches.map((branch) => (
          <div key={`obj-${branch.id}`} className="cm-branch">
            <CablePath watts={branch.watts} />
            <DeviceObject slug={branch.slug ?? "iphone-16"} name={branch.label} />
            <p className="cm-mono text-xl">{branch.watts}W</p>
          </div>
        ))}
      </div>
      <details className="cm-allocation-details">
        <summary>Allocation details</summary>
        <svg className="cm-multi-svg" viewBox={`0 0 ${width} 220`} aria-hidden>
          <text x={width / 2} y="22" textAnchor="middle" className="cm-multi-total">{total}W</text>
          <circle cx={width / 2} cy={top} r="7" />
          <line x1={width / 2} y1={top + 7} x2={width / 2} y2={splitY - 8} />
          {branches.map((branch, index) => {
            const x = ((index + 1) / (count + 1)) * width;
            return (
              <g key={branch.id} className="cm-branch">
                <path d={`M ${width / 2} ${splitY} C ${width / 2} ${splitY + 18}, ${x} ${splitY + 18}, ${x} ${endY}`} />
                <circle cx={x} cy={endY} r="5" />
                <text x={x} y={endY + 22} textAnchor="middle" className="cm-mono text-xl">{branch.watts}W</text>
                <text x={x} y={endY + 40} textAnchor="middle" className="cm-multi-label">{branch.label}</text>
              </g>
            );
          })}
        </svg>
      </details>
    </div>
  );
}

export function branchesFromAllocate(
  alloc: Allocation,
  labels: Record<string, string>,
): Array<{ id: string; label: string; watts: number }> {
  return alloc.ports.map((port) => ({
    id: port,
    label: labels[port] ?? port,
    watts: alloc.byPort?.[port] ?? 0,
  }));
}

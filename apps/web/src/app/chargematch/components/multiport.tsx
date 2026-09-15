"use client";

import type { Allocation } from "@penta/chargematch";

export function MultiportTree({
  total,
  branches,
}: {
  total: number;
  branches: Array<{ id: string; label: string; watts: number }>;
}) {
  const max = Math.max(total, 1);
  return (
    <div className="cm-multi" role="img" aria-label="Port allocation">
      <p className="cm-mono text-center text-3xl">{total}W</p>
      <div className="cm-multi-stem" />
      <div className="cm-multi-row">
        {branches.map((b) => (
          <div key={b.id} className="cm-branch">
            <span className="cm-branch-line" style={{ height: `${Math.max(24, (b.watts / max) * 88)}px` }} />
            <p className="cm-mono text-xl">{b.watts}W</p>
            <p className="text-sm">{b.label}</p>
          </div>
        ))}
      </div>
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

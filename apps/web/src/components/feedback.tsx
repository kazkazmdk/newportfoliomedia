"use client";

import { useState } from "react";

export function Feedback({ site }: { site: string }) {
  const [state, setState] = useState<"idle" | "yes" | "no">("idle");
  const [reason, setReason] = useState("");
  if (state === "yes") {
    return <p className="text-sm opacity-70">Noted. That improves the engine.</p>;
  }
  if (state === "no") {
    return (
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setState("yes");
        }}
      >
        <label className="text-sm" htmlFor={`${site}-reason`}>
          What was wrong?
        </label>
        <input
          id={`${site}-reason`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="border bg-transparent px-3 py-2"
        />
        <button type="submit" className="justify-self-start border px-3 py-2 text-sm">
          Send
        </button>
      </form>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <p>Was this correct?</p>
      <button type="button" className="border px-3 py-1" onClick={() => setState("yes")}>
        Yes
      </button>
      <button type="button" className="border px-3 py-1" onClick={() => setState("no")}>
        No
      </button>
    </div>
  );
}

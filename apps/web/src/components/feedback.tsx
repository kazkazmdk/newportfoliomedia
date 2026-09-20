"use client";

import { useState } from "react";
import type { SiteId } from "@penta/monetization";

export function Feedback({ site, entityId }: { site: SiteId | string; entityId?: string }) {
  const [state, setState] = useState<"idle" | "yes" | "no" | "error">("idle");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  async function persist(kind: "feedback_correct" | "feedback_incorrect", value: string) {
    const response = await fetch("/api/v1/observations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ site, kind, entityId, value }),
    });
    if (!response.ok) {
      setState("error");
      setNote("Could not store the observation locally.");
      return false;
    }
    setNote("Stored as USER_REPORTED. It cannot become official or tested.");
    return true;
  }

  if (state === "yes") {
    return <p className="text-sm opacity-70">{note || "Noted. That improves the engine."}</p>;
  }
  if (state === "no") {
    return (
      <form
        className="grid gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const ok = await persist("feedback_incorrect", reason || "incorrect");
          if (ok) setState("yes");
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
          Store locally
        </button>
        {state === "error" ? <p className="text-sm">{note}</p> : null}
      </form>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm opacity-80">
      <p>Was this correct?</p>
      <button
        type="button"
        className="border px-3 py-1"
        onClick={async () => {
          const ok = await persist("feedback_correct", "correct");
          if (ok) setState("yes");
        }}
      >
        Yes
      </button>
      <button type="button" className="border px-3 py-1" onClick={() => setState("no")}>
        No
      </button>
      {state === "error" ? <p>{note}</p> : null}
    </div>
  );
}

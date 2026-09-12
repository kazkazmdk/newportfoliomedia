import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { DiagnoseTool } from "../diagnose-tool";

export const metadata = pageMeta({
  title: "Start diagnosis — FixCode",
  description: "Interactive appliance diagnosis. Not indexed.",
  canonical: "/fixcode/diagnose",
  noindex: true,
});

export default function DiagnosePage() {
  return (
    <Suspense fallback={<p>Loading diagnosis…</p>}>
      <DiagnoseTool />
    </Suspense>
  );
}

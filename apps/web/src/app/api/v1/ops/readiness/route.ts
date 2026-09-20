import { monetizationReadiness } from "@/lib/readiness";
import { limited, ok } from "@/lib/v1";

export async function GET(request: Request) {
  const blocked = limited(request, "v1-readiness", 20);
  if (blocked) return blocked;
  return ok(request, await monetizationReadiness());
}

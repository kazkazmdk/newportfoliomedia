import { cookies } from "next/headers";
import { repo } from "@/lib/platform-store";

const COOKIE = "penta_dev_session";

export function isLocalDevAuthAllowed(request?: Request): boolean {
  if (process.env.NODE_ENV === "production" && process.env.PENTA_ALLOW_DEV_AUTH !== "1") return false;
  if (request?.headers.get("x-penta-dev-actor") === "local") return true;
  return process.env.NODE_ENV !== "production";
}

export async function localDevActor(request?: Request) {
  const store = repo();
  const boot = await store.bootstrapLocalDev();
  if (request && !isLocalDevAuthAllowed(request)) return null;
  return boot;
}

export async function readDevCookie() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "local_dev";
}

export { COOKIE as DEV_SESSION_COOKIE };

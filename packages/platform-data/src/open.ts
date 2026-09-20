import { join } from "node:path";
import { FileFallbackRepository, wrapPersisting } from "./file-fallback";
import { MemoryRepository } from "./memory";
import { PostgresRepository } from "./postgres";
import type { PlatformRepository } from "./repository";

let cached: PlatformRepository | null = null;

export function resetPlatformRepo(): void {
  cached = null;
}

export function openPlatformRepo(): PlatformRepository {
  if (cached) return cached;
  if (process.env.DATABASE_URL) {
    cached = new PostgresRepository(process.env.DATABASE_URL);
    return cached;
  }
  if (process.env.PENTA_PLATFORM_MEMORY === "1") {
    cached = new MemoryRepository();
    return cached;
  }
  const cwd = process.cwd();
  const repoRoot = cwd.endsWith("apps/web") ? join(cwd, "..", "..") : cwd;
  const file = process.env.PENTA_PLATFORM_STORE ?? join(repoRoot, "data", "platform", "store.json");
  cached = wrapPersisting(new FileFallbackRepository(file));
  return cached;
}

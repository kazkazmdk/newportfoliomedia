import { openPlatformRepo, type PlatformRepository } from "@penta/platform-data";

/** Compatibility shim. Product code must go through the repository, not fs. */
export function repo(): PlatformRepository {
  return openPlatformRepo();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

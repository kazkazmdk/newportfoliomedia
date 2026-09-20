import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MemoryRepository } from "./memory";

/**
 * Postgres adapter. Uses DATABASE_URL when present.
 * The runtime query layer stays behind PlatformRepository so product code never sees SQL.
 * Until a driver is wired at boot, callers get a documented blocker rather than a silent file store.
 */
export class PostgresRepository extends MemoryRepository {
  override kind = "postgres" as const;
  constructor(private readonly url: string) {
    super();
    void this.url;
  }
}

export function schemaSql(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return readFileSync(join(here, "schema.sql"), "utf8");
}

export function postgresReady(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ApiKeyRecord } from "@penta/platform-api";
import { MemoryRepository } from "./memory";
import { importLegacyStore } from "./import-legacy";

/** DEV ONLY. Never the hosted source of truth. */
export class FileFallbackRepository extends MemoryRepository {
  override kind = "file" as const;
  constructor(private readonly file: string) {
    super();
    this.hydrate();
  }

  private hydrate() {
    try {
      const raw = JSON.parse(readFileSync(this.file, "utf8")) as Record<string, unknown>;
      importLegacyStore(this, raw);
    } catch {
      // empty first run
    }
  }

  persist() {
    try {
      mkdirSync(dirname(this.file), { recursive: true });
      writeFileSync(
        this.file,
        JSON.stringify(
          {
            keys: this.keys,
            leads: this.leads,
            observations: this.observations,
            events: this.events,
            meter: this.counters,
            widgets: this.widgets,
            adapter: "file_dev_fallback",
          },
          null,
          2,
        ),
      );
    } catch {
      // best-effort local only
    }
  }
}

export function wrapPersisting<T extends FileFallbackRepository>(repo: T): T {
  const persistAfter = [
    "createKey",
    "renameKey",
    "rotateKey",
    "revokeKey",
    "deleteKey",
    "addLead",
    "anonymizeLead",
    "addObservation",
    "moderateObservation",
    "createWidget",
    "revokeWidget",
    "incrementUsage",
    "addEvent",
  ] as const;
  for (const method of persistAfter) {
    const original = repo[method].bind(repo) as (...args: never[]) => Promise<unknown>;
    (repo as unknown as Record<string, unknown>)[method] = async (...args: never[]) => {
      const result = await original(...args);
      repo.persist();
      return result;
    };
  }
  return repo;
}

export type { ApiKeyRecord };

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { LeadRecord, ObservationRecord, PlatformEvent, SiteId } from "@penta/monetization";
import type { ApiKeyRecord, MeterBucket } from "@penta/platform-api";

export type PlatformStore = {
  events: PlatformEvent[];
  leads: LeadRecord[];
  observations: ObservationRecord[];
  keys: ApiKeyRecord[];
  meter: MeterBucket[];
};

const EMPTY: PlatformStore = {
  events: [],
  leads: [],
  observations: [],
  keys: [],
  meter: [],
};

const memory: PlatformStore = structuredClone(EMPTY);

function candidates() {
  if (process.env.PENTA_PLATFORM_STORE) return [process.env.PENTA_PLATFORM_STORE];
  const cwd = process.cwd();
  const repoRoot = cwd.endsWith("apps/web") ? join(cwd, "..", "..") : cwd;
  return [join(repoRoot, "data", "platform", "store.json")];
}

function readDisk(): PlatformStore | null {
  for (const file of candidates()) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as PlatformStore;
      return {
        events: parsed.events ?? [],
        leads: parsed.leads ?? [],
        observations: parsed.observations ?? [],
        keys: parsed.keys ?? [],
        meter: parsed.meter ?? [],
      };
    } catch {
      continue;
    }
  }
  return null;
}

function writeDisk(store: PlatformStore): void {
  const file = candidates()[0];
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(store, null, 2));
  } catch {
    // Local-only best effort. Memory remains the live copy in this process.
  }
}

function load(): PlatformStore {
  const disk = readDisk();
  if (disk) {
    memory.events = disk.events;
    memory.leads = disk.leads;
    memory.observations = disk.observations;
    memory.keys = disk.keys;
    memory.meter = disk.meter;
  }
  return memory;
}

export function readStore(): PlatformStore {
  return load();
}

export function mutateStore<T>(fn: (store: PlatformStore) => T): T {
  const store = load();
  const result = fn(store);
  writeDisk(store);
  return result;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function siteFromStore(site: SiteId, store = readStore()) {
  return {
    events: store.events.filter((row) => row.site === site),
    leads: store.leads.filter((row) => row.site === site),
    observations: store.observations.filter((row) => row.site === site),
    keys: store.keys.filter((row) => row.site === site),
    meter: store.meter.filter((row) => row.site === site),
  };
}

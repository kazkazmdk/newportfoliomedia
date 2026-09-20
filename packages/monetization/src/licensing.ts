import type { SiteId } from "./sites";

/** Licensing models. Coverage numbers stay unknown until a real inventory is measured. */
export type Dataset = {
  id: string;
  site: SiteId;
  name: string;
  schemaVersion: string;
  refreshCadence: "unknown" | "on_source_change" | "monthly";
  coverage: null;
  provenanceSummary: string;
};

export type DatasetVersion = {
  id: string;
  datasetId: string;
  version: string;
  createdAt: string;
};

export type DatasetField = {
  datasetId: string;
  name: string;
  type: string;
  licensable: boolean;
};

export type LicenseRequest = {
  id: string;
  organizationId?: string;
  site: SiteId;
  datasetId?: string;
  message: string;
  status: "received";
  createdAt: string;
};

export type ExportJob = {
  id: string;
  organizationId: string;
  datasetId: string;
  status: "queued" | "blocked_no_license";
  createdAt: string;
};

export function cannotExportWithoutLicense(): "blocked_no_license" {
  return "blocked_no_license";
}

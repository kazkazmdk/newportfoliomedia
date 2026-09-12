import type { ProvenanceRecord, ConfidenceLevel } from "@penta/data-provenance";

export type SafetyClass = "SAFE_USER_CHECK" | "CAUTION" | "PROFESSIONAL_ONLY" | "STOP_USE";

export type FixCause = {
  id: string;
  name: string;
  prior: number;
  summary: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  time_minutes: number;
  cost_eur_min: number;
  cost_eur_max: number;
  tools: string[];
  safety: SafetyClass;
  fix: string;
  blocked_reason?: string;
};

export type DiagnosticAnswer = {
  id: string;
  label: string;
  /** Likelihood P(answer | cause), 0-1 */
  likelihoods: Record<string, number>;
};

export type DiagnosticQuestion = {
  id: string;
  text: string;
  why: string;
  answers: DiagnosticAnswer[];
};

export type ErrorProfile = {
  id: string;
  brand: string;
  brand_slug: string;
  appliance: string;
  appliance_slug: string;
  code: string;
  code_slug: string;
  meaning: string;
  affected_family: string;
  models: string[];
  causes: FixCause[];
  questions: DiagnosticQuestion[];
  related_symptoms: string[];
  safety_notes: string[];
  provenance: ProvenanceRecord[];
  confidence: ConfidenceLevel;
  search_demand: number;
  coverage: "verified";
};

export type SymptomProfile = {
  id: string;
  brand?: string;
  brand_slug?: string;
  appliance: string;
  appliance_slug: string;
  symptom: string;
  symptom_slug: string;
  meaning: string;
  likely_codes: string[];
  causes: FixCause[];
  questions: DiagnosticQuestion[];
  provenance: ProvenanceRecord[];
  confidence: ConfidenceLevel;
  search_demand: number;
};

export type DiagnosisState = {
  profile_id: string;
  priors: Record<string, number>;
  answers: Array<{ question_id: string; answer_id: string }>;
};

export type RankedCause = FixCause & {
  probability: number;
  likelihood_label: "High likelihood" | "Medium likelihood" | "Possible";
  probability_is_calibrated: boolean;
};

export type OutcomeId =
  | "cleaned_filter"
  | "replaced_valve"
  | "hose_issue"
  | "technician_repair"
  | "other";

export type OutcomeRecord = {
  profile_id: string;
  cause_id?: string;
  outcome: OutcomeId;
  status: "REPORTED" | "VERIFIED" | "AGGREGATED";
  at: string;
};

export type DiagnosisResult = {
  profile: ErrorProfile | SymptomProfile;
  headline_cause: RankedCause | undefined;
  causes: RankedCause[];
  next_question: DiagnosticQuestion | null;
  confidence_pct: number;
  confidence_level: ConfidenceLevel;
  why_this_question?: string;
  unknown: boolean;
  safety_ceiling: SafetyClass;
  rule_version: string;
  display_probabilities: boolean;
  trace: {
    facts: string[];
    relations: string[];
    rules: string[];
    sources: string[];
  };
};

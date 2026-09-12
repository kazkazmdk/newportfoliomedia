import type { ConfidenceLevel } from "@penta/data-provenance";
import { explainStructured, recordToolCall, routeAiTask } from "@penta/ai-core";
import type {
  DiagnosisResult,
  DiagnosisState,
  ErrorProfile,
  RankedCause,
  SafetyClass,
  SymptomProfile,
} from "./types";
import { ERRORS } from "./data-samsung";
import { MORE_ERRORS } from "./data-more";
import { SYMPTOMS as SEED_SYMPTOMS } from "./data-symptoms";
import { BATCH2_ERRORS } from "./batch2";
import { symptomsFromErrors } from "./families";

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    if (!map.has(row.id)) map.set(row.id, row);
  }
  return [...map.values()];
}

export const ALL_ERRORS: ErrorProfile[] = uniqueById([
  ...ERRORS,
  ...MORE_ERRORS,
  ...BATCH2_ERRORS,
]);

export const ALL_SYMPTOMS: SymptomProfile[] = uniqueById([
  ...SEED_SYMPTOMS,
  ...symptomsFromErrors(ALL_ERRORS),
]);

const SAFETY_RANK: Record<SafetyClass, number> = {
  SAFE_USER_CHECK: 0,
  CAUTION: 1,
  PROFESSIONAL_ONLY: 2,
};

export function getError(brand: string, appliance: string, code: string) {
  const codeNorm = code.toLowerCase().replace(/-error$/, "");
  return ALL_ERRORS.find(
    (item) =>
      item.brand_slug === brand.toLowerCase() &&
      item.appliance_slug === appliance.toLowerCase() &&
      item.code.toLowerCase() === codeNorm,
  );
}

export function getSymptom(brand: string | undefined, appliance: string, symptom: string) {
  return ALL_SYMPTOMS.find(
    (item) =>
      item.appliance_slug === appliance &&
      item.symptom_slug === symptom &&
      (!brand || item.brand_slug === brand),
  );
}

export function searchFixcode(query: string): Array<ErrorProfile | SymptomProfile> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const errors = ALL_ERRORS.filter((item) =>
    [item.brand, item.appliance, item.code, item.meaning, item.code_slug]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
  const symptoms = ALL_SYMPTOMS.filter((item) =>
    [item.brand, item.appliance, item.symptom, item.meaning].join(" ").toLowerCase().includes(q),
  );
  return [...errors, ...symptoms];
}

function normalize(priors: Record<string, number>): Record<string, number> {
  const sum = Object.values(priors).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(
    Object.entries(priors).map(([key, value]) => [key, value / sum]),
  );
}

export function initialState(profile: ErrorProfile | SymptomProfile): DiagnosisState {
  const priors: Record<string, number> = {};
  for (const cause of profile.causes) priors[cause.id] = cause.prior;
  return { profile_id: profile.id, priors: normalize(priors), answers: [] };
}

export function applyAnswer(
  profile: ErrorProfile | SymptomProfile,
  state: DiagnosisState,
  questionId: string,
  answerId: string,
): DiagnosisState {
  const question = profile.questions.find((item) => item.id === questionId);
  const answer = question?.answers.find((item) => item.id === answerId);
  if (!question || !answer) return state;
  const next = { ...state.priors };
  for (const cause of profile.causes) {
    const likelihood = answer.likelihoods[cause.id] ?? 0.5;
    next[cause.id] = (next[cause.id] ?? cause.prior) * likelihood;
  }
  return {
    profile_id: profile.id,
    priors: normalize(next),
    answers: [...state.answers, { question_id: questionId, answer_id: answerId }],
  };
}

function ranked(profile: ErrorProfile | SymptomProfile, state: DiagnosisState): RankedCause[] {
  return profile.causes
    .map((cause) => ({
      ...cause,
      probability: Math.round((state.priors[cause.id] ?? 0) * 1000) / 10,
    }))
    .sort((a, b) => b.probability - a.probability);
}

function nextQuestion(
  profile: ErrorProfile | SymptomProfile,
  state: DiagnosisState,
) {
  return (
    profile.questions.find(
      (question) => !state.answers.some((answer) => answer.question_id === question.id),
    ) ?? null
  );
}

function confidenceFromSpread(causes: RankedCause[]): { pct: number; level: ConfidenceLevel } {
  if (causes.length === 0) return { pct: 0, level: "UNKNOWN" };
  const top = causes[0].probability;
  const second = causes[1]?.probability ?? 0;
  const gap = top - second;
  const pct = Math.round(Math.min(95, top + gap * 0.35));
  if (pct >= 80) return { pct, level: "HIGH" };
  if (pct >= 55) return { pct, level: "MEDIUM" };
  if (pct >= 25) return { pct, level: "LOW" };
  return { pct, level: "UNKNOWN" };
}

export function diagnose(
  profile: ErrorProfile | SymptomProfile,
  state: DiagnosisState,
): DiagnosisResult {
  const causes = ranked(profile, state);
  const question = nextQuestion(profile, state);
  const { pct, level } = confidenceFromSpread(causes);
  const safety_ceiling = causes.reduce<SafetyClass>((max, cause) => {
    return SAFETY_RANK[cause.safety] > SAFETY_RANK[max] ? cause.safety : max;
  }, "SAFE_USER_CHECK");

  recordToolCall({
    tool: "update_diagnosis",
    input_entity_ids: [profile.id],
    source_versions: profile.provenance.map((item) => item.source_id),
    confidence: level,
    model: "none",
    cost_estimate_usd: 0,
  });

  return {
    profile,
    headline_cause: causes[0],
    causes,
    next_question: question,
    confidence_pct: pct,
    confidence_level: level,
    why_this_question: question?.why,
    unknown: causes.length === 0,
    safety_ceiling,
  };
}

export function explainDiagnosis(result: DiagnosisResult): string {
  const route = routeAiTask({
    deterministicAvailable: true,
    needsClassification: false,
    needsExplanation: true,
    needsVision: false,
    multiFactor: result.causes.length > 2,
  });
  const top = result.causes.slice(0, 3);
  const facts = top.map(
    (cause) =>
      `${cause.name} is estimated at ${cause.probability}% (${cause.safety.replaceAll("_", " ").toLowerCase()}).`,
  );
  if (result.next_question) {
    facts.push(`Next check: ${result.next_question.text}`);
  }
  return explainStructured({
    facts,
    confidence: result.confidence_level,
    unknown:
      result.confidence_level === "LOW" || result.confidence_level === "UNKNOWN"
        ? ["This ranking will move as you answer."]
        : [],
  });
}

export function isBlocked(cause: RankedCause): boolean {
  return cause.safety === "PROFESSIONAL_ONLY";
}

export type OutcomeId =
  | "cleaned_filter"
  | "replaced_valve"
  | "hose_issue"
  | "technician_repair"
  | "other";

const outcomes: Array<{ profile_id: string; outcome: OutcomeId }> = [];

export function reportOutcome(profile_id: string, outcome: OutcomeId): void {
  outcomes.push({ profile_id, outcome });
}

export function outcomeCounts(profile_id: string): Record<string, number> {
  const rows = outcomes.filter((row) => row.profile_id === profile_id);
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.outcome] = (counts[row.outcome] ?? 0) + 1;
  return counts;
}

export function missingCoverage(query: string) {
  return {
    message: "We don't have verified data yet.",
    query,
    collect: true,
  };
}

import type { DiagnosticQuestion, ErrorProfile, SafetyClass, SymptomProfile } from "./types";

export type DiagnosticBranch = {
  answerId: string;
  nextNodeId: string;
  likelihoodDelta?: Record<string, number>;
};

export type DiagnosticCheck = {
  id: string;
  questionId: string;
  question: string;
  why?: string;
  answers: Array<{ id: string; label: string }>;
  safe: boolean;
  safety: SafetyClass;
  branches: DiagnosticBranch[];
};

export type DiagnosticNode = {
  id: string;
  kind: "ERROR" | "CAUSE_CLUSTER" | "SAFE_CHECK" | "LIKELY_CAUSE" | "RESOLUTION" | "STOP";
  label: string;
  safety: SafetyClass;
  questionId?: string;
  next?: string[];
};

export type SafetyBoundary = {
  id: string;
  text: string;
  blocksSelfService: boolean;
  safety: SafetyClass;
};

export type ResolutionPath = {
  causeId: string;
  nextTest?: string;
  safeFix?: string;
  technician: boolean;
};

export type DiagnosticTree = {
  root: string;
  nodes: DiagnosticNode[];
  checks: DiagnosticCheck[];
  boundaries: SafetyBoundary[];
  resolutions: ResolutionPath[];
};

const UNSAFE_RE =
  /gas|mains|220|240|high-voltage|unplug the machine from a live|remove the lid while spinning|live testing|probe live/i;

export function questionSafety(question: DiagnosticQuestion, fallback: SafetyClass = "SAFE_USER_CHECK"): SafetyClass {
  if (UNSAFE_RE.test(`${question.text} ${question.why}`)) return "PROFESSIONAL_ONLY";
  return fallback;
}

export function buildDiagnosticTree(profile: ErrorProfile | SymptomProfile): DiagnosticTree {
  const code = "code" in profile ? profile.code : profile.symptom;
  const stopUse = profile.causes.some((c) => c.safety === "STOP_USE");
  const nodes: DiagnosticNode[] = [
    {
      id: "error",
      kind: "ERROR",
      label: `${profile.appliance} ${code}`,
      safety: stopUse ? "STOP_USE" : "CAUTION",
      next: ["cause-cluster"],
    },
    {
      id: "cause-cluster",
      kind: "CAUSE_CLUSTER",
      label: profile.causes.map((c) => c.name).slice(0, 4).join(" / "),
      safety: "CAUTION",
      next: profile.questions[0] ? ["check-0"] : profile.causes.map((c) => `cause:${c.id}`),
    },
  ];
  const checks: DiagnosticCheck[] = profile.questions.map((q, i) => {
    const safety = questionSafety(q);
    const nextCheck = profile.questions[i + 1] ? `check-${i + 1}` : undefined;
    const branches: DiagnosticBranch[] = q.answers.map((answer) => {
      const topCause = Object.entries(answer.likelihoods ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
      const nextNodeId =
        safety === "STOP_USE" || safety === "PROFESSIONAL_ONLY"
          ? "stop"
          : nextCheck ?? (topCause ? `cause:${topCause}` : "technician");
      return {
        answerId: answer.id,
        nextNodeId,
        likelihoodDelta: answer.likelihoods,
      };
    });
    return {
      id: `check-${i}`,
      questionId: q.id,
      question: q.text,
      why: q.why,
      answers: q.answers.map((a) => ({ id: a.id, label: a.label })),
      safe: safety === "SAFE_USER_CHECK" || safety === "CAUTION",
      safety,
      branches,
    };
  });
  for (const check of checks) {
    nodes.push({
      id: check.id,
      kind: check.safe ? "SAFE_CHECK" : "STOP",
      label: check.question,
      safety: check.safety,
      questionId: check.questionId,
      next: check.branches.map((b) => b.nextNodeId),
    });
  }
  const resolutions: ResolutionPath[] = profile.causes.map((cause) => {
    const technician = cause.safety === "PROFESSIONAL_ONLY" || cause.safety === "STOP_USE";
    nodes.push({
      id: `cause:${cause.id}`,
      kind: "LIKELY_CAUSE",
      label: cause.name,
      safety: cause.safety,
      next: [`resolve:${cause.id}`],
    });
    nodes.push({
      id: `resolve:${cause.id}`,
      kind: "RESOLUTION",
      label: technician ? "Technician / stop use" : cause.fix,
      safety: cause.safety,
    });
    return {
      causeId: cause.id,
      nextTest: profile.questions[0]?.text,
      safeFix: technician ? undefined : cause.fix,
      technician,
    };
  });
  nodes.push({
    id: "technician",
    kind: "RESOLUTION",
    label: "Stop self-service — book a technician",
    safety: "PROFESSIONAL_ONLY",
  });
  nodes.push({
    id: "stop",
    kind: "STOP",
    label: "Safety boundary — do not continue self-service",
    safety: "STOP_USE",
  });
  return {
    root: "error",
    nodes,
    checks,
    boundaries: [
      ...profile.causes
        .filter((c) => c.safety === "STOP_USE" || c.safety === "PROFESSIONAL_ONLY")
        .map((c) => ({
          id: c.id,
          text: c.blocked_reason ?? c.safety,
          blocksSelfService: true,
          safety: c.safety,
        })),
      ...checks
        .filter((c) => !c.safe)
        .map((c) => ({
          id: c.id,
          text: c.question,
          blocksSelfService: true,
          safety: c.safety,
        })),
    ],
    resolutions,
  };
}

export function treeHasUnsafeSelfService(tree: DiagnosticTree): boolean {
  return tree.checks.some((c) => !c.safe);
}

export function nextSafeCheck(
  tree: DiagnosticTree,
  answeredQuestionIds: string[],
): DiagnosticCheck | null {
  return (
    tree.checks.find((check) => check.safe && !answeredQuestionIds.includes(check.questionId)) ?? null
  );
}

export function walkTree(
  tree: DiagnosticTree,
  answers: Array<{ question_id: string; answer_id: string }>,
): DiagnosticNode {
  let node = tree.nodes.find((n) => n.id === tree.root) ?? tree.nodes[0];
  for (const answer of answers) {
    const check = tree.checks.find((c) => c.questionId === answer.question_id || c.id === answer.question_id);
    const branch = check?.branches.find((b) => b.answerId === answer.answer_id);
    if (!branch) break;
    node = tree.nodes.find((n) => n.id === branch.nextNodeId) ?? node;
    if (node.kind === "STOP" || node.safety === "STOP_USE" || node.safety === "PROFESSIONAL_ONLY") {
      return node;
    }
  }
  return node;
}

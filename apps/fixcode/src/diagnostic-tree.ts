import type { ErrorProfile, SafetyClass, SymptomProfile } from "./types";

export type DiagnosticCheck = {
  id: string;
  question: string;
  safe: boolean;
  yesPath: string;
  noPath: string;
};

export type DiagnosticNode = {
  id: string;
  kind: "ERROR" | "CAUSE_CLUSTER" | "SAFE_CHECK" | "LIKELY_CAUSE" | "RESOLUTION";
  label: string;
  safety: SafetyClass;
  next?: string[];
};

export type SafetyBoundary = {
  id: string;
  text: string;
  blocksSelfService: boolean;
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

export function buildDiagnosticTree(profile: ErrorProfile | SymptomProfile): DiagnosticTree {
  const code = "code" in profile ? profile.code : profile.symptom;
  const nodes: DiagnosticNode[] = [
    {
      id: "error",
      kind: "ERROR",
      label: `${profile.appliance} ${code}`,
      safety: profile.causes.some((c) => c.safety === "STOP_USE") ? "STOP_USE" : "CAUTION",
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
    const yes = q.answers[0];
    const no = q.answers[1] ?? q.answers[0];
    const yesCause = Object.entries(yes?.likelihoods ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
    const noCause = Object.entries(no?.likelihoods ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      id: `check-${i}`,
      question: q.text,
      safe: !/gas|mains|220|240|high-voltage|unplug the machine from a live|remove the lid while spinning/i.test(
        `${q.text} ${q.why}`,
      ),
      yesPath: yesCause ? `cause:${yesCause}` : "technician",
      noPath: noCause ? `cause:${noCause}` : "technician",
    };
  });
  for (const check of checks) {
    nodes.push({
      id: check.id,
      kind: "SAFE_CHECK",
      label: check.question,
      safety: check.safe ? "SAFE_USER_CHECK" : "PROFESSIONAL_ONLY",
      next: [check.yesPath, check.noPath],
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
  return {
    root: "error",
    nodes,
    checks,
    boundaries: profile.causes
      .filter((c) => c.safety === "STOP_USE" || c.safety === "PROFESSIONAL_ONLY")
      .map((c) => ({
        id: c.id,
        text: c.blocked_reason ?? c.safety,
        blocksSelfService: true,
      })),
    resolutions,
  };
}

export function treeHasUnsafeSelfService(tree: DiagnosticTree): boolean {
  return tree.checks.some((c) => !c.safe);
}

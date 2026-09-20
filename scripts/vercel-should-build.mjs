#!/usr/bin/env node
/**
 * Vercel Ignored Build Step.
 *
 * Exit codes (Vercel contract):
 *   0 = SKIP this deployment
 *   1 = BUILD this deployment
 *
 * Do not use HEAD^ / HEAD~1. Prefer VERCEL_GIT_PREVIOUS_SHA + VERCEL_GIT_COMMIT_SHA.
 * Missing or unusable previous SHA on an allowed release branch = BUILD (fail open).
 */

import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PRODUCTS = ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"];

export const PROJECT_BY_NAME = {
  "penta-fixcode": "fixcode",
  "penta-autospec": "autospec",
  "penta-wearthere": "wearthere",
  "penta-chargematch": "chargematch",
  "penta-tripcost": "tripcost",
};

export const PROJECT_BY_ID = {
  prj_6fcDJqRN6mk7Y79yBBC6VHcRefYN: "fixcode",
  prj_kXCgXqtxYOWVGPUA1gauzPi8ZcHO: "autospec",
  prj_ejTzO7LKXhhv3zBK7GbS6nP22cxC: "wearthere",
  prj_4dCY7nzzDTxLjamgiPSsJKhl1Ne5: "chargematch",
  prj_0pFQTqkBKFSDyWGnjSL1VvDbK9IK: "tripcost",
};

export const AGENT_BRANCH_PREFIXES = [
  "cursor/",
  "claude/",
  "codex/",
  "agent/",
  "qa/",
  "design/",
  "fix/",
];

const SHARED_PACKAGES = [
  "packages/ai-core/",
  "packages/analytics/",
  "packages/catalog/",
  "packages/data-provenance/",
  "packages/demand/",
  "packages/graph-core/",
  "packages/publishing-core/",
  "packages/quality-gate/",
  "packages/ui-primitives/",
];

const SHARED_EXACT = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "vercel.json",
  "apps/web/package.json",
  "apps/web/next.config.ts",
  "apps/web/tsconfig.json",
  "apps/web/postcss.config.mjs",
  "apps/web/eslint.config.mjs",
  "apps/web/src/proxy.ts",
  "scripts/vercel-should-build.mjs",
]);

const SHARED_PREFIXES = [
  "apps/web/src/app/layout.tsx",
  "apps/web/src/app/page.tsx",
  "apps/web/src/app/globals.css",
  "apps/web/src/app/robots.ts",
  "apps/web/src/app/sitemap.ts",
  "apps/web/src/app/sitemaps",
  "apps/web/src/app/cookies/",
  "apps/web/src/app/privacy/",
  "apps/web/src/app/terms/",
  "apps/web/src/app/ops/",
  "apps/web/src/components/",
  "apps/web/src/lib/",
  "apps/web/public/",
  ...SHARED_PACKAGES,
];

export function normalizePath(file) {
  return String(file || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isIgnoredPath(file) {
  const path = normalizePath(file);
  if (!path) return true;
  if (path.endsWith(".test.ts") || path.endsWith(".spec.ts") || path.endsWith(".test.mjs")) return true;
  if (path.startsWith("tests/") || path.startsWith("docs/") || path.startsWith(".github/")) return true;
  if (path.startsWith("ops/")) return true;
  if (path === "AGENTS.md" || path === "README.md" || path === "LICENSE") return true;
  if (path.endsWith(".md")) return true;
  if (path === "playwright.config.ts" || path === "vitest.config.ts" || path === "tsconfig.packages.json") return true;
  if (path.startsWith("scripts/") && path !== "scripts/vercel-should-build.mjs") return true;
  return false;
}

export function productForPath(file) {
  const path = normalizePath(file);
  for (const product of PRODUCTS) {
    const prefixes = [
      `apps/${product}/`,
      `apps/web/src/app/${product}/`,
      `apps/web/src/app/api/${product}/`,
      `data/demand/${product}/`,
    ];
    if (prefixes.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix))) {
      return product;
    }
  }
  return null;
}

export function isSharedPath(file) {
  const path = normalizePath(file);
  if (isIgnoredPath(path) || productForPath(path)) return false;
  if (SHARED_EXACT.has(path)) return true;
  return SHARED_PREFIXES.some((prefix) => path === prefix.replace(/\/$/, "") || path.startsWith(prefix));
}

export function resolveProduct({ projectName, projectId, product, env = process.env } = {}) {
  const explicit = (product || env.PENTA_PREVIEW_PRODUCT || "").trim().toLowerCase();
  if (PRODUCTS.includes(explicit)) return explicit;
  const name = (projectName || env.VERCEL_PROJECT_NAME || "").trim().toLowerCase();
  if (PROJECT_BY_NAME[name]) return PROJECT_BY_NAME[name];
  const id = (projectId || env.VERCEL_PROJECT_ID || "").trim();
  if (PROJECT_BY_ID[id]) return PROJECT_BY_ID[id];
  return null;
}

export function isAgentBranch(branch) {
  const ref = String(branch || "").trim().toLowerCase();
  return AGENT_BRANCH_PREFIXES.some((prefix) => ref.startsWith(prefix));
}

export function isAllowedReleaseBranch(branch) {
  const ref = String(branch || "").trim();
  return ref === "main" || ref === "master" || ref.startsWith("release/");
}

export function hasSkipVercelMarker(message) {
  return /\[skip vercel\]/i.test(String(message || ""));
}

export function decideBuild({
  product,
  branch,
  changedFiles = [],
  previousSha = null,
  shaReliable = true,
  force = false,
  skipVercel = false,
  commitMessage = "",
} = {}) {
  if (force) {
    return { action: "build", reason: "FORCE_VERCEL_BUILD is set" };
  }

  if (skipVercel || hasSkipVercelMarker(commitMessage)) {
    return { action: "skip", reason: "commit requests [skip vercel]; GitHub only, no Vercel deploy" };
  }

  if (!branch) {
    return { action: "build", reason: "missing git branch; fail open rather than skip a production deploy" };
  }

  if (isAgentBranch(branch)) {
    return { action: "skip", reason: `agent branch '${branch}' is local-validation only` };
  }

  if (!isAllowedReleaseBranch(branch)) {
    return {
      action: "skip",
      reason: `branch '${branch}' is not main/master/release/**; Vercel is not the QA environment`,
    };
  }

  if (!product) {
    return { action: "build", reason: "could not identify Vercel product; fail open on a release branch" };
  }

  if (!shaReliable) {
    return { action: "build", reason: "no reliable previous SHA; fail open on a release branch" };
  }

  const files = changedFiles.map(normalizePath).filter(Boolean);
  if (files.length === 0) {
    return { action: "skip", reason: "no changed files between the compared revisions" };
  }

  const relevant = files.filter((file) => !isIgnoredPath(file));
  if (relevant.length === 0) {
    return { action: "skip", reason: "only documentation, tests, or non-deployed files changed" };
  }

  const shared = relevant.filter(isSharedPath);
  if (shared.length > 0) {
    return { action: "build", reason: `shared deployable path changed (${shared[0]})` };
  }

  const own = relevant.filter((file) => productForPath(file) === product);
  if (own.length > 0) {
    return { action: "build", reason: `${product} source changed (${own[0]})` };
  }

  const others = [...new Set(relevant.map(productForPath).filter(Boolean))];
  if (others.length > 0) {
    return { action: "skip", reason: `changes belong to ${others.join(", ")}, not ${product}` };
  }

  return { action: "skip", reason: "changed files are unrelated to this Vercel app" };
}

function shaExists(sha) {
  if (!sha || !/^[0-9a-f]{7,40}$/i.test(sha)) return false;
  try {
    execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function listChangedFiles(previousSha, commitSha) {
  const output = execFileSync("git", ["diff", "--name-only", previousSha, commitSha], {
    encoding: "utf8",
  });
  return output.split("\n").map((line) => line.trim()).filter(Boolean);
}

function parseCli(argv = process.argv.slice(2)) {
  const { values } = parseArgs({
    args: argv,
    options: {
      product: { type: "string" },
      branch: { type: "string" },
      files: { type: "string", multiple: true },
      "previous-sha": { type: "string" },
      "commit-sha": { type: "string" },
      force: { type: "boolean", default: false },
      "commit-message": { type: "string" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });
  return values;
}

export function runShouldBuild({ env = process.env, argv = process.argv.slice(2), git = true } = {}) {
  const cli = parseCli(argv);
  const force = Boolean(cli.force || env.FORCE_VERCEL_BUILD === "1" || env.VERCEL_FORCE_BUILD === "1");
  const skipVercel = env.PENTA_SKIP_VERCEL === "1" || env.SKIP_VERCEL_DEPLOY === "1";
  const commitMessage = cli["commit-message"] || env.VERCEL_GIT_COMMIT_MESSAGE || "";
  const product = resolveProduct({ product: cli.product, env });
  const branch = cli.branch || env.VERCEL_GIT_COMMIT_REF || "";
  const previousSha = cli["previous-sha"] || env.VERCEL_GIT_PREVIOUS_SHA || "";
  const commitSha = cli["commit-sha"] || env.VERCEL_GIT_COMMIT_SHA || "";

  let changedFiles = cli.files ? cli.files.flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean) : null;
  let shaReliable = true;

  if (!changedFiles) {
    if (!previousSha || !commitSha || (git && (!shaExists(previousSha) || !shaExists(commitSha)))) {
      shaReliable = false;
      changedFiles = [];
    } else if (git) {
      try {
        changedFiles = listChangedFiles(previousSha, commitSha);
      } catch {
        shaReliable = false;
        changedFiles = [];
      }
    } else {
      shaReliable = false;
      changedFiles = [];
    }
  }

  const decision = decideBuild({
    product,
    branch,
    changedFiles,
    previousSha,
    shaReliable,
    force,
    skipVercel,
    commitMessage,
  });

  return {
    product,
    branch,
    previousSha: previousSha || null,
    commitSha: commitSha || null,
    changedFiles,
    ...decision,
    exitCode: decision.action === "skip" ? 0 : 1,
  };
}

const invokedDirectly = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (invokedDirectly) {
  const result = runShouldBuild();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.action.toUpperCase()} ${result.product || "unknown"}: ${result.reason}`);
  }
  process.exit(result.exitCode);
}

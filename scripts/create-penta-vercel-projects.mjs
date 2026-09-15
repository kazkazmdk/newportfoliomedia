#!/usr/bin/env node
/**
 * Create five distinct Vercel preview projects for the same GitHub repo.
 * Requires VERCEL_TOKEN. Optional VERCEL_TEAM_ID / VERCEL_ORG_ID.
 *
 *   VERCEL_TOKEN=... node scripts/create-penta-vercel-projects.mjs
 */
const TOKEN = process.env.VERCEL_TOKEN;
if (!TOKEN) {
  console.error("VERCEL_TOKEN is required.");
  process.exit(1);
}

const TEAM = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || "";
const REPO = "kazkazmdk/newportfoliomedia";
const PRODUCTS = ["fixcode", "wearthere", "chargematch", "autospec", "tripcost"];
const API = "https://api.vercel.com";

function qs() {
  return TEAM ? `?teamId=${encodeURIComponent(TEAM)}` : "";
}

async function api(method, path, body) {
  const res = await fetch(`${API}${path}${qs()}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} ${res.status}: ${text.slice(0, 800)}`);
  }
  return json;
}

async function ensureEnv(projectId, key, value) {
  const list = await api("GET", `/v9/projects/${projectId}/env`);
  const rows = list.envs || list;
  const existing = (Array.isArray(rows) ? rows : []).filter((e) => e.key === key);
  for (const row of existing) {
    await api("DELETE", `/v9/projects/${projectId}/env/${row.id}`);
  }
  await api("POST", `/v10/projects/${projectId}/env`, {
    key,
    value,
    type: "plain",
    target: ["preview", "development"],
  });
}

async function main() {
  const existing = await api("GET", "/v9/projects?limit=200");
  const projects = existing.projects || [];
  const out = [];
  for (const product of PRODUCTS) {
    const name = `penta-${product}`;
    let project = projects.find((p) => p.name === name);
    if (!project) {
      project = await api("POST", "/v10/projects", {
        name,
        framework: "nextjs",
        buildCommand: "pnpm --filter web build",
        installCommand: "pnpm install --frozen-lockfile",
        outputDirectory: "apps/web/.next",
        gitRepository: { type: "github", repo: REPO },
      });
      console.log(`created ${name} ${project.id}`);
    } else {
      console.log(`exists ${name} ${project.id}`);
      await api("PATCH", `/v9/projects/${project.id}`, {
        framework: "nextjs",
        buildCommand: "pnpm --filter web build",
        installCommand: "pnpm install --frozen-lockfile",
        outputDirectory: "apps/web/.next",
      }).catch((err) => console.warn(`patch ${name}: ${err.message}`));
    }
    await ensureEnv(project.id, "PUBLIC_SITE_LIVE", "false");
    await ensureEnv(project.id, "PENTA_PREVIEW_PRODUCT", product);
    const deployment = await api("POST", "/v13/deployments", {
      name,
      project: project.id,
      target: "preview",
      gitSource: {
        type: "github",
        org: "kazkazmdk",
        repo: "newportfoliomedia",
        ref: "main",
      },
    });
    out.push({
      product,
      project: name,
      projectId: project.id,
      deployment: deployment.id,
      url: deployment.url ? `https://${deployment.url}` : null,
      status: deployment.readyState || deployment.status || "QUEUED",
    });
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

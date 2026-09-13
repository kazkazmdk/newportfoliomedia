#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const action = process.argv[2] || "check";

const projects = [
  {
    name: "folio",
    cwd: root,
    env: {},
    scripts: { lint: "lint", test: "test", build: "build", check: "check" },
  },
  {
    name: "beyond_memories",
    cwd: path.join(root, "sites/beyond_memories"),
    env: { NODE_OPTIONS: "--openssl-legacy-provider" },
    scripts: { lint: "lint", test: "test", build: "build", check: "check" },
  },
  {
    name: "dametis",
    cwd: path.join(root, "sites/dametis"),
    env: {},
    scripts: { lint: "lint", test: "test", build: "build", check: "check" },
  },
  {
    name: "skatdesigner",
    cwd: path.join(root, "sites/skatdesigner"),
    env: { HUSKY: "0" },
    scripts: { lint: "lint", test: "test", build: "build", check: "check" },
  },
  {
    name: "three_template",
    cwd: path.join(root, "sites/three_template"),
    env: { NODE_OPTIONS: "--openssl-legacy-provider" },
    scripts: { lint: "lint", test: "test", build: "build", check: "check" },
  },
];

let failed = 0;
for (const project of projects) {
  const script = project.scripts[action];
  if (!script) continue;
  console.log(`\n=== ${project.name}: npm run ${script} ===`);
  const result = spawnSync("npm", ["run", script], {
    cwd: project.cwd,
    stdio: "inherit",
    env: { ...process.env, ...project.env },
  });
  if (result.status !== 0) {
    failed += 1;
    console.error(`${project.name} failed with code ${result.status}`);
  }
}

if (failed) {
  process.exit(1);
}

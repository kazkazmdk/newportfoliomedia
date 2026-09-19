import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sizeOf from "image-size";

type Gate = "PASS" | "WARN" | "FAIL" | "NOT_VERIFIED";

type Asset = {
  path: string;
  usage: string;
  source: string;
};

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "apps/web/public");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

function toPublicPath(abs: string) {
  return `/${path.relative(PUBLIC, abs).replaceAll(path.sep, "/")}`;
}

function named(usage: string, source: string, file: string): Asset {
  return { path: toPublicPath(file), usage, source };
}

const PRIMARY: Asset[] = [
  ...walk(path.join(PUBLIC, "media/wearthere")).map((file) =>
    named("WearThere seasonal / destination raster", "licensed local media", file),
  ),
  ...walk(path.join(PUBLIC, "media/autospec")).map((file) =>
    named("AutoSpec body still", "Wikimedia Commons", file),
  ),
  ...walk(path.join(PUBLIC, "media/chargematch")).map((file) =>
    named("ChargeMatch class-form-factor hardware", "authored local raster", file),
  ),
  ...walk(path.join(ROOT, "docs/reference-visual-rebuild-v2/current")).slice(0, 40).map((file) => ({
    path: path.relative(ROOT, file).replaceAll(path.sep, "/"),
    usage: "Visual QA v2 current capture",
    source: "Playwright",
  })),
  ...walk(path.join(ROOT, "docs/reference-visual-rebuild-v3/current")).map((file) => ({
    path: path.relative(ROOT, file).replaceAll(path.sep, "/"),
    usage: "Visual QA v3 current capture",
    source: "Playwright",
  })),
  ...walk(path.join(ROOT, "docs/reference-visual-rebuild-v3/reference")).map((file) => ({
    path: path.relative(ROOT, file).replaceAll(path.sep, "/"),
    usage: "Visual QA v3 official reference",
    source: "Playwright live capture",
  })),
];

function resolveFile(assetPath: string) {
  if (assetPath.startsWith("docs/")) return path.join(ROOT, assetPath);
  return path.join(PUBLIC, assetPath.replace(/^\//, ""));
}

function readDimensions(file: string): { width?: number; height?: number; raw: string } {
  try {
    const size = sizeOf(readFileSync(file));
    if (!size.width || !size.height) return { raw: "unknown" };
    return { width: size.width, height: size.height, raw: `${size.width} ${size.height}` };
  } catch {
    return { raw: "unknown" };
  }
}

function gateFor(present: boolean, width?: number, height?: number): Gate {
  if (!present) return "FAIL";
  if (!width || !height) return "NOT_VERIFIED";
  if (width < 400 || height < 300) return "WARN";
  return "PASS";
}

const rows = PRIMARY.map((asset) => {
  const file = resolveFile(asset.path);
  const present = existsSync(file);
  const size = present ? statSync(file).size : 0;
  const dims = present ? readDimensions(file) : { raw: "missing" };
  return {
    ...asset,
    present,
    bytes: size,
    dimensions: dims.raw,
    gate: gateFor(present, dims.width, dims.height),
  };
});

console.log(JSON.stringify({ generated: new Date().toISOString(), rows }, null, 2));
if (rows.some((row) => row.gate === "FAIL")) process.exit(1);

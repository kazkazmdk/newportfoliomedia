import { existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

type Asset = {
  path: string;
  usage: string;
  source: string;
  fallback: string;
};

const ROOT = path.join(process.cwd(), "apps/web/public");

const PRIMARY: Asset[] = [
  { path: "/media/wearthere/tokyo-rain-commons.jpg", usage: "WearThere Tokyo winter/autumn hero", source: "Wikimedia Commons CC0", fallback: "/media/wearthere/tokyo-alt.webp" },
  { path: "/media/wearthere/tokyo-alt.webp", usage: "WearThere Tokyo spring hero", source: "Unsplash License", fallback: "/media/wearthere/tokyo-rain-commons.jpg" },
  { path: "/media/wearthere/tokyo-street.webp", usage: "WearThere Tokyo summer hero", source: "Unsplash License", fallback: "/media/wearthere/tokyo-alt.webp" },
  { path: "/media/wearthere/tokyo-hero.webp", usage: "WearThere Tokyo autumn night", source: "Unsplash License", fallback: "/media/wearthere/tokyo-rain-commons.jpg" },
  { path: "/media/wearthere/paris-rain-commons.jpg", usage: "WearThere Paris winter/autumn hero", source: "Wikimedia Commons CC BY 2.0", fallback: "/media/wearthere/paris-street-commons.jpg" },
  { path: "/media/autospec/bmw-g20.jpg", usage: "AutoSpec body still G20", source: "Wikimedia Commons CC BY-SA 4.0", fallback: "copy-only, no fake car" },
];

function identify(file: string) {
  try {
    return execFileSync("identify", ["-format", "%w %h", file], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const rows = PRIMARY.map((asset) => {
  const file = path.join(ROOT, asset.path.replace(/^\//, ""));
  const present = existsSync(file);
  const size = present ? statSync(file).size : 0;
  const dims = present ? identify(file) : "missing";
  const [w, h] = dims.split(" ").map(Number);
  const tooSmall = Number.isFinite(w) && Number.isFinite(h) && (w < 1200 || h < 600);
  return {
    ...asset,
    present,
    bytes: size,
    dimensions: dims,
    gate: !present ? "FAIL missing" : tooSmall ? "WARN small source" : "OK",
  };
});

console.log(JSON.stringify({ generated: new Date().toISOString(), rows }, null, 2));
if (rows.some((row) => row.gate.startsWith("FAIL"))) process.exit(1);

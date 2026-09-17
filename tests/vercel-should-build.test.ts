import { describe, expect, it } from "vitest";
import {
  decideBuild,
  isAgentBranch,
  isAllowedReleaseBranch,
  isIgnoredPath,
  isSharedPath,
  productForPath,
  resolveProduct,
} from "../scripts/vercel-should-build.mjs";

describe("vercel-should-build path classification", () => {
  it("maps product engines and UI to a single app", () => {
    expect(productForPath("apps/fixcode/src/data.ts")).toBe("fixcode");
    expect(productForPath("apps/web/src/app/autospec/page.tsx")).toBe("autospec");
    expect(productForPath("apps/web/src/app/api/wearthere/packing/route.ts")).toBe("wearthere");
    expect(productForPath("data/demand/chargematch/evidence.csv")).toBe("chargematch");
    expect(productForPath("apps/tripcost/src/index.ts")).toBe("tripcost");
  });

  it("does not treat another product UI as shared", () => {
    expect(isSharedPath("apps/web/src/app/fixcode/page.tsx")).toBe(false);
    expect(isSharedPath("apps/autospec/src/engine.ts")).toBe(false);
  });

  it("treats actually consumed shared packages and web shell as shared", () => {
    expect(isSharedPath("packages/graph-core/src/index.ts")).toBe(true);
    expect(isSharedPath("packages/catalog/src/index.ts")).toBe(true);
    expect(isSharedPath("apps/web/src/app/layout.tsx")).toBe(true);
    expect(isSharedPath("apps/web/src/components/cookie-consent.tsx")).toBe(true);
    expect(isSharedPath("pnpm-lock.yaml")).toBe(true);
    expect(isSharedPath("vercel.json")).toBe(true);
  });

  it("ignores docs, tests, CI and non-build scripts", () => {
    expect(isIgnoredPath("docs/PENTA_STATE.md")).toBe(true);
    expect(isIgnoredPath("packages/catalog/src/catalog.test.ts")).toBe(true);
    expect(isIgnoredPath("tests/visual-qa/product-first.spec.ts")).toBe(true);
    expect(isIgnoredPath(".github/workflows/ci.yml")).toBe(true);
    expect(isIgnoredPath("scripts/penta-state.ts")).toBe(true);
    expect(isIgnoredPath("README.md")).toBe(true);
  });
});

describe("vercel-should-build branch policy", () => {
  it("marks routine agent branches as local-only", () => {
    expect(isAgentBranch("cursor/design-pass-b9ec")).toBe(true);
    expect(isAgentBranch("claude/fix-footer")).toBe(true);
    expect(isAgentBranch("codex/qa-1")).toBe(true);
    expect(isAgentBranch("agent/explore")).toBe(true);
    expect(isAgentBranch("qa/visual")).toBe(true);
    expect(isAgentBranch("design/wearthere")).toBe(true);
    expect(isAgentBranch("fix/cookie-banner")).toBe(true);
    expect(isAgentBranch("main")).toBe(false);
    expect(isAgentBranch("release/2026-09-17")).toBe(false);
  });

  it("allows only main/master/release branches to consider a Vercel build", () => {
    expect(isAllowedReleaseBranch("main")).toBe(true);
    expect(isAllowedReleaseBranch("master")).toBe(true);
    expect(isAllowedReleaseBranch("release/penta")).toBe(true);
    expect(isAllowedReleaseBranch("feature/new-page")).toBe(false);
  });
});

describe("vercel-should-build decisions", () => {
  it("builds only the affected product when app A changes", () => {
    const files = ["apps/fixcode/src/data.ts", "apps/web/src/app/fixcode/page.tsx"];
    expect(decideBuild({ product: "fixcode", branch: "main", changedFiles: files }).action).toBe("build");
    expect(decideBuild({ product: "autospec", branch: "main", changedFiles: files }).action).toBe("skip");
    expect(decideBuild({ product: "tripcost", branch: "main", changedFiles: files }).action).toBe("skip");
  });

  it("builds only the affected product when app B changes", () => {
    const files = ["apps/web/src/app/autospec/autospec.css"];
    expect(decideBuild({ product: "autospec", branch: "main", changedFiles: files }).action).toBe("build");
    expect(decideBuild({ product: "fixcode", branch: "main", changedFiles: files }).action).toBe("skip");
    expect(decideBuild({ product: "chargematch", branch: "main", changedFiles: files }).action).toBe("skip");
  });

  it("skips every app when only documentation changes", () => {
    const files = ["docs/PENTA_DESIGN_REFERENCES.md", "README.md"];
    for (const product of ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"]) {
      expect(decideBuild({ product, branch: "main", changedFiles: files }).action).toBe("skip");
    }
  });

  it("builds every product when a consumed shared package changes", () => {
    const files = ["packages/graph-core/src/index.ts"];
    for (const product of ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"]) {
      expect(decideBuild({ product, branch: "main", changedFiles: files }).action).toBe("build");
    }
  });

  it("skips unrelated tooling and other-product demand data", () => {
    expect(
      decideBuild({
        product: "tripcost",
        branch: "main",
        changedFiles: ["scripts/penta-state.ts", "data/demand/fixcode/evidence.csv"],
      }).action,
    ).toBe("skip");
  });

  it("builds an affected production app on main", () => {
    const result = decideBuild({
      product: "wearthere",
      branch: "main",
      changedFiles: ["apps/wearthere/src/index.ts"],
    });
    expect(result.action).toBe("build");
  });

  it("never requires a Vercel build for a routine Cursor branch", () => {
    const files = ["apps/web/src/app/fixcode/page.tsx", "packages/graph-core/src/index.ts"];
    for (const product of ["fixcode", "autospec", "wearthere", "chargematch", "tripcost"]) {
      expect(
        decideBuild({ product, branch: "cursor/local-qa-b9ec", changedFiles: files }).action,
      ).toBe("skip");
    }
  });

  it("fails open when the git branch is missing", () => {
    expect(
      decideBuild({
        product: "fixcode",
        branch: "",
        changedFiles: ["docs/only.md"],
      }).action,
    ).toBe("build");
  });

  it("fails open on a release branch without a reliable previous SHA", () => {
    expect(
      decideBuild({
        product: "fixcode",
        branch: "main",
        changedFiles: [],
        shaReliable: false,
      }).action,
    ).toBe("build");
  });

  it("resolves projects from Vercel name or id", () => {
    expect(resolveProduct({ projectName: "penta-tripcost" })).toBe("tripcost");
    expect(resolveProduct({ projectId: "prj_6fcDJqRN6mk7Y79yBBC6VHcRefYN" })).toBe("fixcode");
    expect(resolveProduct({ env: { PENTA_PREVIEW_PRODUCT: "chargematch" } })).toBe("chargematch");
  });
});

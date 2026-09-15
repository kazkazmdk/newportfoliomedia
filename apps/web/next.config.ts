import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@penta/ai-core",
    "@penta/analytics",
    "@penta/autospec",
    "@penta/catalog",
    "@penta/chargematch",
    "@penta/data-provenance",
    "@penta/demand",
    "@penta/fixcode",
    "@penta/graph-core",
    "@penta/publishing-core",
    "@penta/quality-gate",
    "@penta/tripcost",
    "@penta/ui-primitives",
    "@penta/wearthere",
  ],
  images: { unoptimized: true },
  async redirects() {
    const product = (process.env.PENTA_PREVIEW_PRODUCT ?? "").trim().toLowerCase();
    if (!["fixcode", "wearthere", "chargematch", "autospec", "tripcost"].includes(product)) {
      return [];
    }
    return [{ source: "/", destination: `/${product}`, permanent: false }];
  },
  async headers() {
    if (process.env.PUBLIC_SITE_LIVE === "true") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

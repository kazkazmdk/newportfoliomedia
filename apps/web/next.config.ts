import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@penta/ai-core",
    "@penta/analytics",
    "@penta/autospec",
    "@penta/catalog",
    "@penta/chargematch",
    "@penta/data-provenance",
    "@penta/fixcode",
    "@penta/graph-core",
    "@penta/publishing-core",
    "@penta/quality-gate",
    "@penta/tripcost",
    "@penta/ui-primitives",
    "@penta/wearthere",
  ],
  images: { unoptimized: true },
};

export default nextConfig;

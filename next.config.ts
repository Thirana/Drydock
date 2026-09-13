import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: `next build` writes the site to `out/`, and any feature
  // that needs a server fails the build instead of silently shipping one.
  output: "export",
};

const withMDX = createMDX({
  options: {
    // Plugins are named as strings so Turbopack can load them.
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);

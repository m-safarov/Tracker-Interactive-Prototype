import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/sign-in", permanent: false }];
  },
  async rewrites() {
    return [
      { source: "/login", destination: "/sign-in" },
      { source: "/register", destination: "/sign-up" },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
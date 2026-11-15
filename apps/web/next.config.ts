import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inline image identity at build time; runtime variables cannot change this value.
  env: { BREWLITE_BUILD_SHA: process.env.BREWLITE_BUILD_SHA || "unknown" },
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
      ],
    }];
  },
};

export default nextConfig;

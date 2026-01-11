import type { NextConfig } from "next";
// Validate environment early during build/start
import "./src/lib/env";

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.BUILD_FOR_NATIVE === 'true' ? 'export' : 'standalone',
  experimental: {
    reactCompiler: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.BUILD_FOR_NATIVE === 'true',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Security headers (exclude Next.js internal paths to avoid MIME type issues)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.gemini.google.com; frame-ancestors 'self';",
          },
        ],
        missing: [
          {
            type: "header",
            key: "x-nextjs-data",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

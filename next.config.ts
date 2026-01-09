import type { NextConfig } from "next";

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
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
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

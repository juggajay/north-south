import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor (mobile) deployment
  output: "export",

  // Required for static export
  images: {
    unoptimized: true,
  },

  // Better for static hosting and deep linking
  trailingSlash: true,

  // Externalize @react-pdf/renderer to prevent SSR bundling issues (Next.js 16+)
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;

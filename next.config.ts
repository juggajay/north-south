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
};

export default nextConfig;

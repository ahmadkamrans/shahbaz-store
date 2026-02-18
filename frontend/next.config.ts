import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // For static assets compatibility
  },
};

export default nextConfig;

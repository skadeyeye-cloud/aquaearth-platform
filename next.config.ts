import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion', 'motion-dom'],
  devIndicators: false,
};

export default nextConfig;

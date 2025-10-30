// frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false,
  // никаких eslint в конфиге для Next 16
};

export default nextConfig;

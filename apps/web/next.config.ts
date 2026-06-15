import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@playground/shared'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Recompile when workspace packages change (not just app source).
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@playground)/],
      };
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '!**/node_modules/@playground/**'],
      };
    }
    return config;
  },
};

export default nextConfig;

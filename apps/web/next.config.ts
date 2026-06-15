import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@playground/shared'],
  // Include monorepo workspace packages in Vercel serverless traces
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async redirects() {
    return [
      { source: '/game', destination: '/games/trivia', permanent: false },
      { source: '/game/:sessionId', destination: '/games/trivia/:sessionId', permanent: false },
    ];
  },
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

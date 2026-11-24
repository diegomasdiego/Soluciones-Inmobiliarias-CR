import type { NextConfig } from 'next';

const config: NextConfig = {
  // A self-contained server for the Docker image Railway runs (see the Dockerfile at the repo root).
  output: 'standalone',
  poweredByHeader: false,
  // Types are checked with `npm run typecheck` (TypeScript 7), not by the Next build.
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
      { source: '/(favicon.svg|favicon-32.png|apple-touch-icon.png|icon-192.png|icon-512.png|og-image.jpg|site.webmanifest)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
    ];
  },
};

export default config;

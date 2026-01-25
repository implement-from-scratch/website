/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  eslint: {
    // Suppress ESLint warnings during build
    // The circular structure warning is a known Next.js/ESLint issue
    // and doesn't affect build functionality
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'config'],
  },
  // Suppress specific build warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    serverComponentsExternalPackages: ['rehype-mermaid', 'playwright', 'playwright-core'],
  },
}

module.exports = nextConfig

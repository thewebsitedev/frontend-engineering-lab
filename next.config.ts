import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Emit a minimal standalone server (.next/standalone) for a lean Docker image.
  output: 'standalone',
}

export default nextConfig

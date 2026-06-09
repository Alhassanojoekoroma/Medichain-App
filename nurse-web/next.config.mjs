/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false, // Strict mode - catch all TypeScript errors
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

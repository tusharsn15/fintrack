/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/login', destination: '/' },
      { source: '/dashboard', destination: '/' },
      { source: '/transactions', destination: '/' },
      { source: '/transactions/:id', destination: '/' },
      { source: '/add-transaction', destination: '/' },
      { source: '/budgets', destination: '/' },
      { source: '/insights', destination: '/' },
      { source: '/profile', destination: '/' },
      { source: '/settings', destination: '/' },
    ]
  },
}

export default nextConfig

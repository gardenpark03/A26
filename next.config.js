/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화
  reactStrictMode: true,
  
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // 실험적 기능 (속도 개선)
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-select'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig


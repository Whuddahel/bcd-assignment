import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    remotePatterns: [
      // Supabase Storage (product images, avatars, KYC docs)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Placeholder images for seed data / development
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Unsplash (optional, for editorial images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Allow Stripe.js to load
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },
}

export default nextConfig

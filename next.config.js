/** @type {import('next').NextConfig} */
const nextConfig = {
  // 資安相關設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://api.pexels.com; frame-src 'self' https://accounts.google.com;"
          }
        ]
      }
    ]
  },
  
  // 圖片優化設定
  images: {
    domains: [
      'supabase.co',
      'lyteygbseuyggbstloqu.supabase.co',
      'maps.googleapis.com',
      'images.pexels.com',
      'lh3.googleusercontent.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // 實驗性功能
  experimental: {
    // 實驗性功能設定
  },

  // 環境變數
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  }
}

module.exports = nextConfig 
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://flyvietnam.help'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/payment/',
          '/confirmation/',
          '/order-confirmed/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

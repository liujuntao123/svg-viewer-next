// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-13 09:21:00 +08:00; Reason: Create dynamic robots.txt generator for better SEO;
// }}
// {{START MODIFICATIONS}}

import { siteConfig } from './utils/metadata';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/static/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

// {{END MODIFICATIONS}} 
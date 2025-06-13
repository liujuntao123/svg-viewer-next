// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-13 09:21:00 +08:00; Reason: Create dynamic sitemap generator for better SEO;
// }}
// {{START MODIFICATIONS}}

import { siteConfig } from './utils/metadata';

export default function sitemap() {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // 可以根据需要添加更多页面
    // {
    //   url: `${siteConfig.url}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ];
}

// {{END MODIFICATIONS}} 
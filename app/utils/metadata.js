// [INTERNAL_ACTION: Fetching current time via mcp.server_time.]
// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-13 09:21:00 +08:00; Reason: Create centralized SEO metadata configuration;
// }}
// {{START MODIFICATIONS}}

/**
 * SEO元数据配置
 * 集中管理所有SEO相关的元数据
 */

export const siteConfig = {
  name: 'SVG Viewer Next',
  title: 'SVG Viewer Next - 在线SVG/HTML编辑器和查看器',
  description: '专业的在线SVG和HTML编辑器，支持实时预览、代码格式化、多种导出格式。为设计师和开发者提供强大的SVG编辑和查看工具。',
  keywords: [
    'SVG编辑器',
    'HTML编辑器', 
    'SVG查看器',
    '在线编辑器',
    'SVG工具',
    'HTML工具',
    '代码编辑器',
    '实时预览',
    'SVG转换',
    '图形编辑',
    'Web开发工具',
    '前端工具'
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://svg-viewer-next.aizhi.site',
  ogImage: '/og-image.png',
  author: {
    name: 'SVG Viewer Next Team',
    url: 'https://github.com/liujuntao123/svg-viewer-next'
  },
  creator: '@svg-viewer-next',
  publisher: 'SVG Viewer Next',
  category: 'Web Development Tools',
  language: 'zh-CN',
  locale: 'zh_CN'
};

export const generateMetadata = () => {
  return {
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [siteConfig.author],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    category: siteConfig.category,
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
          type: 'image/png'
        }
      ]
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      creator: siteConfig.creator,
      images: [siteConfig.ogImage]
    },
    
    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    
    // Verification tags (可根据需要添加)
    verification: {
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // yahoo: 'your-yahoo-verification-code'
    },
    
    // App-specific metadata
    applicationName: siteConfig.name,
    referrer: 'origin-when-cross-origin',
    colorScheme: 'light dark',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
    ],
    
    // Manifest
    manifest: '/manifest.json',
    
    // Icons
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png'
    },
    
    // Additional metadata
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no'
    }
  };
};

// JSON-LD 结构化数据
export const generateJsonLd = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.author.name,
      url: siteConfig.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher
    },
    inLanguage: siteConfig.language,
    isAccessibleForFree: true,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0.0',
    datePublished: '2025-06-13',
    dateModified: '2025-06-13'
  };
};

// {{END MODIFICATIONS}} 
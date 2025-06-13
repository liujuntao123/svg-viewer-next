import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateMetadata, generateJsonLd } from "./utils/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 使用集中管理的SEO元数据
export const metadata = generateMetadata();

export default function RootLayout({ children }) {
  const jsonLd = generateJsonLd();

  return (
    <html lang="zh-CN">
      <head>
        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

'use client';

import ThemeToggle from './ThemeToggle';

/**
 * 顶部标题栏组件
 * 显示应用标题和主题切换
 */
const HeaderBar = ({ theme, onThemeChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      {/* 左侧空白区域，保持布局平衡 */}
      <div className="w-10"></div>
      
      {/* 中间：应用标题 */}
      <h1 className="text-xl font-semibold text-foreground">
        SVG/HTML 在线编辑器
      </h1>
      
      {/* 右侧：主题切换 */}
      <div className="flex items-center gap-2">
        {/* GitHub 链接 */}
        <a
          href="https://github.com/liujuntao123/svg-viewer-next"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-border rounded-md hover:bg-muted transition-colors duration-200"
          title="查看 GitHub 源码"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      <ThemeToggle 
        theme={theme} 
        onThemeChange={onThemeChange}
        className="p-2 border border-border rounded-md hover:bg-muted transition-colors duration-200"
      />
      </div>
    </div>
  );
};

export default HeaderBar; 
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
      <ThemeToggle 
        theme={theme} 
        onThemeChange={onThemeChange}
        className="p-2 border border-border rounded-md hover:bg-muted transition-colors duration-200"
      />
    </div>
  );
};

export default HeaderBar; 
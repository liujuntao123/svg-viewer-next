'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { saveTheme, loadTheme } from '../utils/storageUtils';

/**
 * 主题切换组件
 * 支持明亮/暗黑模式切换，并持久化保存用户偏好
 */
const ThemeToggle = ({ theme, onThemeChange, className = '' }) => {
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载，避免服务端渲染不一致
  useEffect(() => {
    setMounted(true);
  }, []);

  // 主题切换处理
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // 更新状态
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    
    // 保存到localStorage
    saveTheme(newTheme);
    
    // 更新文档类名
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 组件未挂载时显示占位符
  if (!mounted) {
    return (
      <button 
        disabled
        className={`p-2 rounded-md border border-border ${className}`}
      >
        <div className="w-5 h-5 animate-pulse bg-muted rounded"></div>
      </button>
    );
  }

  return (
    <button
      onClick={handleThemeToggle}
      className={`
        p-2 rounded-md border border-border
        bg-card hover:bg-muted
        transition-colors duration-200
        ${className}
      `}
      title={`切换到${theme === 'light' ? '暗黑' : '明亮'}模式`}
      aria-label={`切换到${theme === 'light' ? '暗黑' : '明亮'}模式`}
    >
      {theme === 'dark' ? (
        <Moon size={20} className="text-muted-foreground" />
      ) : (
        <Sun size={20} className="text-muted-foreground" />
      )}
    </button>
  );
};

export default ThemeToggle; 
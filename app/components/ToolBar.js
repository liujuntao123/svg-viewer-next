'use client';

import { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Copy, 
  FileText, 
  Code, 
  Clipboard,
  Check,
  AlertCircle 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { downloadFile, copyToClipboard, generateSVGDataURI } from '../utils/fileUtils';

/**
 * 工具栏组件
 * 提供文件操作、导入导出、主题切换等功能
 */
const ToolBar = ({ 
  code = '', 
  onCodeChange, 
  language = 'html',
  onFormat,
  onThemeChange,
  theme = 'light',
  onClipboardImport
}) => {
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // 显示通知
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 文件导入处理
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      onCodeChange(text);
      
      showNotification(`文件 "${file.name}" 导入成功`);
    } catch (error) {
      console.error('文件导入失败:', error);
      showNotification('文件导入失败', 'error');
    }
    
    // 重置文件输入
    event.target.value = '';
  };

  // 文件下载
  const handleDownload = (format) => {
    try {
      const extension = language === 'xml' ? 'svg' : 'html';
      const filename = `编辑器导出.${extension}`;
      
      if (format === 'file') {
        downloadFile(code, filename);
        showNotification('文件下载成功');
      } else if (format === 'clipboard') {
        copyToClipboard(code);
        showNotification('代码已复制到剪贴板');
      } else if (format === 'datauri') {
        const dataUri = generateSVGDataURI(code);
        copyToClipboard(dataUri);
        showNotification('Data URI 已复制到剪贴板');
      }
    } catch (error) {
      console.error('导出失败:', error);
      showNotification('导出失败', 'error');
    }
  };

  // 剪贴板导入
  const handleClipboardImport = async () => {
    try {
      await onClipboardImport();
      showNotification('剪贴板内容导入成功');
    } catch (error) {
      console.error('剪贴板导入失败:', error);
      showNotification('剪贴板导入失败', 'error');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        {/* 左侧：主要操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 格式化按钮 */}
          <button
            onClick={onFormat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="格式化代码 (Shift+Alt+F)"
          >
            <Code size={16} />
            格式化
          </button>

          <div className="w-px h-6 bg-border"></div>

          {/* 文件导入 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="导入文件"
          >
            <Upload size={16} />
            导入文件
          </button>

          {/* 剪贴板导入 */}
          <button
            onClick={handleClipboardImport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="从剪贴板导入"
          >
            <Clipboard size={16} />
            导入剪贴板
          </button>
        </div>

        {/* 中间：标题 */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            SVG/HTML 在线编辑器
          </h1>
        </div>

        {/* 右侧：导出和主题切换 */}
        <div className="flex items-center gap-2">
          {/* 复制代码 */}
          <button
            onClick={() => handleDownload('clipboard')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="复制代码"
          >
            <Copy size={14} />
            复制
          </button>

          {/* 复制Data URI */}
          <button
            onClick={() => handleDownload('datauri')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="复制为Data URI"
          >
            <FileText size={14} />
            Data URI
          </button>

          <div className="w-px h-6 bg-border"></div>

          {/* 下载文件 */}
          <button
            onClick={() => handleDownload('file')}
            className="p-1.5 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="下载文件"
          >
            <Download size={16} />
          </button>

          {/* 主题切换 */}
          <ThemeToggle 
            theme={theme} 
            onThemeChange={onThemeChange}
            className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors duration-200"
          />
        </div>

        <div className="w-px h-6 bg-border"></div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,.html,.htm"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* 通知提示 */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-right duration-200">
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {notification.message}
          </div>
        </div>
      )}
    </>
  );
};

export default ToolBar; 
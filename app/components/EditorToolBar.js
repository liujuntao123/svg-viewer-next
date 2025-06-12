'use client';

import { useState, useRef } from 'react';
import { Code, Upload, Clipboard, Check, AlertCircle } from 'lucide-react';

/**
 * 编辑器工具栏组件
 * 提供代码格式化、文件导入等编辑相关功能
 */
const EditorToolBar = ({ 
  onFormat, 
  onCodeChange, 
  onClipboardImport,
  language,
  onLanguageChange 
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
    
    event.target.value = '';
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
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/50">
        {/* 格式化按钮 */}
        <button
          onClick={onFormat}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
          title="格式化代码 (Shift+Alt+F)"
        >
          <Code size={16} />
          格式化
        </button>

        <div className="w-px h-5 bg-border"></div>

        {/* 文件导入 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors duration-200"
          title="导入文件"
        >
          <Upload size={16} />
          导入文件
        </button>

        {/* 剪贴板导入 */}
        <button
          onClick={handleClipboardImport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors duration-200"
          title="从剪贴板导入"
        >
          <Clipboard size={16} />
          剪贴板
        </button>

        {/* 语言切换器 */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">语言:</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="text-xs bg-background border border-border rounded px-2 py-1"
          >
            <option value="html">HTML</option>
            <option value="xml">SVG</option>
          </select>
        </div>
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
        <div className="fixed top-16 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-right duration-200">
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

export default EditorToolBar; 
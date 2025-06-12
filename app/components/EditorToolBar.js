'use client';

import { useState, useRef } from 'react';
import { Code, Upload, Clipboard, Check, AlertCircle, Wand2 } from 'lucide-react';
import { smartExtract } from '../utils/fileUtils';

/**
 * 编辑器工具栏组件
 * 提供代码格式化、文件导入等编辑相关功能
 */
const EditorToolBar = ({ 
  onFormat, 
  onCodeChange, 
  onClipboardImport,
  language,
  onLanguageChange,
  currentCode 
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
      const extractedContent = smartExtract(text, language === 'xml');
      onCodeChange(extractedContent);
      showNotification(`文件 "${file.name}" 导入并清理成功`);
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

  // 智能清理当前代码
  const handleSmartClean = async () => {
    try {
      if (!currentCode || !currentCode.trim()) {
        showNotification('没有代码可以清理', 'error');
        return;
      }

      const cleanedCode = smartExtract(currentCode, language === 'xml');
      
      if (cleanedCode !== currentCode) {
        onCodeChange(cleanedCode);
        showNotification('代码清理完成');
      } else {
        showNotification('代码已经很干净了');
      }
    } catch (error) {
      console.error('代码清理失败:', error);
      showNotification('代码清理失败', 'error');
    }
  };

  // 智能粘贴（从剪贴板清理导入）
  const handleSmartPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showNotification('剪贴板为空', 'error');
        return;
      }

      const extractedContent = smartExtract(text, language === 'xml');
      onCodeChange(extractedContent);
      showNotification('智能粘贴完成');
    } catch (error) {
      console.error('智能粘贴失败:', error);
      showNotification('智能粘贴失败', 'error');
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

        {/* 普通剪贴板导入 */}
        <button
          onClick={handleClipboardImport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors duration-200"
          title="从剪贴板导入"
        >
          <Clipboard size={16} />
          粘贴
        </button>

        {/* 智能清理/粘贴功能 */}
        <div className="relative group">
          <button
            onClick={handleSmartPaste}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-primary/50  rounded-md hover:bg-primary/10 transition-colors duration-200"
            title="智能粘贴 - 自动提取和清理剪贴板中的 HTML/SVG 代码"
          >
            <Wand2 size={16} />
            智能粘贴
          </button>
          
          {/* 下拉菜单 */}
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-max">
            <button
              onClick={handleSmartPaste}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-t-md"
              title="从剪贴板智能提取代码"
            >
              <div className="flex items-center gap-2">
                <Clipboard size={14} />
                智能粘贴
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                自动提取剪贴板中的代码
              </div>
            </button>
            <div className="border-t border-border"></div>
            <button
              onClick={handleSmartClean}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-b-md"
              title="清理当前编辑器中的代码"
            >
              <div className="flex items-center gap-2">
                <Wand2 size={14} />
                清理当前代码
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                清理并提取当前代码
              </div>
            </button>
          </div>
        </div>

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
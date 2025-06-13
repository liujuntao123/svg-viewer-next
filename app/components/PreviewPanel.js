'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Square, 
  Palette, 
  RotateCcw, 
  Copy, 
  FileText, 
  Download, 
  Image,
  Check,
  AlertCircle 
} from 'lucide-react';
import { SmartSVGRenderer } from '../utils/svgUtils';
import { 
  downloadFile, 
  copyToClipboard, 
  generateSVGDataURI, 
  exportSVGAsImage 
} from '../utils/fileUtils';

/**
 * 预览面板组件
 * 支持智能SVG缩放、背景切换、实时渲染、导出功能
 */
const PreviewPanel = ({ 
  content = '', 
  language = 'html',
  background = 'grid',
  onBackgroundChange,
  theme = 'light'
}) => {
  // 为了保持一致性，将content重命名为code
  const code = content;
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const prevLanguageRef = useRef(language);

  // 背景选项配置
  const backgroundOptions = [
    { value: 'grid', label: '网格', icon: Grid },
    { value: 'white', label: '白色', icon: Square },
    { value: 'black', label: '黑色', icon: Square },
    { value: 'transparent', label: '透明', icon: Palette }
  ];

  // 显示通知
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 导出处理
  const handleExport = async (format) => {
    try {
      const extension = language === 'xml' ? 'svg' : 'html';
      const filename = `编辑器导出.${extension}`;
      
      if (format === 'file') {
        downloadFile(code, filename);
        showNotification('文件下载成功');
      } else if (format === 'clipboard') {
        await copyToClipboard(code);
        showNotification('代码已复制到剪贴板');
      } else if (format === 'datauri') {
        const dataUri = generateSVGDataURI(code);
        await copyToClipboard(dataUri);
        showNotification('Data URI 已复制到剪贴板');
      }
    } catch (error) {
      console.error('导出失败:', error);
      showNotification('导出失败', 'error');
    }
  };

  // 导出为图片
  const handleExportAsImage = async (scale = 2) => {
    if (language !== 'xml') {
      showNotification('仅支持导出 SVG 为图片', 'error');
      return;
    }

    try {
      await exportSVGAsImage(code, {
        scale,
        backgroundColor: background === 'transparent' ? 'transparent' : 
                        background === 'black' ? 'black' : 
                        background === 'white' ? 'white' : 'white',
        filename: `导出图片_${scale}x.png`
      });
      showNotification(`图片导出成功 (${scale}x)`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('导出图片失败:', error);
      showNotification('导出图片失败', 'error');
    }
  };

  // 智能SVG渲染器初始化
  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      rendererRef.current = new SmartSVGRenderer(containerRef.current);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  // 渲染内容
  const renderContent = useCallback(async () => {
    console.log('Rendering content:', { code: code.substring(0, 50), language, codeLength: code.length });
    
    if (!rendererRef.current || !code.trim()) {
      setError(null);
      if (rendererRef.current) {
        rendererRef.current.updateContent('', language);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      rendererRef.current.updateContent(code, language);
    } catch (err) {
      console.error('渲染失败:', err);
      setError(err.message || '渲染失败');
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  // 语言变化时重置渲染器状态
  useEffect(() => {
    if (prevLanguageRef.current !== language && rendererRef.current) {
      // 语言发生变化，重置渲染器状态
      rendererRef.current.reset();
      prevLanguageRef.current = language;
    }
  }, [language]);

  // 代码变化时重新渲染
  useEffect(() => {
    const timeoutId = setTimeout(renderContent, 300); // 防抖渲染
    return () => clearTimeout(timeoutId);
  }, [renderContent]);

  // 重置视图
  const handleResetView = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.reset();
    }
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  // 获取背景样式类名
  const getBackgroundClass = useCallback(() => {
    switch (background) {
      case 'white':
        return 'bg-white';
      case 'black':
        return 'bg-black';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-preview-bg grid-background';
    }
  }, [background]);

  return (
    <div className="h-full flex flex-col relative">
      {/* 预览控制栏 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
        {/* 左侧：背景切换按钮组 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card border border-border rounded-md p-1 shadow-sm">
            {backgroundOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onBackgroundChange(value)}
                className={`
                  flex items-center gap-1 px-2 py-1.5 text-xs rounded transition-colors duration-200
                  ${background === value 
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                  }
                `}
                title={`背景：${label}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* 重置视图按钮 */}
          <button
            onClick={handleResetView}
            disabled={!code.trim()}
            className="p-1.5 text-xs bg-card border border-border rounded-md hover:bg-muted transition-colors duration-200 shadow-sm"
            title="重置视图"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* 右侧：导出按钮组 */}
        <div className="flex items-center gap-2">
          {/* 复制代码 */}
          <button
            onClick={() => handleExport('clipboard')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors duration-200"
            title="复制代码"
          >
            <Copy size={14} />
            复制
          </button>

          {/* 复制Data URI */}
          <button
            onClick={() => handleExport('datauri')}
            className="flex items-center gap-1 px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors duration-200"
            title="复制为Data URI"
          >
            <FileText size={14} />
            Data URI
          </button>

          <div className="w-px h-5 bg-border"></div>

          {/* 下载文件 */}
          <button
            onClick={() => handleExport('file')}
            className="p-1.5 border border-border rounded-md hover:bg-muted transition-colors duration-200"
            title="下载文件"
          >
            <Download size={16} />
          </button>

          {/* 导出为图片 */}
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors duration-200"
              title="导出为图片"
              disabled={language !== 'xml'}
            >
              <Image size={16} />
              导出为图片
            </button>
            
            {/* 导出图片菜单 */}
            {showExportMenu && language === 'xml' && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleExportAsImage(1)}
                  className="block w-full px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors"
                >
                  导出 1x
                </button>
                <button
                  onClick={() => handleExportAsImage(2)}
                  className="block w-full px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors"
                >
                  导出 2x
                </button>
                <button
                  onClick={() => handleExportAsImage(3)}
                  className="block w-full px-3 py-1.5 text-xs text-left hover:bg-muted transition-colors"
                >
                  导出 3x
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 预览容器 */}
        <div 
          ref={containerRef}
          className={`w-full h-full ${getBackgroundClass()}`}
          style={{ 
            backgroundPosition: '0 0, 0 0',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm">渲染中...</span>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
            <div className="text-center text-destructive">
              <div className="text-sm font-medium mb-2">渲染错误</div>
              <div className="text-xs opacity-75 max-w-xs">{error}</div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!code.trim() && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-muted-foreground">
              <div className="text-lg mb-2">🎨</div>
              <div className="text-sm">在左侧编辑器中输入代码</div>
              <div className="text-xs opacity-75 mt-1">支持 SVG 和 HTML</div>
            </div>
          </div>
        )}

        {/* 交互提示 */}
        {code.trim() && !error && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded backdrop-blur-sm">
            滚轮缩放 · 拖拽移动
          </div>
        )}
      </div>

      {/* 通知提示 */}
      {notification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-top duration-200">
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
    </div>
  );
};

export default PreviewPanel; 
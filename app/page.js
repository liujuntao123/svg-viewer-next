'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import HeaderBar from './components/HeaderBar';
import CodeEditor from './components/CodeEditor';
import EditorToolBar from './components/EditorToolBar';
import PreviewPanel from './components/PreviewPanel';
import { 
  loadCode, 
  loadTheme, 
  loadBackground,
  loadPanelSizes,
  savePanelSizes,
  saveBackground
} from './utils/storageUtils';
import { readFileAsText, smartExtract } from './utils/fileUtils';

export default function Home() {
  // 状态管理
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('light');
  const [background, setBackground] = useState('grid');
  const [panelSizes, setPanelSizes] = useState([50, 50]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragState, setDragState] = useState({ isDragging: false, dragCounter: 0 });
  const [language, setLanguage] = useState('xml');

  // 引用
  const editorRef = useRef(null);
  const dragOverlayRef = useRef(null);

  // 初始化应用状态
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 从localStorage加载保存的状态
        const savedCode = loadCode();
        const savedTheme = loadTheme();
        const savedBackground = loadBackground();
        const savedPanelSizes = loadPanelSizes();

        // 如果没有保存的代码，提供一个简单的SVG示例
        const initialCode = savedCode || `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#4299e1" />
  <rect x="60" y="60" width="80" height="80" fill="#f56565" />
  <text x="100" y="150" text-anchor="middle" fill="white" font-size="20">SVG 示例</text>
</svg>`;

        setCode(initialCode);
        setTheme(savedTheme);
        setBackground(savedBackground);
        setPanelSizes(savedPanelSizes);

        // 应用主题
        const root = document.documentElement;
        if (savedTheme === 'dark') {
          root.setAttribute('data-theme', 'dark');
        } else {
          root.removeAttribute('data-theme');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 代码变化处理
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  // 语言变化处理
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

  // 主题变化处理
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  // 背景变化处理
  const handleBackgroundChange = useCallback((newBackground) => {
    setBackground(newBackground);
    saveBackground(newBackground);
  }, []);

  // 面板大小变化处理
  const handlePanelResize = useCallback((sizes) => {
    setPanelSizes(sizes);
    savePanelSizes(sizes);
  }, []);

  // 格式化代码
  const handleFormat = useCallback(async () => {
    if (editorRef.current && editorRef.current.formatCode) {
      await editorRef.current.formatCode();
    }
  }, []);

  // 剪贴板导入处理
  const handleClipboardImport = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const extractedContent = smartExtract(text);
        setCode(extractedContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error('剪贴板读取失败:', error);
      throw error;
    }
  }, []);

  // 拖拽文件处理
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      isDragging: true,
      dragCounter: prev.dragCounter + 1
    }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        isDragging: newCounter > 0,
        dragCounter: newCounter
      };
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({ isDragging: false, dragCounter: 0 });
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'image/svg+xml' || 
      file.type === 'text/html' ||
      file.name.endsWith('.svg') ||
      file.name.endsWith('.html') ||
      file.name.endsWith('.htm')
    );

    if (validFile) {
      try {
        const content = await readFileAsText(validFile);
        const extractedContent = smartExtract(content);
        setCode(extractedContent);
        
        // 根据文件类型自动设置语言
        const extension = validFile.name.toLowerCase().split('.').pop();
        if (extension === 'svg') {
          setLanguage('xml');
        } else if (extension === 'html' || extension === 'htm') {
          setLanguage('html');
        }
      } catch (error) {
        console.error('Failed to read dropped file:', error);
      }
    }
  }, []);

  // 全局拖拽事件绑定
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // 阻止浏览器默认的拖拽行为
    document.addEventListener('dragenter', preventDefault);
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('dragleave', preventDefault);
    document.addEventListener('drop', preventDefault);

    return () => {
      document.removeEventListener('dragenter', preventDefault);
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('dragleave', preventDefault);
      document.removeEventListener('drop', preventDefault);
    };
  }, []);

  // 加载状态显示
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>正在加载编辑器..</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen flex flex-col bg-background transition-theme overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 顶部标题栏 */}
      <HeaderBar
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* 主编辑区 */}
      <div className="flex-1 relative">
        <PanelGroup 
          direction="horizontal"
          onLayout={handlePanelResize}
        >
          {/* 代码编辑面板 */}
          <Panel 
            defaultSize={panelSizes[0]} 
            minSize={20}
            className="relative"
          >
            <div className="h-full border-r border-border flex flex-col">
              <EditorToolBar
                onFormat={handleFormat}
                onCodeChange={handleCodeChange}
                onClipboardImport={handleClipboardImport}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
              <div className="flex-1">
                <CodeEditor
                  ref={editorRef}
                  value={code}
                  onChange={handleCodeChange}
                  theme={theme}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </Panel>

          {/* 可调整分割线 */}
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors duration-200 cursor-col-resize" />

          {/* 预览面板 */}
          <Panel 
            defaultSize={panelSizes[1]} 
            minSize={20}
          >
            <PreviewPanel
              content={code}
              background={background}
              onBackgroundChange={handleBackgroundChange}
              language={language}
              theme={theme}
            />
          </Panel>
        </PanelGroup>

        {/* 拖拽覆盖层 */}
        {dragState.isDragging && (
          <div 
            ref={dragOverlayRef}
            className="absolute inset-0 z-50 drag-overlay flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📁</div>
              <div className="text-lg font-medium text-primary">
                释放文件以导入
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                支持 .svg, .html 文件
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 响应式提示 - 仅在小屏幕显示 */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground shadow-lg">
        <div className="font-medium mb-1">移动端提示</div>
        <div>建议在桌面端使用以获得最佳编辑体验</div>
      </div>
    </div>
  );
}

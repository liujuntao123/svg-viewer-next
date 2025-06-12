'use client';

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@monaco-editor/react';
import { saveCode } from '../utils/storageUtils';

/**
 * 代码编辑器组件
 * 基于Monaco Editor，支持语法高亮、自动保存、代码格式化
 */
const CodeEditor = forwardRef(({ 
  value = '', 
  onChange, 
  language = 'html',
  onLanguageChange,
  theme = 'light' 
}, ref) => {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    formatCode: async () => {
      if (editorRef.current) {
        await editorRef.current.getAction('editor.action.formatDocument').run();
      }
    },
    insertText: (text) => {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        editorRef.current.executeEdits('insert-text', [{
          range: selection,
          text: text
        }]);
      }
    },
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  }));

  // Monaco编辑器配置
  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    cursorStyle: 'line',
    automaticLayout: true,
    wordWrap: 'on',
    wrappingIndent: 'indent',
    renderWhitespace: 'selection',
    contextmenu: true,
    mouseWheelZoom: true,
    smoothScrolling: true,
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: true,
    renderLineHighlight: 'line',
    selectOnLineNumbers: true,
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoSurround: 'quotes',
    dragAndDrop: true,
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: 'currentDocument'
  };

  // 防抖保存
  const debouncedSave = useCallback((code) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(code);
      setIsSaving(false);
    }, 1000);
  }, []);

  // 编辑器值变化处理
  const handleEditorChange = useCallback((newValue) => {
    if (onChange) {
      onChange(newValue || '');
    }
    debouncedSave(newValue || '');
  }, [onChange, debouncedSave]);

  // 编辑器挂载完成
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // 注册快捷键
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument').run();
      }
    });

    // 注册保存快捷键
    editor.addAction({
      id: 'save-document',
      label: 'Save Document',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const value = editor.getValue();
        saveCode(value);
        // 显示保存提示
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 500);
      }
    });

    // 设置初始焦点
    editor.focus();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 获取Monaco主题名称
  const getMonacoTheme = () => {
    return theme === 'dark' ? 'vs-dark' : 'vs';
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* 编辑器主体 */}
      <div className="flex-1">
        <Editor
          value={value}
          language={language}
          theme={getMonacoTheme()}
          options={editorOptions}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full bg-background">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span>编辑器加载中...</span>
              </div>
            </div>
          }
        />
      </div>

      {/* 自动保存指示器 */}
      {isSaving && (
        <div className="absolute top-12 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-75">
          自动保存中...
        </div>
      )}

      {/* 快捷键提示 */}
      {!isLoading && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-50">
          Shift+Alt+F 格式化 • Ctrl+S 保存
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor; 
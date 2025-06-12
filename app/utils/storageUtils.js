/**
 * 本地存储工具函数
 * 用于管理代码编辑器的会话持久化
 */

const STORAGE_KEYS = {
  CODE: 'svg-viewer-code',
  THEME: 'svg-viewer-theme',
  PANEL_SIZES: 'svg-viewer-panel-sizes',
  LANGUAGE: 'svg-viewer-language',
  BACKGROUND: 'svg-viewer-background'
};

/**
 * 保存代码内容
 * @param {string} code - 代码内容
 */
export const saveCode = (code) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CODE, code);
  } catch (error) {
    console.warn('Failed to save code to localStorage:', error);
  }
};

/**
 * 获取保存的代码内容
 * @returns {string} 代码内容，如果没有则返回默认SVG
 */
export const loadCode = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CODE);
    return saved || getDefaultSVG();
  } catch (error) {
    console.warn('Failed to load code from localStorage:', error);
    return getDefaultSVG();
  }
};

/**
 * 保存主题设置
 * @param {string} theme - 主题名称 ('light' | 'dark')
 */
export const saveTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

/**
 * 获取保存的主题设置
 * @returns {string} 主题名称，默认为 'light'
 */
export const loadTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
    return 'light';
  }
};

/**
 * 保存面板大小设置
 * @param {number[]} sizes - 面板大小数组
 */
export const savePanelSizes = (sizes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PANEL_SIZES, JSON.stringify(sizes));
  } catch (error) {
    console.warn('Failed to save panel sizes to localStorage:', error);
  }
};

/**
 * 获取保存的面板大小设置
 * @returns {number[]} 面板大小数组，默认为 [50, 50]
 */
export const loadPanelSizes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PANEL_SIZES);
    return saved ? JSON.parse(saved) : [50, 50];
  } catch (error) {
    console.warn('Failed to load panel sizes from localStorage:', error);
    return [50, 50];
  }
};

/**
 * 保存语言设置
 * @param {string} language - 编程语言 ('html' | 'svg')
 */
export const saveLanguage = (language) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
};

/**
 * 获取保存的语言设置
 * @returns {string} 语言设置，默认为 'html'
 */
export const loadLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'html';
  } catch (error) {
    console.warn('Failed to load language from localStorage:', error);
    return 'html';
  }
};

/**
 * 保存预览背景设置
 * @param {string} background - 背景类型 ('grid' | 'white' | 'black')
 */
export const saveBackground = (background) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKGROUND, background);
  } catch (error) {
    console.warn('Failed to save background to localStorage:', error);
  }
};

/**
 * 获取保存的背景设置
 * @returns {string} 背景类型，默认为 'grid'
 */
export const loadBackground = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.BACKGROUND) || 'grid';
  } catch (error) {
    console.warn('Failed to load background from localStorage:', error);
    return 'grid';
  }
};

/**
 * 清除所有保存的数据
 */
export const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

/**
 * 获取默认SVG代码
 * @returns {string} 默认SVG代码
 */
const getDefaultSVG = () => {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b"/>
      <stop offset="100%" style="stop-color:#4ecdc4"/>
    </linearGradient>
  </defs>
  
  <circle cx="100" cy="100" r="80" fill="url(#gradient)" opacity="0.8">
    <animateTransform 
      attributeName="transform" 
      attributeType="XML" 
      type="rotate" 
      from="0 100 100" 
      to="360 100 100" 
      dur="4s" 
      repeatCount="indefinite"/>
  </circle>
  
  <text x="100" y="105" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
    SVG Editor
  </text>
</svg>`;
}; 
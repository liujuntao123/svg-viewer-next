// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-12 15:43:28 +08:00; Reason: Implement file import/export utilities with smart content extraction;
// }}
// {{START MODIFICATIONS}}

/**
 * 文件处理工具函数
 * 用于文件导入导出和智能内容提取
 */

/**
 * 读取文件内容
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * 智能提取SVG内容
 * @param {string} htmlContent - HTML内容
 * @returns {string} 提取的SVG内容或原内容
 */
export const extractSVGContent = (htmlContent) => {
  // 移除注释
  const cleaned = htmlContent.replace(/<!--[\s\S]*?-->/g, '');
  
  // 尝试提取SVG标签
  const svgMatch = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  }
  
  // 如果内容已经是SVG，直接返回
  if (cleaned.trim().startsWith('<svg')) {
    return cleaned;
  }
  
  // 否则返回原内容
  return htmlContent;
};

/**
 * 智能提取HTML body内容
 * @param {string} htmlContent - HTML内容
 * @returns {string} 提取的body内容或原内容
 */
export const extractBodyContent = (htmlContent) => {
  // 移除注释
  const cleaned = htmlContent.replace(/<!--[\s\S]*?-->/g, '');
  
  // 尝试提取body标签内容
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  
  // 如果没有body标签，查找是否有HTML结构
  const htmlMatch = cleaned.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
  if (htmlMatch) {
    // 移除head标签
    const withoutHead = htmlMatch[1].replace(/<head[\s\S]*?<\/head>/i, '');
    return withoutHead.trim();
  }
  
  // 否则返回原内容
  return htmlContent;
};

/**
 * 智能内容提取
 * @param {string} content - 原始内容
 * @param {boolean} preferSVG - 是否优先提取SVG
 * @returns {string} 提取的内容
 */
export const smartExtract = (content, preferSVG = true) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const trimmed = content.trim();
  
  // 如果内容已经是纯SVG或HTML，直接返回
  if (trimmed.startsWith('<svg') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return preferSVG ? extractSVGContent(trimmed) : extractBodyContent(trimmed);
  }
  
  // 检查是否包含SVG
  if (trimmed.includes('<svg')) {
    return extractSVGContent(trimmed);
  }
  
  // 检查是否包含body
  if (trimmed.includes('<body')) {
    return extractBodyContent(trimmed);
  }
  
  return content;
};

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME类型
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 复制内容到剪贴板
 * @param {string} content - 要复制的内容
 * @returns {Promise<boolean>} 是否成功复制
 */
export const copyToClipboard = async (content) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * 生成SVG的Data URI
 * @param {string} svgContent - SVG内容
 * @returns {string} Data URI
 */
export const generateSVGDataURI = (svgContent) => {
  // 确保SVG内容格式正确
  const cleanSVG = svgContent.trim();
  
  // 编码SVG内容
  const encoded = encodeURIComponent(cleanSVG)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  
  return `data:image/svg+xml,${encoded}`;
};

/**
 * 检测文件类型
 * @param {string} content - 文件内容
 * @returns {string} 文件类型 ('svg' | 'html' | 'unknown')
 */
export const detectFileType = (content) => {
  if (!content || typeof content !== 'string') {
    return 'unknown';
  }
  
  const trimmed = content.trim().toLowerCase();
  
  if (trimmed.startsWith('<svg') || trimmed.includes('<svg')) {
    return 'svg';
  }
  
  if (trimmed.startsWith('<!doctype html') || 
      trimmed.startsWith('<html') || 
      trimmed.includes('<body') ||
      trimmed.includes('<head')) {
    return 'html';
  }
  
  return 'unknown';
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 验证SVG内容
 * @param {string} svgContent - SVG内容
 * @returns {boolean} 是否为有效的SVG
 */
export const isValidSVG = (svgContent) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    return !parserError && doc.documentElement.tagName.toLowerCase() === 'svg';
  } catch (error) {
    return false;
  }
};

/**
 * 将SVG转换为图片并下载
 * @param {string} svgContent - SVG内容
 * @param {Object} options - 导出选项
 * @param {number} options.scale - 缩放倍数 (1, 2, 3等)
 * @param {string} options.backgroundColor - 背景颜色 ('transparent', 'white', 'black', 'current')
 * @param {string} options.filename - 文件名
 * @returns {Promise<void>}
 */
export const exportSVGAsImage = async (svgContent, options = {}) => {
  const {
    scale = 2,
    backgroundColor = 'white',
    filename = 'export.png'
  } = options;

  try {
    // 解析SVG获取尺寸
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    
    // 获取SVG的原始尺寸
    let width = parseInt(svgElement.getAttribute('width')) || 300;
    let height = parseInt(svgElement.getAttribute('height')) || 300;
    
    // 如果没有明确的宽高，尝试从viewBox获取
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox && (!svgElement.getAttribute('width') || !svgElement.getAttribute('height'))) {
      const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
      width = vbWidth || width;
      height = vbHeight || height;
    }
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    // 设置背景
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor === 'current' ? '#f5f5f5' : backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 创建图片对象
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 绘制图片到Canvas
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为PNG并下载
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(downloadUrl);
            resolve();
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };
      
      img.src = url;
    });
  } catch (error) {
    console.error('Export to image failed:', error);
    throw error;
  }
};

/**
 * 将HTML内容转换为图片（需要额外的库支持）
 * @param {HTMLElement} element - 要转换的DOM元素
 * @param {Object} options - 导出选项
 * @returns {Promise<void>}
 */
export const exportHTMLAsImage = async (element, options = {}) => {
  // 这个功能需要使用 html2canvas 或类似的库
  // 暂时返回一个提示
  throw new Error('HTML to image export requires additional libraries. Please use SVG format for image export.');
};

// {{END MODIFICATIONS}} 
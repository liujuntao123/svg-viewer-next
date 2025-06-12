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
  
  // 尝试提取SVG标签（支持嵌套和多个SVG）
  const svgMatches = cleaned.match(/<svg[\s\S]*?<\/svg>/gi);
  if (svgMatches && svgMatches.length > 0) {
    // 如果有多个SVG，返回第一个完整的
    return svgMatches[0];
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
 * 从代码块中提取内容
 * @param {string} content - 包含代码块的内容
 * @returns {string|null} 提取的代码或null
 */
export const extractFromCodeBlocks = (content) => {
  // 匹配各种代码块格式
  const codeBlockPatterns = [
    // Markdown 代码块
    /```(?:html|xml|svg)?\s*\n?([\s\S]*?)\n?```/gi,
    // 单行代码块
    /`([^`]*(?:<svg|<html)[^`]*)`/gi,
    // HTML 转义的代码块
    /&lt;svg[\s\S]*?&lt;\/svg&gt;/gi,
  ];

  for (const pattern of codeBlockPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      let extracted = matches[0];
      
      // 清理 markdown 标记
      extracted = extracted.replace(/```(?:html|xml|svg)?\s*\n?/gi, '');
      extracted = extracted.replace(/\n?```$/gi, '');
      extracted = extracted.replace(/^`|`$/g, '');
      
      // 解码 HTML 实体
      extracted = extracted.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      
      // 检查是否是有效的 SVG 或 HTML
      if (extracted.includes('<svg') || extracted.includes('<html') || extracted.includes('<!DOCTYPE')) {
        return extracted.trim();
      }
    }
  }
  
  return null;
};

/**
 * 清理和格式化内容
 * @param {string} content - 原始内容
 * @returns {string} 清理后的内容
 */
export const cleanContent = (content) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  let cleaned = content;
  
  // 移除常见的无关前缀/后缀
  cleaned = cleaned.replace(/^[\s\S]*?(?=<(?:svg|html|!DOCTYPE))/i, '');
  cleaned = cleaned.replace(/(?:<\/(?:svg|html)>)[\s\S]*$/i, (match) => {
    return match.substring(0, match.indexOf('>') + 1);
  });
  
  // 移除多余的空白字符，但保留必要的格式
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // 多个连续空行 -> 两个空行
  cleaned = cleaned.replace(/^\s+|\s+$/g, ''); // 移除首尾空白
  
  // 解码常见的 HTML 实体
  const htmlEntities = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  };
  
  for (const [entity, char] of Object.entries(htmlEntities)) {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
  }
  
  return cleaned;
};

/**
 * 使用 DOM 解析验证和提取内容
 * @param {string} content - 要解析的内容
 * @returns {string|null} 提取的有效内容或null
 */
export const extractWithDOMParser = (content) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // 检查解析错误
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return null;
    }
    
    // 尝试提取 SVG
    const svgElements = doc.querySelectorAll('svg');
    if (svgElements.length > 0) {
      return svgElements[0].outerHTML;
    }
    
    // 尝试提取 body 内容
    const body = doc.body;
    if (body && body.children.length > 0) {
      return body.innerHTML.trim();
    }
    
    return null;
  } catch (error) {
    console.warn('DOM parsing failed:', error);
    return null;
  }
};

/**
 * 智能内容提取（增强版）
 * @param {string} content - 原始内容
 * @param {boolean} preferSVG - 是否优先提取SVG
 * @returns {string} 提取的内容
 */
export const smartExtract = (content, preferSVG = true) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const trimmed = content.trim();
  
  // 如果内容已经是纯SVG或HTML，先清理再返回
  if (trimmed.startsWith('<svg') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    const cleaned = cleanContent(trimmed);
    return preferSVG ? extractSVGContent(cleaned) : extractBodyContent(cleaned);
  }
  
  // 1. 尝试从代码块中提取
  const fromCodeBlocks = extractFromCodeBlocks(content);
  if (fromCodeBlocks) {
    const cleaned = cleanContent(fromCodeBlocks);
    return preferSVG ? extractSVGContent(cleaned) : extractBodyContent(cleaned);
  }
  
  // 2. 尝试使用 DOM 解析器
  const fromDOM = extractWithDOMParser(content);
  if (fromDOM) {
    return fromDOM;
  }
  
  // 3. 使用正则表达式进行模式匹配
  let extracted = null;
  
  if (preferSVG) {
    // 尝试提取 SVG
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/gi);
    if (svgMatch && svgMatch.length > 0) {
      extracted = svgMatch[0];
    }
  }
  
  if (!extracted) {
    // 尝试提取 HTML 文档
    const htmlMatch = content.match(/<!DOCTYPE[\s\S]*?<\/html>/gi) || 
                     content.match(/<html[\s\S]*?<\/html>/gi);
    if (htmlMatch && htmlMatch.length > 0) {
      extracted = htmlMatch[0];
    }
  }
  
  if (!extracted) {
    // 尝试提取 body 内容
    const bodyMatch = content.match(/<body[^>]*>[\s\S]*?<\/body>/gi);
    if (bodyMatch && bodyMatch.length > 0) {
      extracted = bodyMatch[0];
    }
  }
  
  // 4. 如果找到了内容，清理并返回
  if (extracted) {
    const cleaned = cleanContent(extracted);
    return preferSVG ? extractSVGContent(cleaned) : extractBodyContent(cleaned);
  }
  
  // 5. 最后的尝试：查找任何 XML/HTML 标签
  const tagMatch = content.match(/<[^>]+>[\s\S]*?<\/[^>]+>/);
  if (tagMatch) {
    return cleanContent(tagMatch[0]);
  }
  
  // 如果都没有找到，返回清理后的原内容
  return cleanContent(content);
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
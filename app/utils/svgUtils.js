/**
 * SVG处理工具函数
 * 包含智能SVG缩放方案和Canvas转换功能
 */

/**
 * 将SVG转换为Canvas
 * @param {string} svgContent - SVG内容
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {Object} options - 选项
 * @returns {Promise<void>}
 */
export const svgToCanvas = (svgContent, canvas, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      width = canvas.width,
      height = canvas.height,
      scale = 1,
      offsetX = 0,
      offsetY = 0
    } = options;

    // 检查SVG内容
    if (!svgContent || !svgContent.trim().startsWith('<svg')) {
      console.warn('Invalid SVG content for canvas conversion');
      reject(new Error('Invalid SVG content'));
      return;
    }

    // 确保SVG有宽高
    let processedSvg = svgContent;
    if (!processedSvg.includes('width=') && !processedSvg.includes('height=')) {
      processedSvg = processedSvg.replace('<svg', '<svg width="100%" height="100%"');
    }

    // 创建SVG Blob URL
    const svgBlob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      try {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 保存当前状态
        ctx.save();
        
        // 应用变换
        ctx.scale(scale, scale);
        ctx.translate(offsetX, offsetY);
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, width, height);
        
        // 恢复状态
        ctx.restore();
        
        // 清理URL
        URL.revokeObjectURL(url);
        resolve();
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    img.onerror = (e) => {
      console.error('Failed to load SVG image:', e);
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = url;
  });
};

/**
 * 智能SVG渲染管理器
 */
export class SmartSVGRenderer {
  constructor(container) {
    this.container = container;
    this.svgContainer = null;
    this.canvasContainer = null;
    this.currentMode = 'svg'; // 'svg' | 'canvas'
    this.svgContent = '';
    this.isInteracting = false;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.language = 'html'; // 默认语言
    
    this.init();
  }

  init() {
    // 创建SVG容器
    this.svgContainer = document.createElement('div');
    this.svgContainer.className = 'svg-container w-full h-full overflow-hidden';
    this.svgContainer.style.transformOrigin = 'center center';
    this.svgContainer.style.position = 'relative'; // 确保定位正确
    this.svgContainer.style.width = '100%';
    this.svgContainer.style.height = '100%';
    this.svgContainer.style.display = 'flex'; // 使用flex布局
    this.svgContainer.style.justifyContent = 'center'; // 水平居中
    this.svgContainer.style.alignItems = 'center'; // 垂直居中
    
    // 创建Canvas容器
    this.canvasContainer = document.createElement('canvas');
    this.canvasContainer.className = 'canvas-container w-full h-full';
    this.canvasContainer.style.display = 'none';
    
    // 添加到容器
    this.container.appendChild(this.svgContainer);
    this.container.appendChild(this.canvasContainer);
    
    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // 鼠标按下事件
    const onMouseDown = (e) => {
      isMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      this.startInteraction();
      e.preventDefault();
    };

    // 鼠标移动事件
    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      this.translate(deltaX, deltaY);
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    // 鼠标松开事件
    const onMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        this.endInteraction();
      }
    };

    // 滚轮缩放事件
    const onWheel = (e) => {
      e.preventDefault();
      
      this.startInteraction();
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom(delta, e.clientX, e.clientY);
      
      // 延迟结束交互模式
      clearTimeout(this.wheelTimeout);
      this.wheelTimeout = setTimeout(() => {
        this.endInteraction();
      }, 150);
    };

    // 绑定事件
    this.container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    this.container.addEventListener('wheel', onWheel);
    
    // 保存事件处理器以便清理
    this.eventHandlers = {
      onMouseDown,
      onMouseMove, 
      onMouseUp,
      onWheel
    };
  }

  startInteraction() {
    if (this.isInteracting) return;
    
    this.isInteracting = true;
    
    // 修复：仅在HTML模式下切换到Canvas
    if (this.currentMode === 'svg' && this.svgContent && this.language !== 'xml') {
      this.switchToCanvas();
    }
  }

  endInteraction() {
    if (!this.isInteracting) return;
    
    this.isInteracting = false;
    
    // 修复：仅在HTML模式下从Canvas切回SVG
    if (this.currentMode === 'canvas' && this.language !== 'xml') {
      this.switchToSVG();
    }
  }

  async switchToCanvas() {
    if (this.currentMode === 'canvas' || !this.svgContent) return;
    
    try {
      // 设置Canvas大小
      const rect = this.container.getBoundingClientRect();
      this.canvasContainer.width = rect.width;
      this.canvasContainer.height = rect.height;
      
      // 转换SVG到Canvas
      await svgToCanvas(this.svgContent, this.canvasContainer, {
        scale: this.scale,
        offsetX: this.translateX,
        offsetY: this.translateY
      });
      
      // 切换显示
      this.svgContainer.style.display = 'none';
      this.canvasContainer.style.display = 'block';
      this.currentMode = 'canvas';
    } catch (error) {
      console.warn('Failed to switch to canvas mode:', error);
    }
  }

  switchToSVG() {
    if (this.currentMode === 'svg') return;
    
    // 应用变换到SVG容器
    this.applyTransform();
    
    // 切换显示
    this.canvasContainer.style.display = 'none';
    this.svgContainer.style.display = 'flex'; // 使用flex而不是block
    this.currentMode = 'svg';
  }

  applyTransform() {
    // 获取SVG元素
    const svgElement = this.svgContainer.querySelector('svg');
    
    // 修复：对SVG和HTML内容使用不同的变换应用方式
    if (this.language === 'xml' && svgElement) {
      // SVG模式：直接对SVG元素应用变换
      svgElement.style.transform = `scale(${this.scale})`;
      
      // 获取SVG的包装器div
      const wrapperDiv = svgElement.parentElement;
      if (wrapperDiv) {
        wrapperDiv.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
      }
    } else {
      // HTML模式：对容器应用变换
      if (this.currentMode === 'svg' && this.svgContainer) {
        const wrapperDiv = this.svgContainer.querySelector('div');
        if (wrapperDiv) {
          wrapperDiv.style.transform = 
            `scale(${this.scale}) translate(${this.translateX / this.scale}px, ${this.translateY / this.scale}px)`;
        } else {
          this.svgContainer.style.transform = 
            `scale(${this.scale}) translate(${this.translateX / this.scale}px, ${this.translateY / this.scale}px)`;
        }
      } else if (this.currentMode === 'canvas') {
        this.switchToCanvas();
      }
    }
  }

  updateContent(svgContent, language = 'html') {
    console.log('SVGRenderer.updateContent:', { 
      contentLength: svgContent?.length || 0,
      language,
      isSVG: svgContent?.trim().startsWith('<svg') || language === 'xml',
      hasSVGTag: svgContent?.includes('<svg')
    });
    
    this.svgContent = svgContent;
    this.language = language; // 保存当前语言
    
    // 检查内容是否为SVG
    const isSVG = svgContent.trim().startsWith('<svg') || language === 'xml';
    
    // 清空容器
    this.svgContainer.innerHTML = '';
    
    // 如果是SVG内容，直接渲染
    if (isSVG) {
      // 更新SVG容器内容
      console.log('Rendering as SVG');
      
      // 确保SVG具有正确的尺寸属性
      let processedSvg = svgContent;
      if (!processedSvg.includes('width=') && !processedSvg.includes('height=')) {
        // 如果没有宽高属性，添加宽高100%以填充容器
        processedSvg = processedSvg.replace('<svg', '<svg width="100%" height="100%"');
      }
      
      // 创建一个包装器div
      const wrapperDiv = document.createElement('div');
      wrapperDiv.style.width = '100%';
      wrapperDiv.style.height = '100%';
      wrapperDiv.style.display = 'flex';
      wrapperDiv.style.justifyContent = 'center';
      wrapperDiv.style.alignItems = 'center';
      wrapperDiv.style.overflow = 'hidden';
      
      // 设置SVG内容
      wrapperDiv.innerHTML = processedSvg;
      this.svgContainer.appendChild(wrapperDiv);
      
      // 确保所有SVG元素都可见
      const svgElements = this.svgContainer.querySelectorAll('svg');
      svgElements.forEach(svg => {
        svg.style.maxWidth = '100%';
        svg.style.maxHeight = '100%';
        svg.style.display = 'block';
        svg.style.margin = 'auto';
      });
      
      // 重置变换
      this.reset();
    } else {
      // 如果是HTML内容，尝试提取SVG或创建包装器
      const svgMatch = svgContent.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        console.log('Extracted SVG from HTML');
        let extractedSvg = svgMatch[0];
        
        // 确保SVG具有正确的尺寸属性
        if (!extractedSvg.includes('width=') && !extractedSvg.includes('height=')) {
          extractedSvg = extractedSvg.replace('<svg', '<svg width="100%" height="100%"');
        }
        
        // 创建一个包装器div
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.width = '100%';
        wrapperDiv.style.height = '100%';
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.justifyContent = 'center';
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.overflow = 'hidden';
        
        // 设置SVG内容
        wrapperDiv.innerHTML = extractedSvg;
        this.svgContainer.appendChild(wrapperDiv);
        
        // 确保所有SVG元素都可见
        const svgElements = this.svgContainer.querySelectorAll('svg');
        svgElements.forEach(svg => {
          svg.style.maxWidth = '100%';
          svg.style.maxHeight = '100%';
          svg.style.display = 'block';
          svg.style.margin = 'auto';
        });
        
        // 重置变换
        this.reset();
      } else {
        // 如果没有SVG标签，创建一个包装器显示HTML内容
        console.log('Rendering as HTML');
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.width = '100%';
        wrapperDiv.style.height = '100%';
        wrapperDiv.style.overflow = 'auto';
        wrapperDiv.style.padding = '20px';
        wrapperDiv.innerHTML = svgContent;
        this.svgContainer.appendChild(wrapperDiv);
        
        // 重置变换
        this.reset();
      }
    }
    
    // 如果当前是Canvas模式且正在交互，更新Canvas
    if (this.currentMode === 'canvas' && this.isInteracting) {
      this.switchToCanvas();
    }
  }

  zoom(factor, centerX = 0, centerY = 0) {
    const newScale = Math.max(0.1, Math.min(10, this.scale * factor));
    
    if (newScale !== this.scale) {
      // 计算缩放中心点
      const rect = this.container.getBoundingClientRect();
      const relativeX = centerX - rect.left;
      const relativeY = centerY - rect.top;
      
      // 调整平移以保持缩放中心点不变
      this.translateX = relativeX - (relativeX - this.translateX) * (newScale / this.scale);
      this.translateY = relativeY - (relativeY - this.translateY) * (newScale / this.scale);
      
      this.scale = newScale;
      this.applyTransform();
    }
  }

  translate(deltaX, deltaY) {
    this.translateX += deltaX / this.scale;
    this.translateY += deltaY / this.scale;
    this.applyTransform();
  }

  reset() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  dispose() {
    // 清理事件监听器
    if (this.eventHandlers) {
      this.container.removeEventListener('mousedown', this.eventHandlers.onMouseDown);
      document.removeEventListener('mousemove', this.eventHandlers.onMouseMove);
      document.removeEventListener('mouseup', this.eventHandlers.onMouseUp);
      this.container.removeEventListener('wheel', this.eventHandlers.onWheel);
    }
    
    // 清理定时器
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }
    
    // 清理DOM
    if (this.svgContainer) {
      this.svgContainer.remove();
    }
    if (this.canvasContainer) {
      this.canvasContainer.remove();
    }
  }
}

/**
 * 优化SVG内容（移除不必要的空白和注释）
 * @param {string} svgContent - SVG内容
 * @returns {string} 优化后的SVG内容
 */
export const optimizeSVG = (svgContent) => {
  return svgContent
    .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
    .replace(/\s+/g, ' ') // 压缩空白
    .replace(/>\s+</g, '><') // 移除标签间空白
    .trim();
};

/**
 * 获取SVG的实际尺寸
 * @param {string} svgContent - SVG内容
 * @returns {Object} 包含width和height的对象
 */
export const getSVGDimensions = (svgContent) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.documentElement;
    
    if (svg.tagName.toLowerCase() !== 'svg') {
      throw new Error('Invalid SVG content');
    }
    
    // 尝试从属性获取尺寸
    const width = svg.getAttribute('width');
    const height = svg.getAttribute('height');
    
    if (width && height) {
      return {
        width: parseFloat(width),
        height: parseFloat(height)
      };
    }
    
    // 尝试从viewBox获取尺寸
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const values = viewBox.split(/\s+|,/);
      if (values.length >= 4) {
        return {
          width: parseFloat(values[2]),
          height: parseFloat(values[3])
        };
      }
    }
    
    // 默认尺寸
    return { width: 100, height: 100 };
  } catch (error) {
    console.warn('Failed to get SVG dimensions:', error);
    return { width: 100, height: 100 };
  }
}; 
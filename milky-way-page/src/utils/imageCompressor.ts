export interface ImageCompressionOptions {
  maxSize?: number;      // 最大文件大小（字节），默认 1MB
  quality?: number;      // 压缩质量 0-1，默认 0.8
  maxWidth?: number;     // 最大宽度，默认 1920
  maxHeight?: number;    // 最大高度，默认 1920
  mimeType?: string;     // 输出格式，默认 image/jpeg
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * 图片压缩工具类
 */
export class ImageCompressor {
  private static readonly DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
    maxSize: 1024 * 1024, // 1MB
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    mimeType: 'image/jpeg'
  };

  /**
   * 压缩图片文件
   * @param file 原始图片文件
   * @param options 压缩选项
   * @returns 压缩后的文件信息
   */
  static async compressImage(
    file: File, 
    options: ImageCompressionOptions = {}
  ): Promise<CompressionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('文件必须是图片格式');
    }

    const originalSize = file.size;
    
    // 如果文件大小已经符合要求，直接返回
    if (originalSize <= opts.maxSize) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }

    try {
      // 创建图片元素
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }

      // 加载图片
      const loadImage = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = URL.createObjectURL(file);
        });
      };

      await loadImage();

      // 计算压缩后的尺寸
      const { width, height } = this.calculateDimensions(
        img.width, 
        img.height, 
        opts.maxWidth, 
        opts.maxHeight
      );

      // 设置 canvas 尺寸
      canvas.width = width;
      canvas.height = height;

      // 绘制并压缩图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 释放对象URL
      URL.revokeObjectURL(img.src);

      // 尝试不同的压缩质量直到达到目标大小
      let quality = opts.quality;
      let compressedFile: File;
      
      do {
        const blob = await this.canvasToBlob(canvas, opts.mimeType, quality);
        compressedFile = new File([blob], file.name, {
          type: opts.mimeType,
          lastModified: Date.now()
        });
        
        // 如果文件大小符合要求，跳出循环
        if (compressedFile.size <= opts.maxSize) {
          break;
        }
        
        // 降低质量继续压缩
        quality -= 0.1;
        
      } while (quality > 0.1);

      // 如果质量降到最低仍然超过限制，尝试进一步降低分辨率
      if (compressedFile.size > opts.maxSize && quality <= 0.1) {
        compressedFile = await this.furtherCompress(canvas, opts, file.name);
      }

      return {
        file: compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        compressionRatio: compressedFile.size / originalSize
      };

    } catch (error) {
      throw new Error(`图片压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 计算压缩后的尺寸
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // 按比例缩放
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Canvas 转 Blob
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas 转换失败'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * 进一步压缩（降低分辨率）
   */
  private static async furtherCompress(
    canvas: HTMLCanvasElement,
    opts: Required<ImageCompressionOptions>,
    fileName: string
  ): Promise<File> {
    // 逐步降低分辨率
    let scale = 0.8;
    while (scale > 0.3) {
      const newWidth = Math.round(canvas.width * scale);
      const newHeight = Math.round(canvas.height * scale);
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newWidth;
      newCanvas.height = newHeight;
      
      const newCtx = newCanvas.getContext('2d')!;
      newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
      
      const blob = await this.canvasToBlob(newCanvas, opts.mimeType, 0.6);
      
      if (blob.size <= opts.maxSize) {
        return new File([blob], fileName, {
          type: opts.mimeType,
          lastModified: Date.now()
        });
      }
      
      scale -= 0.1;
    }
    
    // 如果仍然过大，返回最小尺寸版本
    const minCanvas = document.createElement('canvas');
    minCanvas.width = Math.round(canvas.width * 0.3);
    minCanvas.height = Math.round(canvas.height * 0.3);
    
    const minCtx = minCanvas.getContext('2d')!;
    minCtx.drawImage(canvas, 0, 0, minCanvas.width, minCanvas.height);
    
    const finalBlob = await this.canvasToBlob(minCanvas, opts.mimeType, 0.5);
    
    return new File([finalBlob], fileName, {
      type: opts.mimeType,
      lastModified: Date.now()
    });
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * 检查文件是否需要压缩
   */
  static needsCompression(file: File, maxSize: number = 1024 * 1024): boolean {
    return file.size > maxSize && file.type.startsWith('image/');
  }
}

/**
 * 简化的图片压缩导出函数（用于向后兼容）
 */
export const compressImage = async (
  file: File,
  options?: ImageCompressionOptions
): Promise<CompressionResult> => {
  return ImageCompressor.compressImage(file, options);
}; 
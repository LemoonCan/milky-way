import React, { useState, useEffect, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
  placeholder?: React.ReactNode
}

// 简单的预加载状态跟踪（只记录状态，不存储图片）
const imageLoadStatus = new Map<string, 'loading' | 'loaded' | 'error'>()

/**
 * 预加载图片（依赖浏览器缓存）
 */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const status = imageLoadStatus.get(src)
    
    if (status === 'loaded') {
      resolve()
      return
    }
    
    if (status === 'error') {
      reject(new Error('Previously failed'))
      return
    }
    
    if (status === 'loading') {
      // 等待加载完成
      const checkInterval = setInterval(() => {
        const currentStatus = imageLoadStatus.get(src)
        if (currentStatus === 'loaded') {
          clearInterval(checkInterval)
          resolve()
        } else if (currentStatus === 'error') {
          clearInterval(checkInterval)
          reject(new Error('Failed to load'))
        }
      }, 100)
      return
    }

    // 开始加载
    imageLoadStatus.set(src, 'loading')
    const img = new Image()
    
    img.onload = () => {
      imageLoadStatus.set(src, 'loaded')
      resolve()
    }
    
    img.onerror = () => {
      imageLoadStatus.set(src, 'error')
      reject(new Error(`Failed to load: ${src}`))
    }
    
    img.src = src
  })
}

/**
 * 简单的懒加载图片组件
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  onLoad,
  onError,
  fallback,
  placeholder
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 懒加载观察器
  useEffect(() => {
    if (!imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // 图片加载
  useEffect(() => {
    if (!isVisible || !src) return

    const status = imageLoadStatus.get(src)
    if (status === 'loaded') {
      setIsLoading(false)
      onLoad?.()
      return
    }
    if (status === 'error') {
      setHasError(true)
      setIsLoading(false)
      onError?.()
      return
    }

    preloadImage(src)
      .then(() => {
        setIsLoading(false)
        onLoad?.()
      })
      .catch(() => {
        setHasError(true)
        setIsLoading(false)
        onError?.()
      })
  }, [src, isVisible, onLoad, onError])

  // 渲染逻辑
  if (!isVisible) {
    return (
      <div
        ref={imgRef}
        style={{ width, height, ...style }}
        className={className}
      >
        {placeholder || (
          <div style={{ 
            background: '#f5f5f5', 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px'
          }}>
            ⏳
          </div>
        )}
      </div>
    )
  }

  if (hasError) {
    return (
      <div ref={imgRef} style={{ width, height, ...style }} className={className}>
        {fallback || (
          <div style={{ 
            background: '#f0f0f0', 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px'
          }}>
            ❌
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        ref={imgRef}
        style={{ width, height, ...style }}
        className={className}
      >
        {placeholder || (
          <div style={{ 
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            width: '100%', 
            height: '100%'
          }} />
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

// 导出简单的工具方法
export const ImageUtils = {
  // 预加载图片列表
  preloadImages: async (urls: string[]): Promise<void> => {
    const results = await Promise.allSettled(urls.map(preloadImage))
    const failed = results.filter(r => r.status === 'rejected').length
    if (failed > 0) {
      console.warn(`预加载失败 ${failed}/${urls.length} 张图片`)
    }
  },
  
  // 清理预加载状态
  clearPreloadStatus: (): void => {
    imageLoadStatus.clear()
  },
  
  // 获取统计信息
  getStats: () => {
    const stats = Array.from(imageLoadStatus.values())
    return {
      total: stats.length,
      loaded: stats.filter(s => s === 'loaded').length,
      loading: stats.filter(s => s === 'loading').length,
      error: stats.filter(s => s === 'error').length
    }
  }
}

// 添加CSS动画（如果没有全局样式的话）
if (typeof document !== 'undefined') {
  const styleId = 'lazy-image-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }
} 
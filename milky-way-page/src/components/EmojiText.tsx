import React, { useEffect, useRef, useState } from 'react'
import { emojiCache } from '../utils/emojiCache'

interface EmojiTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  size?: number | string // emoji 大小，默认为当前字体大小
}

export const EmojiText: React.FC<EmojiTextProps> = ({ 
  text, 
  className, 
  style, 
  size = '1.2em'
}) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [parsedHtml, setParsedHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // 确保在客户端环境下才执行
    if (typeof window === 'undefined') {
      setParsedHtml(text) // SSR 时直接显示原始文本
      setIsLoading(false)
      return
    }

    const loadEmoji = async () => {
      try {
        setIsLoading(true)
        setUseFallback(false)
        
        // 使用缓存管理器获取emoji SVG（缓存管理器内部会处理尺寸）
        const sizeStr = typeof size === 'number' ? `${size}px` : size
        const parsed = await emojiCache.getEmojiSvg(text, sizeStr)
        
        if (parsed && parsed !== text) {
          setParsedHtml(parsed)
          setUseFallback(false)
        } else {
          // 解析失败，使用原始文本
          setParsedHtml(text)
          setUseFallback(true)
        }
      } catch (error) {
        console.warn('Emoji loading error:', error)
        setParsedHtml(text)
        setUseFallback(true)
      } finally {
        setIsLoading(false)
      }
    }

    // 检查是否已缓存（不再需要传递size参数）
    if (emojiCache.isCached(text)) {
      // 如果已缓存，立即加载
      loadEmoji()
    } else {
      // 如果未缓存，先显示原始文本，然后异步加载
      setParsedHtml(text)
      setIsLoading(false)
      setUseFallback(true)
      
      // 异步加载emoji
      loadEmoji()
    }
  }, [text, size])

  // 如果在服务端渲染，直接显示原始文本
  if (typeof window === 'undefined') {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

  // 如果正在加载且未缓存，显示原始文本
  if (isLoading && useFallback) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

  // 如果解析失败，显示原始文本
  if (useFallback && !isLoading) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

  // 显示解析后的emoji
  return (
    <span 
      ref={containerRef}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  )
}

// 高阶组件，用于快速包装任何需要 emoji 支持的文本组件
export const withEmoji = <P extends object>(
  WrappedComponent: React.ComponentType<P & { children?: React.ReactNode }>
) => {
  return React.forwardRef<HTMLElement, P & { text?: string; emojiSize?: number | string }>((props, ref) => {
    const { text, emojiSize, ...restProps } = props
    
    if (text) {
      return (
        <WrappedComponent {...(restProps as P)} ref={ref}>
          <EmojiText text={text} size={emojiSize} />
        </WrappedComponent>
      )
    }
    
    return <WrappedComponent {...(restProps as P)} ref={ref} />
  })
}

// 工具函数：检测文本中是否包含 emoji
export const hasEmoji = (text: string): boolean => {
  // 使用 Unicode 正则表达式检测 emoji
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
  return emojiRegex.test(text)
}

export default EmojiText 
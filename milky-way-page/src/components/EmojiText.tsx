import React, { useEffect, useRef, useState } from 'react'
import twemoji from 'twemoji'

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
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // 确保在客户端环境下才执行
    if (typeof window === 'undefined') {
      setParsedHtml(text) // SSR 时直接显示原始文本
      return
    }

    const tryParseEmoji = (baseUrl: string) => {
      try {
        // 使用 twemoji 解析文本
        const parsed = twemoji.parse(text, {
          base: baseUrl,
          folder: 'svg',
          ext: '.svg',
          size: 'svg',
          className: 'emoji-img',
          attributes: () => ({
            style: `
              width: ${size};
              height: ${size};
              vertical-align: -0.1em;
              display: inline-block;
              margin: 0 0.05em 0 0.1em;
            `,
            loading: 'lazy',
            onError: 'this.style.display="none"; this.nextSibling && (this.nextSibling.style.display="inline")'
          })
        })
        return parsed
      } catch {
        console.warn('Twemoji parsing error with base:', baseUrl)
        return null
      }
    }

    // 更新CDN源配置，使用更可靠的源，包括国内可用的镜像
    const cdnSources = [
      'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    ]

    let parsed = null
    for (const cdn of cdnSources) {
      parsed = tryParseEmoji(cdn)
      if (parsed && parsed !== text) {
        break
      }
    }

    if (parsed && parsed !== text) {
      setParsedHtml(parsed)
      setUseFallback(false)
    } else {
      // 静默失败，不在控制台输出警告
      setParsedHtml(text)
      setUseFallback(true)
    }
  }, [text, size])

  // 如果在服务端渲染或解析失败，直接显示原始文本
  if (typeof window === 'undefined' || !parsedHtml || useFallback) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

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
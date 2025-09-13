import twemoji from 'twemoji'

// Emoji缓存接口
interface EmojiCacheItem {
  svgData: string
  timestamp: number
}

// 缓存管理器类
class EmojiCacheManager {
  private cache = new Map<string, EmojiCacheItem>()
  private loadingPromises = new Map<string, Promise<string>>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时
  private readonly MAX_CACHE_SIZE = 600 // 最大缓存数量
  private readonly CDN_SOURCES = [
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
    'https://twemoji.maxcdn.com/v/14.0.2/'
  ]

  // 统计信息
  private stats = {
    hits: 0,
    misses: 0,
    requests: 0
  }

  /**
   * 生成缓存键（只使用emoji，不包含尺寸）
   */
  private getCacheKey(emoji: string): string {
    return emoji
  }

  /**
   * 获取emoji的SVG数据（标准尺寸，渲染时调整大小）
   */
  async getEmojiSvg(emoji: string, size: string = '1.2em'): Promise<string> {
    this.stats.requests++
    const cacheKey = this.getCacheKey(emoji)
    
    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      this.stats.hits++
      // 返回调整尺寸后的SVG
      return this.adjustSvgSize(cached.svgData, size)
    }

    this.stats.misses++

    // 检查是否正在加载
    const loadingPromise = this.loadingPromises.get(cacheKey)
    if (loadingPromise) {
      const svgData = await loadingPromise
      return this.adjustSvgSize(svgData, size)
    }

    // 开始加载
    const promise = this.loadEmojiSvg(emoji)
    this.loadingPromises.set(cacheKey, promise)

    try {
      const svgData = await promise
      
      // 缓存结果（不包含尺寸信息）
      this.cache.set(cacheKey, {
        svgData,
        timestamp: Date.now()
      })

      // 检查缓存大小，如果超限则清理最老的条目
      this.cleanupCache()

      // 返回调整尺寸后的SVG
      return this.adjustSvgSize(svgData, size)
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * 动态调整SVG大小
   */
  private adjustSvgSize(svgData: string, size: string): string {
    // twemoji生成的是img标签，而不是SVG标签
    // 需要修改img标签的style属性
    const result = svgData.replace(
      /<img[^>]*>/g,
      (match) => {
        // 移除原有的style、width、height属性
        let newImg = match
          .replace(/\s+style="[^"]*"/g, '')
          .replace(/\s+width="[^"]*"/g, '')
          .replace(/\s+height="[^"]*"/g, '')
        
        // 添加新的style属性
        const newStyle = `style="width: ${size}; height: ${size}; vertical-align: -0.1em; display: inline-block; margin: 0 0.05em 0 0.1em;"`
        
        // 在class属性之后插入新的style
        if (newImg.includes('class=')) {
          newImg = newImg.replace(/class="[^"]*"/, (classMatch) => `${classMatch} ${newStyle}`)
        } else {
          // 如果没有class属性，在>之前插入style
          newImg = newImg.replace('>', ` ${newStyle}>`)
        }
        
        return newImg
      }
    )
    return result
  }

  /**
   * 实际加载emoji的SVG数据（标准尺寸）
   */
  private async loadEmojiSvg(emoji: string): Promise<string> {
    for (const baseUrl of this.CDN_SOURCES) {
      try {
        const parsed = twemoji.parse(emoji, {
          base: baseUrl,
          folder: 'svg',
          ext: '.svg',
          size: 'svg',
          className: 'emoji-img',
          attributes: () => ({
            loading: 'lazy'
          })
        })

        if (parsed && parsed !== emoji) {
          return parsed
        }
      } catch (error) {
        console.warn(`Emoji loading failed with CDN ${baseUrl}:`, error)
        continue
      }
    }

    // 如果所有CDN都失败，返回原始emoji
    return emoji
  }

  /**
   * 批量预加载emoji（只加载一次，不分尺寸）
   */
  async preloadEmojis(emojis: string[]): Promise<void> {
    const loadPromises = emojis.map(emoji => 
      this.getEmojiSvg(emoji, '1.2em').catch(error => {
        console.warn(`预加载emoji失败: ${emoji}`, error)
        return emoji // 失败时返回原始emoji
      })
    )

    await Promise.allSettled(loadPromises)
  }

  /**
   * 清理过期和超量的缓存
   */
  private cleanupCache(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())

    // 移除过期条目
    for (const [key, item] of entries) {
      if (now - item.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }

    // 如果仍然超过限制，移除最老的条目
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE)
      for (const [key] of toRemove) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.loadingPromises.clear()
    this.stats = { hits: 0, misses: 0, requests: 0 }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, requests: 0 }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; totalItems: number; hitRate: number; requests: number; hits: number; misses: number } {
    const hitRate = this.stats.requests > 0 ? (this.stats.hits / this.stats.requests) * 100 : 0
    return {
      size: this.cache.size,
      totalItems: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100, // 保留2位小数
      requests: this.stats.requests,
      hits: this.stats.hits,
      misses: this.stats.misses
    }
  }

  /**
   * 检查emoji是否已缓存
   */
  isCached(emoji: string): boolean {
    const cacheKey = this.getCacheKey(emoji)
    const cached = this.cache.get(cacheKey)
    return cached ? Date.now() - cached.timestamp < this.CACHE_DURATION : false
  }
}

// 导出单例实例
export const emojiCache = new EmojiCacheManager()

// 常用emoji列表（用于预加载）
export const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '🔥', '✨', '💯', '💪', '🙏', '👏', '🎉', '🎊', '🥳', '😭'
]

// 预加载常用emoji的函数（只需要加载一次）
export const preloadCommonEmojis = async (): Promise<void> => {
  try {
    await emojiCache.preloadEmojis(COMMON_EMOJIS)
  } catch (error) {
    console.warn('⚠️ 常用emoji预加载失败:', error)
  }
}

// 预加载emoji面板的函数
export const preloadEmojiPickerSize = async (emojis: string[]): Promise<void> => {
  try {
    await emojiCache.preloadEmojis(emojis)
  } catch (error) {
    console.warn('⚠️ emoji面板预加载失败:', error)
  }
}

// 查看缓存统计信息的便利函数
export const getEmojiCacheStats = () => {
  const stats = emojiCache.getCacheStats()
  return stats
}

// 在开发环境下，将缓存管理器挂载到window对象，便于调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  interface WindowWithEmojiCache extends Window {
    __emojiCache: {
      cache: typeof emojiCache
      stats: typeof getEmojiCacheStats
      clearCache: () => void
      resetStats: () => void
    }
  }
  
  ;(window as unknown as WindowWithEmojiCache).__emojiCache = {
    cache: emojiCache,
    stats: getEmojiCacheStats,
    clearCache: () => emojiCache.clearCache(),
    resetStats: () => emojiCache.resetStats()
  }
}

// 导出类型
export type { EmojiCacheItem } 
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { EmojiText } from '../EmojiText'
import { Portal } from '../Portal'
import { preloadEmojiPickerSize } from '../../utils/emojiCache'
import styles from '../../css/chats/EmojiPicker.module.css'

interface EmojiPickerProps {
  isVisible: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
  triggerElement?: HTMLElement | null
}

// 常用emoji分类
const EMOJI_CATEGORIES = {
  smileys: {
    name: '表情',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
    ]
  },
  gestures: {
    name: '手势',
    icon: '👍',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
      '🙌', '👐', '🤲', '🤝', '🙏', '✊', '👊', '🤛', '🤜', '💪'
    ]
  },
  hearts: {
    name: '爱心',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
      '💋', '💌', '💒', '💍', '💎', '🌹', '🌺', '🌻', '🌷', '🌸'
    ]
  },
  animals: {
    name: '动物',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'
    ]
  },
  food: {
    name: '食物',
    icon: '🍎',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️',
      '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚'
    ]
  },
  activities: {
    name: '活动',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓',
      '🏸', '🥅', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🥊',
      '🤺', '🥋', '🎿', '🛷', '🏂', '🏄', '🏇', '🧘', '🏃', '🚴'
    ]
  },
  travel: {
    name: '旅行',
    icon: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚁', '🛩️',
      '✈️', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🚊', '🚝', '🚄'
    ]
  },
  objects: {
    name: '物品',
    icon: '📱',
    emojis: [
      '📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿',
      '📀', '📼', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠',
      '📺', '📻', '🎙️', '🎚️', '🎛️', '⏰', '🕰️', '⏱️', '⏲️', '⏰'
    ]
  }
}

const MAX_RECENT_EMOJIS = 30
const EMOJIS_PER_BATCH = 60 // 每批渲染的emoji数量（8列×6行）

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isVisible,
  onClose,
  onEmojiSelect,
  triggerElement
}) => {
  const [activeCategory, setActiveCategory] = useState('smileys')
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])
  const [visibleEmojis, setVisibleEmojis] = useState<number>(EMOJIS_PER_BATCH)
  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiGridRef = useRef<HTMLDivElement>(null)

  // 准备分类数据（包含最近使用）
  const categories = useMemo(() => ({
    recent: {
      name: '最近使用',
      icon: '🕐',
      emojis: recentEmojis
    },
    ...Object.fromEntries(
      Object.entries(EMOJI_CATEGORIES).filter(([key]) => key !== 'recent')
    )
  }), [recentEmojis])

  // 获取当前分类的emoji（限制数量）
  const currentCategoryEmojis = useMemo(() => {
    const currentCategory = categories[activeCategory as keyof typeof categories]
    if (!currentCategory) {
      return []
    }
    
    const result = currentCategory.emojis.slice(0, visibleEmojis)
    
    return result
  }, [activeCategory, visibleEmojis, categories])

  // 加载最近使用的emoji
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentEmojis')
    if (savedRecent) {
      try {
        const recent = JSON.parse(savedRecent)
        setRecentEmojis(recent)
        // 如果有最近使用的emoji，默认选中最近使用分类
        if (recent.length > 0 && activeCategory === 'smileys') {
          setActiveCategory('recent')
        }
      } catch (error) {
        console.error('Failed to load recent emojis:', error)
      }
    }
  }, [])

  // 当面板显示时，预加载当前分类的emoji
  useEffect(() => {
    if (isVisible && activeCategory) {
      const currentCategory = EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]
      if (currentCategory?.emojis) {
        // 异步预加载当前分类的emoji（20px尺寸用于面板）
        preloadEmojiPickerSize(currentCategory.emojis.slice(0, visibleEmojis))
      }
    }
  }, [isVisible, activeCategory, visibleEmojis])

  // 重置分类时重置可见emoji数量
  useEffect(() => {
    setVisibleEmojis(EMOJIS_PER_BATCH)
  }, [activeCategory])

  // 计算弹框位置
  const getPickerPosition = () => {
    if (!triggerElement) {
      return { top: '60px', left: '10px' }
    }
    
    const rect = triggerElement.getBoundingClientRect()
    const pickerWidth = 320
    const pickerHeight = 400
    
    // 计算按钮中心点，水平居中对齐
    const buttonCenterX = rect.left + rect.width / 2
    
    // 默认显示在按钮上方，水平居中对齐
    let top = rect.top - pickerHeight - 8
    let left = buttonCenterX - pickerWidth / 2
    
    // 检查上方空间是否足够
    if (top < 10) {
      // 上方空间不足，显示在按钮下方
      top = rect.bottom + 8
    }
    
    // 检查右侧空间
    if (left + pickerWidth > window.innerWidth - 10) {
      left = window.innerWidth - pickerWidth - 10
    }
    
    // 检查左侧空间
    if (left < 10) {
      left = 10
    }
    
    // 如果下方也没有足够空间，则固定在屏幕中央
    if (top + pickerHeight > window.innerHeight - 10) {
      top = (window.innerHeight - pickerHeight) / 2
      left = (window.innerWidth - pickerWidth) / 2
    }
    
    return { 
      top: `${top}px`, 
      left: `${left}px`,
      position: 'fixed' as const
    }
  }

  // 处理emoji选择
  const handleEmojiSelect = useCallback((emoji: string) => {
    // 添加到最近使用
    const newRecentEmojis = [emoji, ...recentEmojis.filter(e => e !== emoji)]
      .slice(0, MAX_RECENT_EMOJIS)
    
    setRecentEmojis(newRecentEmojis)
    localStorage.setItem('recentEmojis', JSON.stringify(newRecentEmojis))
    
    // 调用回调
    onEmojiSelect(emoji)
  }, [recentEmojis, onEmojiSelect])

  // 处理滚动加载更多emoji
  const handleScroll = useCallback(() => {
    const grid = emojiGridRef.current
    if (!grid) return

    const { scrollTop, scrollHeight, clientHeight } = grid
    // 滚动到底部附近时加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      const currentCategory = EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]
      if (currentCategory && visibleEmojis < currentCategory.emojis.length) {
        const newVisibleCount = Math.min(
          visibleEmojis + EMOJIS_PER_BATCH,
          currentCategory.emojis.length
        )
        setVisibleEmojis(newVisibleCount)
        
        // 预加载新显示的emoji
        const newEmojis = currentCategory.emojis.slice(visibleEmojis, newVisibleCount)
        preloadEmojiPickerSize(newEmojis)
      }
    }
  }, [activeCategory, visibleEmojis])

  // 绑定滚动事件
  useEffect(() => {
    const grid = emojiGridRef.current
    if (grid) {
      grid.addEventListener('scroll', handleScroll)
      return () => grid.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (triggerElement && triggerElement.contains(target)) {
        return
      }
      
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose, triggerElement])

  if (!isVisible) return null

  const pickerPosition = getPickerPosition()

  const categoryKeys = recentEmojis.length > 0 
    ? ['recent', ...Object.keys(EMOJI_CATEGORIES).filter(key => key !== 'recent')]
    : Object.keys(EMOJI_CATEGORIES).filter(key => key !== 'recent')

  return (
    <Portal>
      <div
        ref={pickerRef}
        className={styles.picker}
        style={pickerPosition}
      >
        {/* 分类标签 */}
        <div className={styles.categories}>
          {categoryKeys.map(key => {
            const category = categories[key as keyof typeof categories]
            if (key === 'recent' && recentEmojis.length === 0) return null
            
            return (
              <button
                key={key}
                className={`${styles.categoryBtn} ${activeCategory === key ? styles.active : ''}`}
                onClick={() => setActiveCategory(key)}
                title={category.name}
              >
                <EmojiText text={category.icon} size="20px" />
              </button>
            )
          })}
        </div>

        {/* emoji网格 */}
        <div className={styles.emojiGrid} ref={emojiGridRef}>
          {currentCategoryEmojis.map((emoji, index) => (
            <button
              key={`${activeCategory}-${index}`}
              className={styles.emojiBtn}
              onClick={() => handleEmojiSelect(emoji)}
              title={emoji}
            >
              <EmojiText text={emoji} size="20px" />
            </button>
          ))}
          

        </div>

        {/* 底部信息 */}
        <div className={styles.footer}>
          <span className={styles.categoryName}>
            {categories[activeCategory as keyof typeof categories]?.name}
          </span>
          <span className={styles.emojiCount}>
            {(() => {
              const currentCategory = categories[activeCategory as keyof typeof categories]
              const totalEmojis = currentCategory?.emojis.length || 0
              return `${currentCategoryEmojis.length}${totalEmojis > 0 ? `/${totalEmojis}` : ''}`
            })()}
          </span>
        </div>
      </div>
    </Portal>
  )
}

export default EmojiPicker 
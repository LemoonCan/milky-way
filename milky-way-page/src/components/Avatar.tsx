import React from 'react'
import { LazyImage } from './LazyImage'

interface AvatarProps {
  size?: number
  userId?: string
  avatarUrl?: string
  className?: string
  style?: React.CSSProperties
}

// 预定义的颜色范围
const AVATAR_COLORS = [
  '#8FD283', // 绿色
  '#FCD66C', // 黄色
  '#859BFF', // 蓝色
  '#FF9293', // 红色
  '#FFE4DD', // 粉色
]

// 根据用户ID生成一致的颜色和图案
const getAvatarStyle = (userId: string = 'default') => {
  // 使用简单的哈希函数确保同一用户ID总是得到相同的颜色
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length
  const patternIndex = Math.abs(hash >> 8) % 3 // 生成3种不同的图案
  
  return {
    backgroundColor: AVATAR_COLORS[colorIndex],
    color: '#4d3789',
    patternIndex
  }
}

// 不同的小人图案
const PersonIcon = ({ patternIndex, size }: { patternIndex: number, size: number }) => {
  const iconSize = size * 0.7
  
  switch (patternIndex) {
    case 0:
      // 标准小人
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.8"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        </svg>
      )
    case 1:
      // 带帽子的小人
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="2.5" fill="currentColor" opacity="0.8"/>
          <path d="M8 6h8l-1 2H9l-1-2z" fill="currentColor" opacity="0.6"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        </svg>
      )
    case 2:
      // 简化小人
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="7" r="2" fill="currentColor" opacity="0.8"/>
          <path d="M7 21v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        </svg>
      )
    default:
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.8"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        </svg>
      )
  }
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = 40, 
  userId = 'default',
  avatarUrl,
  className = '',
  style = {}
}) => {
  const avatarStyle = getAvatarStyle(userId)
  
  // 如果有真实头像URL，显示缓存图片；否则显示生成的头像
  if (avatarUrl) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          ...style
        }}
      >
        <LazyImage
          src={avatarUrl}
          alt="用户头像"
          width="100%"
          height="100%"
          style={{
            objectFit: 'cover' as const
          }}
          fallback={
            // 如果头像加载失败，显示生成的头像
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: avatarStyle.backgroundColor,
                color: avatarStyle.color,
              }}
            >
              <PersonIcon patternIndex={avatarStyle.patternIndex} size={size} />
            </div>
          }
          placeholder={
            // 加载时显示的占位符
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '12px'
              }}
            />
          }
        />
      </div>
    )
  }
  
  // 显示生成的头像
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.5}px`,
        fontWeight: '500',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: avatarStyle.backgroundColor,
        color: avatarStyle.color,
        ...style
      }}
    >
      <PersonIcon patternIndex={avatarStyle.patternIndex} size={size} />
    </div>
  )
} 
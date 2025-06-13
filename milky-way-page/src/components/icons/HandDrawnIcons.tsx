import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 聊天图标 - 手绘风格
export const ChatIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3.5 19.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V5c0-.8-.7-1.5-1.5-1.5H5c-.8 0-1.5.7-1.5 1.5v14.5z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M3.5 19.5l4-4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <circle cx="8" cy="10" r="1" fill={color} />
    <circle cx="12" cy="10" r="1" fill={color} />
    <circle cx="16" cy="10" r="1" fill={color} />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 好友图标 - 手绘风格
export const FriendsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <circle
      cx="19"
      cy="7"
      r="2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M22 21v-2a4 4 0 0 0-3-3.87"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 朋友圈图标 - 手绘风格
export const MomentsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M8 8l1.5 1.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M16 8l-1.5 1.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M8 16l1.5-1.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M16 16l-1.5-1.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 设置图标 - 手绘风格
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 更多图标 - 手绘风格
export const MoreIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="1" fill={color} />
    <circle cx="12" cy="5" r="1" fill={color} />
    <circle cx="12" cy="19" r="1" fill={color} />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 返回图标 - 手绘风格
export const BackIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M19 12H5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 搜索图标 - 手绘风格
export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="11"
      cy="11"
      r="8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 发送图标 - 手绘风格
export const SendIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 21l21-9L2 3v7l15 2-15 2v7z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 添加图标 - 手绘风格
export const AddIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 5v14"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '2,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <path
      d="M5 12h14"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '2,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
);

// 用户头像图标 - 手绘风格
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1,1',
        filter: 'url(#rough-paper)'
      }}
    />
    <defs>
      <filter id="rough-paper">
        <feTurbulence baseFrequency="0.04" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="0.5" />
      </filter>
    </defs>
  </svg>
); 
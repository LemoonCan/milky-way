import React from 'react';

// 添加星星图标组件
const StarIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'white',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      filter: 'url(#rough-paper)',
      strokeDasharray: '1,1',
      strokeDashoffset: '0.5',
    }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
  </svg>
);

// 简单的加号图标
const SimpleAddIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'white',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const TopBar: React.FC = () => {
  return (
    <div 
      className="animate-slide-up"
      style={{ 
        height: '40px', 
        minHeight: '40px', 
        maxHeight: '40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderBottom: 'none',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        margin: 0,
        boxSizing: 'border-box'
      }}
    >
      <div className="flex items-center justify-between w-full h-full">
        <button className="wechat-nav-item p-1 text-white hover:bg-white/10 rounded-lg transition-colors">
          <StarIcon size={14} color="white" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-white text-xs font-bold chalk-texture">银河系</h1>
        </div>
        <button className="wechat-nav-item p-1 text-white hover:bg-white/20 rounded-full transition-colors bg-white/15 shadow-lg">
          <SimpleAddIcon size={14} color="white" />
        </button>
      </div>
    </div>
  );
};

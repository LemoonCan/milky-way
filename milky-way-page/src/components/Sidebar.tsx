import React from 'react';
import { ChatIcon, FriendsIcon, MomentsIcon, SettingsIcon, UserIcon } from './icons';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { 
      icon: ChatIcon, 
      label: '消息', 
      active: true,
      badge: 5 // 未读消息数
    },
    { 
      icon: FriendsIcon, 
      label: '通讯录', 
      active: false,
      badge: 0
    },
    { 
      icon: MomentsIcon, 
      label: '朋友圈', 
      active: false,
      badge: 2
    },
    { 
      icon: SettingsIcon, 
      label: '设置', 
      active: false,
      badge: 0
    },
  ];

  return (
    <div className="w-full h-full glass-effect flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div
            className="modern-avatar"
            style={
              {
                '--bg-color': '#e66d86',
                '--bg-color-dark': '#d85a7a',
              } as React.CSSProperties
            }
          >
            <UserIcon size={20} color="white" />
          </div>
          <div>
            <p className="text-white font-semibold">张三</p>
            <p className="text-white/70 text-sm">在线</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index}>
                <button
                  className={`w-full wechat-nav-item ${
                    item.active ? 'active' : ''
                  } text-white relative`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <IconComponent 
                        size={20} 
                        color={item.active ? '#7fa4c0' : 'white'} 
                        className="mr-3" 
                      />
                      {item.badge > 0 && (
                        <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          className="w-full modern-button chalk-texture"
          style={
            {
              '--bg-color': '#f9d770',
              '--bg-color-dark': '#f7d060',
            } as React.CSSProperties
          }
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

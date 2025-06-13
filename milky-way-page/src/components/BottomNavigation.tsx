import React from 'react';
import { 
  ChatIcon, 
  FriendsIcon, 
  MomentsIcon, 
  SettingsIcon 
} from './icons';

interface BottomNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentView, 
  onNavigate 
}) => {
  const navItems = [
    { 
      icon: ChatIcon, 
      label: '微信', 
      view: 'chatList',
      badge: 5
    },
    { 
      icon: FriendsIcon, 
      label: '通讯录', 
      view: 'contacts',
      badge: 0
    },
    { 
      icon: MomentsIcon, 
      label: '发现', 
      view: 'discover',
      badge: 2
    },
    { 
      icon: SettingsIcon, 
      label: '我', 
      view: 'profile',
      badge: 0
    },
  ];

  return (
    <div className="glass-effect border-t border-white/10 animate-slide-up safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={index}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 wechat-nav-item ${
                isActive ? 'active' : ''
              } text-white relative min-w-0`}
            >
              <div className="relative">
                <IconComponent 
                  size={22} 
                  color={isActive ? '#7fa4c0' : 'white'} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium truncate ${
                isActive ? 'text-primary' : 'text-white/80'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

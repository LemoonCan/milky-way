import React from 'react';
import { UserIcon } from './icons';
import { SearchBar } from './SearchBar';

interface ChatItem {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
}

export const ChatList: React.FC = () => {
  const chatList: ChatItem[] = [
    {
      id: 1,
      name: '张三',
      lastMessage: '完美！那我们2点在公园门口见面吧',
      time: '10:35',
      avatar: '#73c8a9',
      unreadCount: 0,
      isOnline: true,
      isPinned: true,
    },
    {
      id: 2,
      name: '李四',
      lastMessage: '今晚有空吗？想请你吃饭',
      time: '昨天',
      avatar: '#e66d86',
      unreadCount: 3,
      isOnline: true,
      isPinned: false,
    },
    {
      id: 3,
      name: '王五',
      lastMessage: '好的，文件我已经发给你了',
      time: '昨天',
      avatar: '#f9d770',
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
    },
    {
      id: 4,
      name: '研发小组',
      lastMessage: '赵六: 这个功能我们下周完成',
      time: '前天',
      avatar: '#7fa4c0',
      unreadCount: 12,
      isOnline: false,
      isPinned: false,
    },
    {
      id: 5,
      name: '家人群',
      lastMessage: '妈妈: 记得按时吃饭哦',
      time: '前天',
      avatar: '#e66d86',
      unreadCount: 1,
      isOnline: false,
      isPinned: false,
    },
  ];

  const pinnedChats = chatList.filter((chat) => chat.isPinned);
  const regularChats = chatList.filter((chat) => !chat.isPinned);

  const ChatListItem: React.FC<{ chat: ChatItem }> = ({ chat }) => (
    <div className="wechat-chat-item group">
      <div className="flex items-center space-x-3 p-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className="wechat-avatar"
            style={
              {
                '--bg-color': chat.avatar,
                '--bg-color-dark': chat.avatar,
              } as React.CSSProperties
            }
          >
            <UserIcon size={18} color="white" />
          </div>
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-medium text-gray-900 truncate ${
                chat.isPinned ? 'text-primary' : ''
              }`}
            >
              {chat.name}
              {chat.isPinned && (
                <span className="ml-1 text-xs text-primary">📌</span>
              )}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {chat.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
            {chat.unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 font-bold">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="h-full flex flex-col bg-white"
      style={{
        margin: 0,
        padding: 0,
        border: 'none'
      }}
    >
      {/* Search Bar */}
      <SearchBar />

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div>
            {pinnedChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
            <div className="border-b border-white/30 mx-4 my-2"></div>
          </div>
        )}

        {/* Regular Chats */}
        <div>
          {regularChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    </div>
  );
}; 
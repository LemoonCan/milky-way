import React, { useState } from 'react';
import { UserIcon, SendIcon, BackIcon, MoreIcon } from './icons';

interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  isMe: boolean;
}

export const ChatWindow: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');

  const messages: Message[] = [
    { id: 1, sender: '张三', message: '你好！', time: '10:30', isMe: false },
    { id: 2, sender: '我', message: '嗨，你好！', time: '10:31', isMe: true },
    {
      id: 3,
      sender: '张三',
      message: '今天天气真不错呢，很适合出去散步',
      time: '10:32',
      isMe: false,
    },
    {
      id: 4,
      sender: '我',
      message: '是啊，要不要一起去公园走走？',
      time: '10:33',
      isMe: true,
    },
    {
      id: 5,
      sender: '张三',
      message: '好主意！下午2点怎么样？',
      time: '10:34',
      isMe: false,
    },
    {
      id: 6,
      sender: '我',
      message: '完美！那我们2点在公园门口见面吧',
      time: '10:35',
      isMe: true,
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically dispatch to Redux store
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-gray-50">
      {/* WeChat Style Header */}
      <div className="p-4 glass-effect border-b border-white/20 relative">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden">
            <BackIcon size={20} color="white" />
          </button>
          
          <div className="flex items-center space-x-3 flex-1 justify-center lg:justify-start">
            <div
              className="wechat-avatar"
              style={
                {
                  '--bg-color': '#73c8a9',
                  '--bg-color-dark': '#5fb896',
                } as React.CSSProperties
              }
            >
              <UserIcon size={18} color="white" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-bold text-white text-lg chalk-texture">张三</h2>
              <p className="text-sm text-white/80">在线</p>
            </div>
          </div>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreIcon size={20} color="white" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/20 to-blue-100/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end space-x-2 ${
              msg.isMe ? 'justify-end flex-row-reverse space-x-reverse' : 'justify-start'
            }`}
          >
            {/* Avatar for received messages */}
            {!msg.isMe && (
              <div className="wechat-avatar-small mb-1">
                <UserIcon size={14} color="white" />
              </div>
            )}
            
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div className={`wechat-message ${msg.isMe ? 'sent' : 'received'}`}>
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
              <p className={`text-xs mt-1 opacity-60 ${
                msg.isMe ? 'text-right' : 'text-left'
              }`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* WeChat Style Input */}
      <div className="p-4 glass-effect border-t border-white/20 bg-white/5">
        <div className="flex items-end space-x-3">
          <div className="flex-1 bg-white/90 rounded-lg border border-gray-200/50 focus-within:border-primary/50 transition-colors">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="w-full p-3 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 text-sm leading-relaxed min-h-[44px] max-h-24"
              rows={1}
              style={{ fontFamily: 'inherit' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`wechat-send-button ${
              newMessage.trim() ? 'active' : 'disabled'
            }`}
          >
            <SendIcon size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SearchIcon } from './icons';

export const SearchBar: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <div 
      className="px-4 bg-gradient-to-b from-white/10 to-white/5 wechat-search-bar"
      style={{ 
        height: '100px', 
        minHeight: '100px', 
        maxHeight: '100px', 
        paddingTop: '25px', 
        paddingBottom: '25px',
        margin: 0,
        border: 'none',
        borderTop: 'none'
      }}
    >
      <div className="relative w-full h-full flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon size={22} color="#9CA3AF" />
        </div>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索"
          className="wechat-search-input w-full pl-14 pr-6 py-5 bg-white/95 border-0 rounded-xl text-gray-800 placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white transition-all duration-300"
          style={{ height: '50px', fontSize: '16px' }}
        />
      </div>
    </div>
  );
}; 
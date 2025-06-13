import React from 'react';
import { Layout, ImageWall, ChatWindow, ChatList } from './components';
import { useNavigation } from './hooks/useNavigation';

function App() {
  const { currentView, navigateTo } = useNavigation();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chatList':
        return <ChatList />;
      case 'chat':
        return <ChatWindow />;
      case 'images':
        return <ImageWall />;
      case 'contacts':
        return (
          <div className="h-full flex items-center justify-center bg-white">
            <p className="text-gray-500 chalk-texture">通讯录页面开发中...</p>
          </div>
        );
      case 'discover':
        return (
          <div className="h-full flex items-center justify-center bg-white">
            <p className="text-gray-500 chalk-texture">发现页面开发中...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="h-full flex items-center justify-center bg-white">
            <p className="text-gray-500 chalk-texture">个人页面开发中...</p>
          </div>
        );
      default:
        return <ChatList />;
    }
  };

  const handleNavigate = (view: string) => {
    navigateTo(view as 'chatList' | 'chat' | 'contacts' | 'discover' | 'profile' | 'images');
  };

  return (
    <Layout 
      currentView={currentView}
      onNavigate={handleNavigate}
    >
      <div className="h-full">
        {renderCurrentView()}
      </div>
    </Layout>
  );
}

export default App;

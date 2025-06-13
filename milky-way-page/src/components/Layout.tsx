import React, { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView = 'chatList',
  onNavigate = () => {}
}) => {
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:z-10">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Mobile Top Bar - Hidden on desktop */}
        <div 
          className="lg:hidden" 
          style={{ 
            height: '40px', 
            minHeight: '40px', 
            maxHeight: '40px',
            padding: 0,
            margin: 0,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <TopBar />
        </div>

        {/* Content */}
        <main 
          className="flex-1 overflow-hidden"
          style={{
            margin: 0,
            padding: 0,
            border: 'none'
          }}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <div className="lg:hidden">
          <BottomNavigation 
            currentView={currentView}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};

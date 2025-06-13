import { useState, useCallback } from 'react';

export type ViewType = 'chatList' | 'chat' | 'contacts' | 'discover' | 'profile' | 'images';

interface NavigationState {
  currentView: ViewType;
  chatId?: number;
  history: ViewType[];
}

export const useNavigation = () => {
  const [state, setState] = useState<NavigationState>({
    currentView: 'chatList',
    history: ['chatList'],
  });

  const navigateTo = useCallback((view: ViewType, chatId?: number) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      chatId,
      history: [...prev.history, view],
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.history.length <= 1) return prev;
      
      const newHistory = prev.history.slice(0, -1);
      const previousView = newHistory[newHistory.length - 1];
      
      return {
        ...prev,
        currentView: previousView,
        history: newHistory,
        chatId: previousView === 'chat' ? prev.chatId : undefined,
      };
    });
  }, []);

  const canGoBack = state.history.length > 1;

  return {
    currentView: state.currentView,
    chatId: state.chatId,
    navigateTo,
    goBack,
    canGoBack,
  };
}; 
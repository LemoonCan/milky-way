import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import { AppRouter } from './AppRouter'
import { preloadCommonEmojis } from './utils/emojiCache'

// 应用启动时预加载常用emoji
preloadCommonEmojis()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)

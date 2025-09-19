import { useState, useEffect } from 'react'

// 动态viewport高度hook，处理移动端地址栏变化
export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(0)
  
  useEffect(() => {
    const updateViewportHeight = () => {
      // 获取实际的视口高度
      let vh = window.innerHeight
      
      // 检测是否为移动端原生浏览器
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isWebView = /wv|WebView/i.test(navigator.userAgent)
      
      // 对于移动端原生浏览器，使用更保守的高度计算
      if (isMobile && !isStandalone && !isWebView) {
        // 原生浏览器通常有地址栏，预留更多空间
        vh = Math.min(vh, window.screen.height * 0.85)
      }
      
      setViewportHeight(vh)
      
      // 设置CSS自定义属性，用于不支持dvh/svh的浏览器
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
      
      // 额外设置一个安全的视口高度变量
      document.documentElement.style.setProperty('--safe-vh', `${vh * 0.01}px`)
    }
    
    // 初始化
    updateViewportHeight()
    
    // 监听resize事件（包括地址栏显示/隐藏）
    window.addEventListener('resize', updateViewportHeight)
    
    // 监听orientationchange事件（设备旋转）
    window.addEventListener('orientationchange', () => {
      // 延迟执行，等待浏览器完成旋转
      setTimeout(updateViewportHeight, 100)
    })
    
    // iOS Safari特殊处理：监听visualViewport变化
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight)
    }
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('orientationchange', updateViewportHeight)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight)
      }
    }
  }, [])
  
  return viewportHeight
}

// 检测浏览器是否支持新的viewport单位
export const supportsNewViewportUnits = () => {
  if (typeof window === 'undefined') return false
  
  try {
    // 创建测试元素
    const testEl = document.createElement('div')
    testEl.style.height = '100dvh'
    
    // 检查是否支持dvh
    return testEl.style.height === '100dvh'
  } catch {
    return false
  }
}

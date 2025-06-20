import React, { useState } from 'react'
import { useAuthStore } from './store/auth'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import type { RegisterFormData } from './components/RegisterPage'
import ChatApp from './ChatApp'

type PageState = 'login' | 'register' | 'chat'

export const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>('login')
  const [message, setMessage] = useState('')
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('')
  
  const { isAuthenticated, login, register } = useAuthStore()

  // 处理登录
  const handleLogin = async (username: string, password: string) => {
    setMessage('')
    
    try {
      const success = await login(username, password)
      
      if (success) {
        setMessage('登录成功！')
        setCurrentPage('chat')
      } else {
        setMessage('登录失败：用户名或密码错误')
      }
    } catch (error) {
      setMessage('登录过程中出现错误')
      console.error('Login error:', error)
    }
  }

  // 处理注册
  const handleRegister = async (formData: RegisterFormData) => {
    setRegisterSuccessMessage('')
    
    try {
      const success = await register(formData)
      
      if (success) {
        setRegisterSuccessMessage('注册成功！请登录')
        // 延时跳转到登录页面，让用户看到成功消息
        setTimeout(() => {
          setCurrentPage('login')
          setRegisterSuccessMessage('')
        }, 2000)
      } else {
        setRegisterSuccessMessage('注册失败：用户名已存在')
      }
    } catch (error) {
      setRegisterSuccessMessage('注册过程中出现错误')
      console.error('Register error:', error)
    }
  }

  // 导航到注册页
  const handleNavigateToRegister = () => {
    setCurrentPage('register')
    setMessage('')
  }

  // 导航到登录页
  const handleNavigateToLogin = () => {
    setCurrentPage('login')
    setMessage('')
  }

  // 如果已登录，直接显示聊天应用
  if (isAuthenticated && currentPage === 'chat') {
    return <ChatApp />
  }

  // 根据当前页面状态渲染对应组件
  return (
    <div>
      {/* 登录页消息提示 */}
      {message && currentPage === 'login' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FCD66C',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          {message}
        </div>
      )}

      {/* 注册页消息提示 */}
      {registerSuccessMessage && currentPage === 'register' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          // backgroundColor: '#FCD66C',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          {registerSuccessMessage}
        </div>
      )}

      {/* 页面内容 */}
      {currentPage === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={handleNavigateToRegister}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}
    </div>
  )
} 
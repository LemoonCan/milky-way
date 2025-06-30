import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { RegisterSuccessDialog } from './components/RegisterSuccessDialog'
import type { RegisterFormData } from './components/RegisterPage'
import ChatApp from './ChatApp'
// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// 公共路由组件（已登录用户重定向到主页）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/main" replace />
  }
  
  return <>{children}</>
}

// 登录页面组件包装器
const LoginPageWrapper: React.FC = () => {
  const navigate = useNavigate()
  const { login, clearError, loading } = useAuthStore()

  // 处理登录
  const handleLogin = async (username: string, password: string) => {
    // 如果正在登录中，避免重复调用
    if (loading) {
      return
    }

    try {
      const success = await login(username, password)
      
      if (success) {
        navigate('/main/messages')
      } 
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // 导航到注册页
  const handleNavigateToRegister = () => {
    clearError()
    navigate('/register')
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onNavigateToRegister={handleNavigateToRegister}
    />
  )
}

// 注册页面组件包装器
const RegisterPageWrapper: React.FC = () => {
  const navigate = useNavigate()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { register, clearError } = useAuthStore()

  // 处理注册
  const handleRegister = async (formData: RegisterFormData) => {
    try {
      const success = await register(formData)
      
      if (success) {
        setShowSuccessDialog(true)
      }
    } catch (error) {
      console.error('Register error:', error)
    }
  }

  // 处理注册成功弹窗完成
  const handleSuccessDialogComplete = () => {
    setShowSuccessDialog(false)
    navigate('/login')
  }

  // 导航到登录页
  const handleNavigateToLogin = () => {
    clearError()
    navigate('/login')
  }

  return (
    <div>
      <RegisterPage
        onRegister={handleRegister}
        onNavigateToLogin={handleNavigateToLogin}
      />
      
      {/* 注册成功弹窗 */}
      <RegisterSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        onComplete={handleSuccessDialogComplete}
      />
    </div>
  )
}

export const AppRouter: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const { isAuthenticated, checkAuthStatus } = useAuthStore()

  // 组件初始化时检查登录状态
  useEffect(() => {
    checkAuthStatus()
    setIsInitialized(true)
  }, [checkAuthStatus])

  // 如果还未初始化完成，显示加载状态
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* 默认路由重定向 */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/main/messages" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* 认证相关路由 */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPageWrapper />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPageWrapper />
          </PublicRoute>
        } 
      />
      
      {/* 主应用路由 */}
      <Route 
        path="/main/*" 
        element={
          <ProtectedRoute>
            <ChatApp />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 重定向 */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? 
            <Navigate to="/main/messages" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
    </Routes>
  )
} 
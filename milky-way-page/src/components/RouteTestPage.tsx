import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export const RouteTestPage: React.FC = () => {
  const location = useLocation()
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">路由测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">当前路径</h2>
          <p className="text-lg text-blue-600 font-mono">{location.pathname}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">可用路由</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/login" 
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <h3 className="font-semibold text-blue-900">登录页</h3>
              <p className="text-sm text-blue-700">/login</p>
            </Link>
            
            <Link 
              to="/register" 
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <h3 className="font-semibold text-green-900">注册页</h3>
              <p className="text-sm text-green-700">/register</p>
            </Link>
            
            <Link 
              to="/main" 
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <h3 className="font-semibold text-purple-900">聊天页</h3>
              <p className="text-sm text-purple-700">/main</p>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">注意</h3>
          <p className="text-yellow-800">
            根据登录状态，某些路由可能会自动重定向。未登录用户访问 /main 会被重定向到 /login，
            已登录用户访问 /auth/* 会被重定向到 /main。
          </p>
        </div>
      </div>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../ui/alert-dialog'
import { CheckCircle } from 'lucide-react'

interface RegisterSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export const RegisterSuccessDialog: React.FC<RegisterSuccessDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!open) {
      setCountdown(3)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, onComplete])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="border-0 shadow-2xl p-8 relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f7f8fc 100%)',
          backdropFilter: 'blur(10px)',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          minHeight: '220px',
          maxWidth: '90vw',
          borderRadius: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}>
        {/* 装饰性星空背景 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-1 h-1 rounded-full animate-pulse"
            style={{ background: 'var(--milky-primary)', animationDelay: '0s' }}></div>
          <div className="absolute top-12 right-8 w-0.5 h-0.5 rounded-full animate-pulse"
            style={{ background: 'var(--milky-primary)', animationDelay: '1s' }}></div>
          <div className="absolute bottom-16 left-8 w-0.5 h-0.5 rounded-full animate-pulse"
            style={{ background: 'var(--milky-primary)', animationDelay: '2s' }}></div>
          <div className="absolute bottom-8 right-4 w-1 h-1 rounded-full animate-pulse"
            style={{ background: 'var(--milky-primary)', animationDelay: '0.5s' }}></div>
        </div>
        
        <AlertDialogHeader>
          <div className="flex flex-col items-center space-y-6 pb-6 relative z-10">
            {/* 成功图标 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #FCD66C 0%, #f0c929 100%)',
                  boxShadow: '0 8px 32px rgba(252, 214, 108, 0.4)'
                }}>
                <CheckCircle className="w-10 h-10 text-white stroke-[2.5]" />
              </div>
              {/* 装饰性光环 */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(252, 214, 108, 0.3) 0%, rgba(240, 201, 41, 0.3) 100%)'
                }}></div>
            </div>
            
            {/* 标题 */}
            <AlertDialogTitle className="text-center text-2xl font-bold tracking-wide"
              style={{ color: 'var(--milky-text)' }}>
              注册成功！
            </AlertDialogTitle>
            
            {/* 描述 */}
            <div className="text-center space-y-3">
              <AlertDialogDescription className="text-base font-medium" 
                style={{ color: 'var(--milky-text-secondary)' }}>
                🎉 恭喜您成功注册银河系账号
              </AlertDialogDescription>
              <div className="flex items-center justify-center space-x-2 mt-4 px-4 py-2 rounded-full"
                style={{ 
                  background: 'rgba(252, 214, 108, 0.1)',
                  border: '1px solid rgba(252, 214, 108, 0.3)'
                }}>
                <div className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--milky-primary)' }}></div>
                <span className="text-sm font-medium" 
                  style={{ color: 'var(--milky-text)' }}>
                  {countdown}秒后自动跳转到登录页面
                </span>
              </div>
            </div>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
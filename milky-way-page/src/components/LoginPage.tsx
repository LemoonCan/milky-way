import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'
import styles from '../css/LoginPage.module.css'

interface LoginPageProps {
  onLogin: (username: string, password: string) => void
  onNavigateToRegister: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除错误信息
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: ''
    }

    if (!formData.username.trim()) {
      newErrors.username = '请输入账号'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6位'
    }

    setErrors(newErrors)
    return !newErrors.username && !newErrors.password
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onLogin(formData.username, formData.password)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        {/* Logo 区域 */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <Sparkles className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>银河系</h1>
          <p className={styles.subtitle}>散落的小星辰，银河里闪耀</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>账号</label>
            <Input
              type="text"
              placeholder="请输入账号"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={cn(
                styles.input,
                errors.username && styles.inputError
              )}
            />
            {errors.username && (
              <span className={styles.errorText}>{errors.username}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>密码</label>
            <Input
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={cn(
                styles.input,
                errors.password && styles.inputError
              )}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <Button 
            type="submit" 
            className={styles.loginButton}
            size="lg"
          >
            登录
          </Button>

          <div className={styles.footer}>
            <span className={styles.footerText}>还没有账号？</span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className={styles.linkButton}
            >
              立即注册
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Sparkles, Camera } from 'lucide-react'
import { cn } from '../lib/utils'
import styles from '../css/RegisterPage.module.css'

interface RegisterPageProps {
  onRegister: (formData: RegisterFormData) => void
  onNavigateToLogin: () => void
}

export interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  avatar?: string
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    avatar: ''
  })
  
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除对应字段的错误信息
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: '',
      confirmPassword: '',
      nickname: ''
    }

    // 验证账号
    if (!formData.username.trim()) {
      newErrors.username = '请输入账号'
    } else if (formData.username.length < 3) {
      newErrors.username = '账号至少需要3位字符'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '账号只能包含字母、数字和下划线'
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6位'
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    // 验证昵称
    if (!formData.nickname.trim()) {
      newErrors.nickname = '请输入昵称'
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = '昵称不能超过20个字符'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onRegister(formData)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        {/* Logo 区域 */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <Sparkles className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>注册银河系</h1>
          <p className={styles.subtitle}>加入我们，漫游银河</p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 头像上传 */}
          <div className={styles.avatarSection}>
            <label className={styles.avatarLabel}>选择头像（可选）</label>
            <div className={styles.avatarUpload} onClick={() => fileInputRef.current?.click()}>
              <Avatar className={styles.avatar}>
                {formData.avatar ? (
                  <AvatarImage src={formData.avatar} alt="头像预览" />
                ) : (
                  <AvatarFallback className={styles.avatarFallback}>
                    <Camera className={styles.avatarIcon} />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={styles.avatarHint}>
                <span className={styles.uploadText}>点击上传头像</span>
                <span className={styles.uploadSubtext}>支持 JPG、PNG 格式</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className={styles.hiddenInput}
            />
          </div>

          {/* 昵称 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>昵称</label>
            <Input
              type="text"
              placeholder="请输入昵称"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className={cn(
                styles.input,
                errors.nickname && styles.inputError
              )}
            />
            {errors.nickname && (
              <span className={styles.errorText}>{errors.nickname}</span>
            )}
          </div>

          {/* 账号 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>账号</label>
            <Input
              type="text"
              placeholder="请输入账号（字母、数字、下划线）"
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

          {/* 密码 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>密码</label>
            <Input
              type="password"
              placeholder="请输入密码（至少6位）"
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

          {/* 确认密码 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>确认密码</label>
            <Input
              type="password"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={cn(
                styles.input,
                errors.confirmPassword && styles.inputError
              )}
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <Button 
            type="submit" 
            className={styles.registerButton}
            size="lg"
          >
            注册
          </Button>

          <div className={styles.footer}>
            <span className={styles.footerText}>已有账号？</span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className={styles.linkButton}
            >
              立即登录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
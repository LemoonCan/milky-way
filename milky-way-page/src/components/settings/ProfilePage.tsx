import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { ArrowLeft, Camera, AlertCircle, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { userService } from '../../services/user'
import { useUserStore } from '../../store/user'
import { fileService } from '../../services/file'
import type { UpdateUserRequest } from '../../services/user'
import styles from '../../css/settings/ProfilePage.module.css'

interface ProfilePageProps {
  onBack: () => void
}

interface ProfileFormData {
  nickName: string
  avatar: string
  individualSignature: string
  openId: string // 只读字段
}

interface FormErrors {
  nickName: string
  individualSignature: string
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({
    nickName: '',
    individualSignature: ''
  })

  const [originalData, setOriginalData] = useState<ProfileFormData>({
    nickName: '',
    avatar: '',
    individualSignature: '',
    openId: ''
  })

  const [formData, setFormData] = useState<ProfileFormData>({
    nickName: '',
    avatar: '',
    individualSignature: '',
    openId: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检查是否有变更
  const hasChanges = React.useMemo(() => {
    return (
      formData.nickName !== originalData.nickName ||
      formData.avatar !== originalData.avatar ||
      formData.individualSignature !== originalData.individualSignature
    )
  }, [formData, originalData])

  const { currentUser, fetchUserInfo, updateUserInfo } = useUserStore()

  // 加载用户信息
  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    setLoading(true)
    setError('')
    
    try {
      await fetchUserInfo()
      
      if (currentUser) {
        const profileData: ProfileFormData = {
          nickName: currentUser.nickName || '',
          avatar: currentUser.avatar || '',
          individualSignature: currentUser.individualSignature || '', // 个性签名字段
          openId: currentUser.openId || ''
        }
        
        setOriginalData(profileData)
        setFormData(profileData)
      } else {
        setError('获取用户信息失败')
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      setError('获取用户信息失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除对应字段的错误信息
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
    
    // 清除API错误信息
    if (error) {
      setError('')
    }
    if (success) {
      setSuccess(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploading(true)
      setUploadError('')
      
      try {
        const fileInfo = await fileService.uploadAvatar(file)
        
        setFormData(prev => ({
          ...prev,
          avatar: fileInfo.fileAccessUrl
        }))
        
        setUploadError('')
      } catch (error) {
        console.error('头像上传失败:', error)
        const errorMessage = error instanceof Error ? error.message : '头像上传失败'
        setUploadError(errorMessage)
      } finally {
        setUploading(false)
      }
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {
      nickName: '',
      individualSignature: ''
    }

    // 验证昵称
    if (!formData.nickName.trim()) {
      newErrors.nickName = '昵称不能为空'
    } else if (formData.nickName.length > 20) {
      newErrors.nickName = '昵称不能超过20个字符'
    }
    
    // 验证个性签名
    if (formData.individualSignature.length > 100) {
      newErrors.individualSignature = '个性签名不能超过100个字符'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const handleSave = async () => {
    if (!hasChanges) return
    
    // 验证表单
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError('')
    
    try {
      const updateData: UpdateUserRequest = {
        openId: formData.openId,
        nickName: formData.nickName.trim(),
        avatar: formData.avatar,
        individualSignature: formData.individualSignature.trim()
      }
      
      const response = await userService.updateUserInfo(updateData)
      
      if (response.success) {
        // 更新全局状态
        updateUserInfo({
          nickName: updateData.nickName,
          avatar: updateData.avatar,
          individualSignature: updateData.individualSignature
        })
        
        setOriginalData({ ...formData })
        setSuccess(true)
        
        // 3秒后清除成功提示
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(response.msg || '保存失败')
      }
    } catch (err) {
      console.error('保存用户信息失败:', err)
      setError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        {/* 头部 */}
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            返回
          </Button>
          <h1 className={styles.title}>个人信息</h1>
        </div>

        {/* 表单内容 */}
        <div className={styles.content}>
          {/* 错误/成功提示 */}
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle className={styles.alertIcon} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className={styles.successAlert}>
              <Check className={styles.alertIcon} />
              <span>保存成功！</span>
            </div>
          )}

          {/* 头像上传 */}
          <div className={styles.avatarSection}>
            <label className={styles.label}>头像</label>
            <div 
              className={styles.avatarUpload}
              onClick={() => {
                if (!saving && !uploading) {
                  setUploadError('')
                  fileInputRef.current?.click()
                }
              }}
            >
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
                <span className={styles.uploadText}>
                  {uploading ? '上传中...' : '点击更换头像'}
                </span>
                <span className={styles.uploadSubtext}>支持 JPG、PNG 格式</span>
              </div>
            </div>
            {uploadError && (
              <p className={styles.errorText}>{uploadError}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className={styles.hiddenInput}
            />
          </div>

          {/* 账号（只读） */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>账号</label>
            <Input
              type="text"
              value={formData.openId}
              disabled
              className={cn(styles.input, styles.inputDisabled)}
            />
          </div>

          {/* 昵称 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>昵称</label>
            <Input
              type="text"
              value={formData.nickName}
              onChange={(e) => handleInputChange('nickName', e.target.value)}
              placeholder="请输入昵称"
              maxLength={20}
              className={cn(
                styles.input,
                errors.nickName && styles.inputError
              )}
            />
            {errors.nickName && (
              <span className={styles.errorText}>{errors.nickName}</span>
            )}
          </div>

          {/* 个性签名 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>个性签名</label>
            <textarea
              value={formData.individualSignature}
              onChange={(e) => handleInputChange('individualSignature', e.target.value)}
              placeholder="写点什么介绍自己吧..."
              maxLength={100}
              rows={3}
              className={cn(
                styles.input, 
                styles.textarea,
                errors.individualSignature && styles.inputError
              )}
            />
            <div className={styles.charCount}>
              {formData.individualSignature.length}/100
            </div>
            {errors.individualSignature && (
              <span className={styles.errorText}>{errors.individualSignature}</span>
            )}
          </div>
        </div>

        {/* 保存按钮 */}
        <div className={styles.footer}>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || uploading}
            className={cn(
              styles.saveButton,
              hasChanges && !saving && !uploading ? styles.saveButtonActive : styles.saveButtonDisabled
            )}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
} 
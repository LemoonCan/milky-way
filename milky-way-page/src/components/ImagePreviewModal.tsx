import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from './ui/button'
import styles from '../css/ImagePreviewModal.module.css'

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex = 0,
  onIndexChange
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [imageDisplaySize, setImageDisplaySize] = useState<{ width: number; height: number } | null>(null)
  
  // 重置图片状态
  const resetImageState = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setImageDisplaySize(null)
  }

  // 计算图片的精确显示尺寸
  const calculateExactImageSize = (naturalWidth: number, naturalHeight: number) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // 预留空间给工具栏和边距（工具栏约40px + 间距）
    const maxWidth = viewportWidth * 0.9
    const maxHeight = viewportHeight * 0.85 - 60 // 减去工具栏高度
    
    // 计算缩放比例，保持图片比例
    const scaleX = maxWidth / naturalWidth
    const scaleY = maxHeight / naturalHeight
    const scale = Math.min(scaleX, scaleY, 1) // 不超过原图大小
    
    // 计算图片的实际显示尺寸
    const displayWidth = naturalWidth * scale
    const displayHeight = naturalHeight * scale
    
    return {
      width: Math.round(displayWidth),
      height: Math.round(displayHeight)
    }
  }

  // 图片加载完成处理
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const exactSize = calculateExactImageSize(img.naturalWidth, img.naturalHeight)
    setImageDisplaySize(exactSize)
  }

  // 切换图片时重置状态
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex)
      resetImageState()
    }
  }, [isOpen, currentIndex])

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case '=':
        case '+':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeIndex])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const goToPrevious = () => {
    if (images.length <= 1) return
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1
    setActiveIndex(newIndex)
    onIndexChange?.(newIndex)
    resetImageState()
  }

  const goToNext = () => {
    if (images.length <= 1) return
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0
    setActiveIndex(newIndex)
    onIndexChange?.(newIndex)
    resetImageState()
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      resetImageState()
    }
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[activeIndex]

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal}>
        {/* 图片和工具栏容器 */}
        <div className={styles.imageSection} onClick={(e) => e.stopPropagation()}>
          {/* 图片上方工具栏 */}
          <div className={styles.toolbar}>
            {images.length > 1 && (
              <div className={styles.imageCounter}>
                <span>{activeIndex + 1} / {images.length}</span>
              </div>
            )}
            
            <div className={styles.toolButtons}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className={styles.toolButton}
              >
                <ZoomOut size={14} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 5}
                className={styles.toolButton}
              >
                <ZoomIn size={14} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className={styles.toolButton}
              >
                <RotateCw size={14} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={styles.closeButton}
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* 图片容器 */}
          <div 
            className={styles.imageContainer}
            style={imageDisplaySize ? {
              width: `${imageDisplaySize.width}px`,
              height: `${imageDisplaySize.height}px`
            } : {}}
          >
            <img
              src={currentImage}
              alt={`预览图片 ${activeIndex + 1}`}
              className={styles.previewImage}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                cursor: scale === 1 ? 'grab' : 'grab'
              }}
              onLoad={handleImageLoad}
              onDoubleClick={handleDoubleClick}
            />
            
            {/* 左右导航按钮（在图片上） */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className={`${styles.navButton} ${styles.prevButton}`}
                >
                  <ChevronLeft size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className={`${styles.navButton} ${styles.nextButton}`}
                >
                  <ChevronRight size={16} />
                </Button>
              </>
            )}
          </div>
        </div>


      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ImagePreviewModal 
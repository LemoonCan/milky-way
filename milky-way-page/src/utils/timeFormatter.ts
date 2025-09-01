/**
 * 时间格式化工具类
 */
export class TimeFormatter {
  /**
   * 格式化时间为相对时间或绝对时间
   * @param date 要格式化的日期，可以是 Date 对象、字符串或 null/undefined
   * @returns 格式化后的时间字符串
   */
  static formatRelativeTime(date: Date | string | null | undefined): string {
    try {
      // 处理空值情况
      if (!date) {
        return '时间未知'
      }
      
      // 转换为 Date 对象
      const targetDate = date instanceof Date ? date : new Date(date)
      
      // 检查时间是否有效
      if (isNaN(targetDate.getTime())) {
        return '时间未知'
      }
      
      const now = new Date()
      const diffInMs = now.getTime() - targetDate.getTime()
      
      // 检查时间差是否为负数（未来时间）或过大（可能是错误数据）
      if (diffInMs < 0) {
        return '刚刚'
      }
      
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return '刚刚'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}小时前`
      } else if (diffInMinutes < 10080) { // 7天内
        return `${Math.floor(diffInMinutes / 1440)}天前`
      } else {
        // 超过7天显示具体日期
        const now = new Date()
        const currentYear = now.getFullYear()
        const targetYear = targetDate.getFullYear()
        
        if (targetYear !== currentYear) {
          // 不是今年，显示年/月/日
          return targetDate.toLocaleDateString('zh-CN', { 
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit' 
          })
        } else {
          // 今年，只显示月/日
          return targetDate.toLocaleDateString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit' 
          })
        }
      }
    } catch (error) {
      console.error('时间格式化失败:', error)
      return '时间未知'
    }
  }

  /**
   * 格式化时间为标准格式
   * @param date 要格式化的日期
   * @param options 格式化选项
   * @returns 格式化后的时间字符串
   */
  static formatDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
      
      return date.toLocaleDateString('zh-CN', options || defaultOptions)
    } catch (error) {
      console.error('时间格式化失败:', error)
      return '时间未知'
    }
  }

  /**
   * 格式化时间为仅日期格式
   * @param date 要格式化的日期
   * @returns 格式化后的日期字符串
   */
  static formatDate(date: Date): string {
    try {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('日期格式化失败:', error)
      return '日期未知'
    }
  }


  /**
   * 格式化中文时间（特殊规则）
   * 1. 今天的话，只展示时:分（如 "14:30"）
   * 2. 一周内的消息，展示星期几 时:分（如 "星期三 14:30"）
   * 3. 今年的话，展示某月某日 时:分（如 "3月15日 14:30"）
   * 4. 其他非今年的消息，展示某月某日 时:分（如 "3月15日 14:30"）
   * @param date 要格式化的日期，可以是 Date 对象、字符串或 null/undefined
   * @returns 格式化后的时间字符串
   */
  static formatChineseTime(date: Date | string | null | undefined): string {
    try {
      // 处理空值情况
      if (!date) {
        return '时间未知'
      }
      
      // 转换为 Date 对象
      const targetDate = date instanceof Date ? date : new Date(date)
      
      // 检查时间是否有效
      if (isNaN(targetDate.getTime())) {
        return '时间未知'
      }
      
      const now = new Date()
      const currentYear = now.getFullYear()
      const targetYear = targetDate.getFullYear()
      
      // 检查是否是今天
      const isToday = now.toDateString() === targetDate.toDateString()
      
      // 检查是否在一周内（不包括今天）
      const diffInMs = now.getTime() - targetDate.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      const isWithinWeek = diffInDays > 0 && diffInDays <= 7
      
      const time = targetDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      if (isToday) {
        // 今天：只展示时:分
        return time
      } else if (isWithinWeek) {
        // 一周内：展示星期几 时:分
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        const weekday = weekdays[targetDate.getDay()]
        return `${weekday} ${time}`
      } else if (targetYear === currentYear) {
        // 今年：展示某月某日 时:分
        const month = targetDate.getMonth() + 1
        const day = targetDate.getDate()
        return `${month}月${day}日 ${time}`
      } else {
        // 其他非今年的消息：展示某月某日 时:分
        const month = targetDate.getMonth() + 1
        const day = targetDate.getDate()
        return `${month}月${day}日 ${time}`
      }
    } catch (error) {
      console.error('消息时间格式化失败:', error)
      return '时间未知'
    }
  }
}

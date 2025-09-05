import React from 'react'
import { TimeFormatter } from '@/utils/timeFormatter'
import styles from '../../css/chats/MessageTimeHeader.module.css'

interface MessageTimeHeaderProps {
  timestamp: string
}

export const MessageTimeHeader: React.FC<MessageTimeHeaderProps> = ({ timestamp }) => {
  return (
    <div className={styles.timeHeader}>
      <div className={styles.timeText}>
        {TimeFormatter.formatChineseTime(timestamp)}
      </div>
    </div>
  )
}

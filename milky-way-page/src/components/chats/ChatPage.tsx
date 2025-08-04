import React from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import styles from '../../css/App.module.css'

export const ChatPage: React.FC = () => {
  return (
    <div className={styles.mainContent}>
      <ChatList/>
      <ChatWindow/>
    </div>
  )
} 
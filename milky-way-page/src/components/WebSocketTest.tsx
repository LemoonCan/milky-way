import React, { useState, useEffect } from 'react'
import { useChatStore } from '../store/chat'
import { useAuthStore } from '../store/auth'

export const WebSocketTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('')
  const [testChatId, setTestChatId] = useState('test-chat-001')
  const [logs, setLogs] = useState<string[]>([])
  
  const { 
    isConnected, 
    connectionError, 
    initializeChatService, 
    sendMessageViaWebSocket,
    getChatMessages 
  } = useChatStore()
  
  const { isAuthenticated } = useAuthStore()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog(`认证状态: ${isAuthenticated ? '已登录' : '未登录'}`)
  }, [isAuthenticated])

  useEffect(() => {
    addLog(`连接状态: ${isConnected ? '已连接' : '未连接'}`)
    if (connectionError) {
      addLog(`连接错误: ${connectionError}`)
    }
  }, [isConnected, connectionError])

  const handleConnect = async () => {
    try {
      addLog('正在初始化聊天服务...')
      await initializeChatService()
      addLog('聊天服务初始化成功')
    } catch (error) {
      addLog(`初始化失败: ${error}`)
    }
  }

  const handleSendMessage = async () => {
    if (!testMessage.trim()) return
    
    try {
      addLog(`发送消息: ${testMessage}`)
      await sendMessageViaWebSocket(testChatId, testMessage)
      addLog('消息发送成功')
      setTestMessage('')
    } catch (error) {
      addLog(`发送失败: ${error}`)
    }
  }

  const testChatMessages = getChatMessages(testChatId)

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>WebSocket 实时通信测试</h2>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>连接状态</h3>
        <p>
          <strong>认证状态:</strong> {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
        </p>
        <p>
          <strong>WebSocket状态:</strong> {isConnected ? '✅ 已连接' : '❌ 未连接'}
        </p>
        {connectionError && (
          <p style={{ color: 'red' }}>
            <strong>错误:</strong> {connectionError}
          </p>
        )}
        <button onClick={handleConnect} disabled={isConnected}>
          {isConnected ? '已连接' : '连接WebSocket'}
        </button>
      </div>

      {/* 消息发送测试 */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>消息发送测试</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            聊天ID: 
            <input 
              type="text" 
              value={testChatId} 
              onChange={(e) => setTestChatId(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            value={testMessage} 
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="输入测试消息..."
            style={{ padding: '5px', width: '300px', marginRight: '10px' }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={!isConnected || !testMessage.trim()}>
            发送消息
          </button>
        </div>
      </div>

      {/* 接收到的消息 */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>接收到的消息 (Chat ID: {testChatId})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
          {testChatMessages.length === 0 ? (
            <p style={{ color: '#666' }}>暂无消息</p>
          ) : (
            testChatMessages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '10px', padding: '5px', backgroundColor: msg.sender === 'me' ? '#e3f2fd' : '#f5f5f5' }}>
                <strong>{msg.sender === 'me' ? '我' : '对方'}:</strong> {msg.content}
                <small style={{ display: 'block', color: '#666' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 日志 */}
      <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>操作日志</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {log}
            </div>
          ))}
        </div>
        <button onClick={() => setLogs([])} style={{ marginTop: '10px' }}>
          清空日志
        </button>
      </div>
    </div>
  )
}

export default WebSocketTest 